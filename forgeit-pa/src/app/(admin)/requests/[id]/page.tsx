import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react'
import Link from 'next/link'

const priorityColors: Record<string, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}
const statusColors: Record<string, string> = {
  new: 'status-new',
  reviewing: 'status-reviewing',
  waiting: 'status-waiting',
  completed: 'status-completed',
  rejected: 'status-rejected',
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: req } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!req) notFound()

  const { data: messages } = req.conversation_id
    ? await supabase
        .from('conversation_messages')
        .select('role, content, created_at')
        .eq('conversation_id', req.conversation_id)
        .order('created_at', { ascending: true })
    : { data: [] }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back */}
      <Link
        href="/admin/requests"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Requests
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-lg font-semibold leading-tight">{req.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[req.priority]}`}>
              {req.priority}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[req.status]}`}>
              {req.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {req.requester_name && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>{req.requester_name}</span>
            </div>
          )}
          {req.requester_email && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span>{req.requester_email}</span>
            </div>
          )}
          {req.requester_phone && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{req.requester_phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(req.created_at), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground capitalize">
          Category: <span className="text-foreground font-medium">{req.category.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* AI Summary */}
      {req.ai_summary && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-2">AI Summary</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{req.ai_summary}</p>
        </div>
      )}

      {/* Collected Data */}
      {req.collected_data && Object.keys(req.collected_data).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-3">Collected Information</h2>
          <dl className="space-y-2">
            {Object.entries(req.collected_data).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm">
                <dt className="text-muted-foreground capitalize flex-shrink-0 w-32">
                  {k.replace(/_/g, ' ')}:
                </dt>
                <dd className="font-medium">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Status Update */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3">Update Status</h2>
        <form action={async (formData: FormData) => {
          'use server'
          const { createClient } = await import('@/lib/supabase/server')
          const sb = await createClient()
          const status = formData.get('status') as string
          await sb.from('requests').update({ status }).eq('id', id)
        }}>
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={req.status}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['new', 'reviewing', 'waiting', 'completed', 'rejected'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Update
            </button>
          </div>
        </form>
      </div>

      {/* Conversation */}
      {messages && messages.length > 0 && (
        <div className="bg-card border border-border rounded-xl">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Conversation ({messages.length} messages)</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
