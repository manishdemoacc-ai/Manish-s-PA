import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'
import { buildAIContext, buildSystemPrompt } from '@/lib/ai/context'
import { z } from 'zod'

const client = new Anthropic()

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  visitorName: z.string().optional(),
  visitorEmail: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ChatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { message, sessionId, conversationId, visitorName, visitorEmail } = parsed.data
    const supabase = await createServiceClient()

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const { data: conv, error: convError } = await ((supabase
  .from('conversations') as any)
  .insert({
    session_id: sessionId,
    channel: 'web',
    visitor_name: visitorName,
    visitor_email: visitorEmail,
    visitor_ip: req.headers.get('x-forwarded-for') ?? undefined,
  })
  .select('id')
  .single())

      if (convError || !conv) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }
      convId = conv.id
    }

    // Load conversation history (last 10 messages)
    const { data: history } = await supabase
  .from('conversation_messages')
  .select('role, content')
  .eq('conversation_id', convId!)
  .order('created_at', { ascending: true })
  .limit(10)

    // Save user message
    await ((supabase.from('conversation_messages') as any).insert({
  conversation_id: convId,
  role: 'user',
  content: message,
}))

    // Build AI context
    const { memories, knowledge } = await buildAIContext(message)
    const systemPrompt = buildSystemPrompt(memories, knowledge)

    // Build messages array
    const messages: Anthropic.MessageParam[] = [
      ...(history ?? []).map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Call Claude
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const assistantMessage = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('')

    // Save assistant message
    await ((supabase.from('conversation_messages') as any).insert({
  conversation_id: convId,
  role: 'assistant',
  content: assistantMessage,
  tokens_used: response.usage.output_tokens,
}))

    // Check if we should auto-create a request
    // Simple heuristic: if conversation has 4+ user messages and no request yet
    const { count } = await supabase
      .from('conversation_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', convId)
      .eq('role', 'user')

    const { data: conv } = await supabase
      .from('conversations')
      .select('request_id, visitor_name, visitor_email')
      .eq('id', convId)
      .single()

    if ((count ?? 0) >= 3 && conv && !conv.request_id) {
      // Auto-classify and create request in background
      classifyAndCreateRequest(convId, supabase).catch(console.error)
    }

    return NextResponse.json({
      message: assistantMessage,
      conversationId: convId,
      tokensUsed: response.usage.output_tokens,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function classifyAndCreateRequest(convId: string, supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  // Get full conversation
  const { data: messages } = await supabase
    .from('conversation_messages')
    .select('role, content, created_at')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })

  const { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', convId)
    .single()

  if (!messages || !conv) return

  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n')

  const classifyResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Classify this conversation and extract information. Return ONLY valid JSON with no explanation:
{
  "category": "client_lead|team_request|partnership|event_invitation|media_request|personal_request|vendor_request|investor_inquiry|general_inquiry",
  "priority": "critical|high|medium|low",
  "title": "short descriptive title max 60 chars",
  "summary": "2-3 sentence summary",
  "requester_name": "extracted name or null",
  "requester_email": "extracted email or null",
  "collected_data": {}
}

Conversation:
${conversationText}`,
      },
    ],
  })

  const rawText = classifyResponse.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('')

  try {
    const classification = JSON.parse(rawText.replace(/```json|```/g, '').trim())

    const { data: request } = await ((supabase
  .from('requests') as any)
  .insert({
    conversation_id: convId,
    title: classification.title ?? 'New Request',
    description: classification.summary,
    category: classification.category ?? 'general_inquiry',
    priority: classification.priority ?? 'medium',
    status: 'new',
    requester_name: classification.requester_name ?? conv.visitor_name,
    requester_email: classification.requester_email ?? conv.visitor_email,
    ai_summary: classification.summary,
    ai_classification: classification,
    collected_data: classification.collected_data ?? {},
  })
  .select('id')
  .single())

    if (request) {
      await ((supabase
  .from('conversations') as any)
  .update({ request_id: request.id })
  .eq('id', convId))

      // Notify admin
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (adminProfiles && adminProfiles.length > 0) {
        await ((supabase.from('notifications') as any).insert(
          adminProfiles.map((p) => ({
          recipient_id: p.id,
        type: 'request' as const,
        title: `New ${classification.priority} priority request`,
        body: classification.title,
        action_url: `/admin/requests/${request.id}`,
          reference_id: request.id,
        reference_type: 'request',
  }))
))
    }
    }
  } catch (e) {
    console.error('Classification parse error:', e)
  }
}
