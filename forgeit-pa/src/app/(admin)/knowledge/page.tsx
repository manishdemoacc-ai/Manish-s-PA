import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen, Tag } from 'lucide-react'

export default async function KnowledgePage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('knowledge_base')
    .select('id, title, category, tags, is_active, use_count, updated_at')
    .order('updated_at', { ascending: false })

  const categoryColors: Record<string, string> = {
    about_founder: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    about_company: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    services: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    faqs: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    preferences: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    policies: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    team: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {entries?.length ?? 0} entries · PA searches this before answering
          </p>
        </div>
        <Link
          href="/admin/knowledge/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Link>
      </div>

      <div className="grid gap-3">
        {(entries ?? []).length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">No entries yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add knowledge so the PA can answer questions accurately.</p>
          </div>
        ) : (
          (entries ?? []).map((entry) => (
            <Link
              key={entry.id}
              href={`/admin/knowledge/${entry.id}`}
              className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{entry.title}</p>
                  {!entry.is_active && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[entry.category] ?? categoryColors.other}`}>
                    {entry.category.replace(/_/g, ' ')}
                  </span>
                  {(entry.tags ?? []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs flex items-center gap-0.5 text-muted-foreground">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0 text-right">
                <p>{entry.use_count}× used</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
