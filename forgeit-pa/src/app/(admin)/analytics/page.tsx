import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Category breakdown
  const { data: byCat } = await supabase
    .from('requests')
    .select('category')

  // Priority breakdown
  const { data: byPriority } = await supabase
    .from('requests')
    .select('priority')

  // Status breakdown
  const { data: byStatus } = await supabase
    .from('requests')
    .select('status')

  // Last 30 days by day
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recent } = await supabase
    .from('requests')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Count helpers
  function countBy<T>(items: T[], key: keyof T) {
    return (items ?? []).reduce((acc: Record<string, number>, item) => {
      const val = String(item[key])
      acc[val] = (acc[val] ?? 0) + 1
      return acc
    }, {})
  }

  const catCounts = countBy(byCat ?? [], 'category')
  const priCounts = countBy(byPriority ?? [], 'priority')
  const statusCounts = countBy(byStatus ?? [], 'status')

  const priorityOrder = ['critical', 'high', 'medium', 'low']
  const statusOrder = ['new', 'reviewing', 'waiting', 'completed', 'rejected']

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    reviewing: 'bg-purple-500',
    waiting: 'bg-yellow-500',
    completed: 'bg-green-500',
    rejected: 'bg-red-400',
  }

  const totalRequests = (byCat ?? []).length
  const totalConversations = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
  const totalTasks = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })

  function BarSection({
    title,
    data,
    total,
    order,
    colorMap,
  }: {
    title: string
    data: Record<string, number>
    total: number
    order: string[]
    colorMap: Record<string, string>
  }) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">{title}</h2>
        {total === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {order.map((key) => {
              const count = data[key] ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${colorMap[key] ?? 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Communication and productivity metrics</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Requests', value: totalRequests },
          { label: 'Conversations', value: totalConversations.count ?? 0 },
          { label: 'Total Tasks', value: totalTasks.count ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BarSection
          title="Requests by Priority"
          data={priCounts}
          total={totalRequests}
          order={priorityOrder}
          colorMap={priorityColors}
        />
        <BarSection
          title="Requests by Status"
          data={statusCounts}
          total={totalRequests}
          order={statusOrder}
          colorMap={statusColors}
        />
      </div>

      {/* Category breakdown */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Requests by Category</h2>
        {totalRequests === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(catCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {cat.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent activity summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-semibold text-sm mb-1">Last 30 Days</h2>
        <p className="text-3xl font-bold">{(recent ?? []).length}</p>
        <p className="text-xs text-muted-foreground">new requests received</p>
      </div>
    </div>
  )
}
