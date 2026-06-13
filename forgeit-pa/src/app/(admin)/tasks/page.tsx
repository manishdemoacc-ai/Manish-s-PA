'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, CheckSquare, Clock, Circle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  created_at: string
}

const STATUSES = ['todo', 'in_progress', 'waiting', 'done', 'cancelled']

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  todo: { label: 'To Do', icon: Circle, color: 'text-blue-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
  waiting: { label: 'Waiting', icon: Clock, color: 'text-orange-500' },
  done: { label: 'Done', icon: CheckSquare, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-400' },
}

const priorityColors: Record<string, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

export default function TasksPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', due_date: '',
  })

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    setTasks(data ?? [])
    setIsLoading(false)
  }

  async function createTask() {
    if (!newTask.title.trim()) { toast.error('Title required'); return }
    const { error } = await supabase.from('tasks').insert({
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      status: 'todo',
    })
    if (error) { toast.error('Failed to create task'); return }
    toast.success('Task created')
    setShowForm(false)
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '' })
    loadTasks()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('tasks').update({
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    }).eq('id', id)
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['list', 'kanban'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                  view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* New Task Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm">New Task</h3>
          <input
            value={newTask.title}
            onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
            placeholder="Task title"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex gap-3">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['critical', 'high', 'medium', 'low'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask((p) => ({ ...p, due_date: e.target.value }))}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={createTask}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              Create Task
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tasks yet. Create one above.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const sc = statusConfig[task.status]
              return (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="bg-transparent text-xs border border-border rounded px-2 py-1 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{statusConfig[s]?.label ?? s}</option>
                    ))}
                  </select>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STATUSES.map((status) => {
            const sc = statusConfig[status]
            const col = tasks.filter((t) => t.status === status)
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <sc.icon className={`w-3.5 h-3.5 ${sc.color}`} />
                  <span className="text-xs font-semibold">{sc.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{col.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {col.map((task) => (
                    <div
                      key={task.id}
                      className="bg-card border border-border rounded-lg p-3 text-xs space-y-1"
                    >
                      <p className="font-medium leading-tight">{task.title}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
