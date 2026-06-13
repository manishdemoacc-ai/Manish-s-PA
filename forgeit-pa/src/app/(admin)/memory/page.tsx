'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Brain, Plus, Trash2, Save, Star } from 'lucide-react'

interface Memory {
  id: string
  key: string
  value: string
  category: string
  importance: number
  is_active: boolean
  source?: string
  use_count: number
}

const CATEGORIES = ['identity', 'company', 'preferences', 'rules', 'personal', 'general']

export default function MemoryPage() {
  const supabase = createClient()
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemory, setNewMemory] = useState({
    key: '', value: '', category: 'general', importance: 7,
  })

  useEffect(() => {
    loadMemories()
  }, [])

  async function loadMemories() {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .order('importance', { ascending: false })
    setMemories(data ?? [])
    setIsLoading(false)
  }

  async function updateMemory(id: string, value: string) {
    const { error } = await supabase
      .from('memories')
      .update({ value })
      .eq('id', id)

    if (error) { toast.error('Failed to update'); return }
    toast.success('Memory updated')
    setEditingId(null)
    loadMemories()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('memories').update({ is_active: !current }).eq('id', id)
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_active: !current } : m))
    )
  }

  async function deleteMemory(id: string) {
    if (!confirm('Delete this memory? The PA will forget this.')) return
    await supabase.from('memories').delete().eq('id', id)
    setMemories((prev) => prev.filter((m) => m.id !== id))
    toast.success('Memory deleted')
  }

  async function addMemory() {
    if (!newMemory.key.trim() || !newMemory.value.trim()) {
      toast.error('Key and value are required')
      return
    }
    const key = newMemory.key.trim().replace(/\s+/g, '_').toLowerCase()
    const { error } = await supabase.from('memories').upsert(
      { ...newMemory, key, source: 'manual' },
      { onConflict: 'key' }
    )
    if (error) { toast.error('Failed to add. Key may already exist.'); return }
    toast.success('Memory added')
    setShowAddForm(false)
    setNewMemory({ key: '', value: '', category: 'general', importance: 7 })
    loadMemories()
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = memories.filter((m) => m.category === cat)
    return acc
  }, {} as Record<string, Memory[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Digital Memory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {memories.filter((m) => m.is_active).length} active memories · PA uses these in every conversation
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" />
            New Memory
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Key (snake_case)</label>
              <input
                value={newMemory.key}
                onChange={(e) => setNewMemory((p) => ({ ...p, key: e.target.value }))}
                placeholder="e.g. client_min_budget"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Category</label>
              <select
                value={newMemory.category}
                onChange={(e) => setNewMemory((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Value</label>
            <textarea
              value={newMemory.value}
              onChange={(e) => setNewMemory((p) => ({ ...p, value: e.target.value }))}
              placeholder="What should the PA remember?"
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Importance: {newMemory.importance}/10
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={newMemory.importance}
              onChange={(e) => setNewMemory((p) => ({ ...p, importance: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addMemory}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Save className="w-3.5 h-3.5" />
              Save Memory
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Memory groups */}
      {CATEGORIES.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        return (
          <div key={cat} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
              {cat}
            </h2>
            <div className="space-y-1.5">
              {items.map((mem) => (
                <div
                  key={mem.id}
                  className={`bg-card border rounded-xl p-3 transition-opacity ${
                    mem.is_active ? 'border-border opacity-100' : 'border-border opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{mem.key}</span>
                        <div className="flex">
                          {Array.from({ length: Math.min(mem.importance, 5) }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {mem.source && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {mem.source}
                          </span>
                        )}
                      </div>

                      {editingId === mem.id ? (
                        <div className="flex gap-2">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={2}
                            className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => updateMemory(mem.id, editValue)}
                              className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 border border-border rounded text-xs hover:bg-accent"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-sm cursor-pointer hover:text-muted-foreground transition-colors"
                          onClick={() => { setEditingId(mem.id); setEditValue(mem.value) }}
                          title="Click to edit"
                        >
                          {mem.value}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(mem.id, mem.is_active)}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          mem.is_active
                            ? 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {mem.is_active ? 'on' : 'off'}
                      </button>
                      <button
                        onClick={() => deleteMemory(mem.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
