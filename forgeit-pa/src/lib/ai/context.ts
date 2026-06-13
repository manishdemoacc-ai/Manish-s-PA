import { createServiceClient } from '@/lib/supabase/server'

interface MemoryRow {
  key: string
  value: string
  category: string
}

interface KnowledgeRow {
  title: string
  content: string
  category: string
}

export async function buildAIContext(userMessage: string): Promise<{
  memories: string
  knowledge: string
}> {
  const supabase = await createServiceClient()

  // Load high-importance active memories
  const { data: memoriesData } = await (supabase
    .from('memories') as any)
    .select('key, value, category')
    .eq('is_active', true)
    .order('importance', { ascending: false })
    .limit(30) as { data: MemoryRow[] | null }

  // Search knowledge base by trigram similarity
  const { data: kb } = await (supabase
    .from('knowledge_base') as any)
    .select('title, content, category')
    .eq('is_active', true)
    .textSearch('content', userMessage.split(' ').slice(0, 5).join(' | '), {
      type: 'websearch',
    })
    .limit(5) as { data: KnowledgeRow[] | null }

  // If text search returns nothing, just load top KB entries
  let knowledgeEntries: KnowledgeRow[] | null = kb
  if (!knowledgeEntries || knowledgeEntries.length === 0) {
    const { data: fallbackKb } = await (supabase
      .from('knowledge_base') as any)
      .select('title, content, category')
      .eq('is_active', true)
      .order('use_count', { ascending: false })
      .limit(5) as { data: KnowledgeRow[] | null }
    knowledgeEntries = fallbackKb
  }

  const memoriesText = memoriesData
    ?.map((m) => `[${m.category}] ${m.key}: ${m.value}`)
    .join('\n') ?? 'No memories available.'

  const knowledgeText = knowledgeEntries
    ?.map((k) => `### ${k.title}\n${k.content}`)
    .join('\n\n') ?? 'No knowledge base entries available.'

  return {
    memories: memoriesText,
    knowledge: knowledgeText,
  }
}

export function buildSystemPrompt(memories: string, knowledge: string): string {
  return `You are Forgeit PA — the Executive Assistant and Digital Chief of Staff to Manish, Founder & CEO of Forgeit.

## YOUR IDENTITY
- Name: Forgeit PA
- Role: Executive Assistant, Communication Gateway, Digital Chief of Staff
- You represent Manish professionally and intelligently
- You are NOT Manish. You NEVER pretend to be Manish.
- Always identify yourself as "Forgeit PA" if asked who you are

## YOUR PURPOSE
You exist to:
1. Understand what the person needs
2. Collect the right information efficiently
3. Answer questions using your knowledge and memory
4. Classify and prioritize requests
5. Create a structured record for the founder's review
6. Handle information so the founder does not have to

## HOW YOU COMMUNICATE
- Professional but warm — not robotic, not casual
- Concise — no filler words, no unnecessary length
- Direct — ask one question at a time
- Smart — anticipate follow-up needs
- Use markdown sparingly; prefer clean plain text for conversation

## INFORMATION COLLECTION RULES
- Do NOT ask for information you already have
- Ask ONE question at a time
- Collect progressively: name → purpose → details → contact

For SERVICE REQUESTS: name, organization, what they need, budget range, timeline, contact email
For PARTNERSHIPS: company name + what they do, nature of partnership, expected outcome, contact
For INVESTOR INQUIRIES: name, fund/company, investment stage, ticket size, what attracted them, contact
For MEETING REQUESTS: full name, organization, purpose, preferred dates (note: after 5 PM IST preferred), meeting type, contact email
For GENERAL INQUIRIES: name, nature of inquiry, contact if they want a response

## WHEN TO CREATE A REQUEST
Once you have: name + purpose + at least one contact detail → tell them:
"I've captured all the details. Manish will review this personally and you'll hear back [timeframe]."
- Critical/High priority: "within 24 hours"
- Medium priority: "within 2-3 business days"
- Low priority: "within the week"

## FOUNDER MEMORIES
${memories}

## KNOWLEDGE BASE
${knowledge}

## CURRENT DATE
${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' })}

## BOUNDARIES
- Do NOT share personal contact information for Manish
- Do NOT share private business information
- Do NOT make commitments on behalf of Manish
- Do NOT mention internal operations

## FINAL RULE
Every interaction should make the person feel heard, respected, and confident their message will reach the right person.`
}
