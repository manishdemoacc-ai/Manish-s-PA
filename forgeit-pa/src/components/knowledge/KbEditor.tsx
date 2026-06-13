'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Save, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react'

const CATEGORIES = [
  'about_founder', 'about_company', 'services', 'faqs',
  'preferences', 'policies', 'team', 'other',
]

interface Props {
  entry?: {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    is_active: boolean
  }
}

export function KbEditor({ entry }: Props) {
  const isNew = !entry
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(entry?.title ?? '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [category, setCategory] = useState(entry?.category ?? 'other')
  const [tagsInput, setTagsInput] = useState((entry?.tags ?? []).join(', '))
  const [isActive, setIsActive] = useState(entry?.is_active ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setIsSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

    if (isNew) {
      const { error } = await supabase.from('knowledge_base').insert({
        title, content, category, tags, is_active: isActive,
      })
      if (error) { toast.error('Failed to save'); setIsSaving(false); return }
      toast.success('Entry created')
      router.push('/admin/knowledge')
    } else {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ title, content, category, tags, is_active: isActive })
        .eq('id', entry!.id)
      if (error) { toast.error('Failed to save'); setIsSaving(false); return }
      toast.success('Entry updated')
      router.refresh()
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!entry || !confirm('Delete this entry? The PA will no longer use it.')) return
    setIsDeleting(true)
    await supabase.from('knowledge_base').delete().eq('id', entry.id)
    toast.success('Entry deleted')
    router.push('/admin/knowledge')
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isActive ? 'Active' : 'Inactive'}
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. About AirO2 Aerospace"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the knowledge content. The PA will use this verbatim when answering questions."
            rows={8}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
              Tags (comma separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. aviation, startup, airo2"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
