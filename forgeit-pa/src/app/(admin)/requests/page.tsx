import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; category?: string }>
}) {
  const filters = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.category) query = query.eq('category', filters.category)

  const { data: requests } = await query

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Requests</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{requests?.length ?? 0} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['new', 'reviewing', 'waiting', 'completed', 'rejected'].map((s) => (
          <a
            key={s}
            href={`/admin/requests?status=${s}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
              filters.status === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-accent'
            }`}
          >
            {s}
          </a>
        ))}
        {filters.status && (
          <a
            href="/admin/requests"
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent"
          >
            Clear filters
          </a>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {(requests ?? []).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No requests found.</p>
            </div>
          ) : (
            (requests ?? []).map((req) => (
              <a
                key={req.id}
                href={`/admin/requests/${req.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">{req.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{req.requester_name ?? 'Unknown'}</span>
                    {req.requester_email && <span>{req.requester_email}</span>}
                    <span className="capitalize">{req.category.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[req.priority]}`}>
                    {req.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {format(new Date(req.created_at), 'MMM d')}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
