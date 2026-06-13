import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { KbEditor } from '@/components/knowledge/KbEditor'

export default async function KnowledgeEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('id', id)
    .single()

  if (!entry) notFound()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit Knowledge Entry</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Used {entry.use_count} times by the PA</p>
      </div>
      <KbEditor entry={entry} />
    </div>
  )
}
