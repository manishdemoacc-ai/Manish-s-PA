import { createClient } from '@/lib/supabase/server'
import { Inbox, CheckSquare, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalRequests },
    { count: newRequests },
    { count: highPriority },
    { count: pendingTasks },
    { count: pendingMeetings },
    { data: recentRequests },
  ] = await Promise.all([
    supabase.from('requests').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('requests').select('*', { count: 'exact', head: true }).in('priority', ['critical', 'high']).neq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['todo', 'in_progress']),
    supabase.from('meeting_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('requests')
      .select('id, title, category, priority, status, requester_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const metrics = [
    { label: 'Total Requests', value: totalRequests ?? 0, icon: Inbox, color: 'text-blue-500' },
    { label: 'New / Unread', value: newRequests ?? 0, icon: AlertCircle, color: 'text-orange-500' },
    { label: 'High Priority', value: highPriority ?? 0, icon: TrendingUp, color: 'text-red-500' },
    { label: 'Pending Tasks', value: pendingTasks ?? 0, icon: CheckSquare, color: 'text-purple-500' },
    { label: 'Meeting Requests', value: pendingMeetings ?? 0, icon: Calendar, color: 'text-green-500' },
  ]

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your Forgeit PA command center</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-card border border-border rounded-xl">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Recent Requests</h2>
          <a href="/admin/requests" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </a>
        </div>
        <div className="divide-y divide-border">
          {(recentRequests ?? []).length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No requests yet.</p>
              <p className="text-xs text-muted-foreground mt-1">New requests will appear here when visitors use the public chat.</p>
            </div>
          ) : (
            (recentRequests ?? []).map((req) => (
              <a
                key={req.id}
                href={`/admin/requests/${req.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{req.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {req.requester_name ?? 'Unknown'} · {req.category.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[req.priority]}`}>
                    {req.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-semibold text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Add Knowledge', href: '/admin/knowledge', icon: '📚' },
            { label: 'Train PA', href: '/admin/train', icon: '🧠' },
            { label: 'Add Task', href: '/admin/tasks', icon: '✅' },
            { label: 'View Analytics', href: '/admin/analytics', icon: '📊' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
            >
              <span>{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
