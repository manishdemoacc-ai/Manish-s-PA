import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const client = new Anthropic()

const TrainRequestSchema = z.object({
  instruction: z.string().min(5).max(1000),
})

interface ProfileRow {
  role: string
}

interface MemoryRow {
  key: string
  value: string
  category: string
  importance: number
  source: string
  is_active: boolean
  [key: string]: unknown
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single() as { data: ProfileRow | null }

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = TrainRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const { instruction } = parsed.data

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are extracting memory rules for an executive assistant AI.
The founder said: "${instruction}"
Extract one or more memory entries. Return ONLY a valid JSON array:
[
  {
    "key": "snake_case_unique_key",
    "value": "clear instruction for the PA",
    "category": "rules|preferences|identity|company|personal",
    "importance": 1-10
  }
]
No explanation. Only JSON.`,
      },
    ],
  })

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('')

  try {
    const memories = JSON.parse(rawText.replace(/```json|```/g, '').trim())
    const results: MemoryRow[] = []

    for (const mem of memories) {
      const { data, error } = await (supabase
        .from('memories') as any)
        .upsert(
          {
            key: mem.key,
            value: mem.value,
            category: mem.category ?? 'rules',
            importance: mem.importance ?? 7,
            source: 'founder_training',
            is_active: true,
          },
          { onConflict: 'key' }
        )
        .select()
        .single() as { data: MemoryRow | null; error: unknown }

      if (!error && data) results.push(data)
    }

    return NextResponse.json({ success: true, memories: results })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
