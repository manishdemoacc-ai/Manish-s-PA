import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Calendar, Mail, Building2, Clock } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

export default async function MeetingsPage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('meeting_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const pending = (meetings ?? []).filter((m) => m.status === 'pending')
  const others = (meetings ?? []).filter((m) => m.status !== 'pending')

  function MeetingCard({ meeting }: { meeting: (typeof meetings)[0] }) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">{meeting.requester_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{meeting.purpose}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[meeting.status]}`}>
            {meeting.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {meeting.company && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {meeting.company}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {meeting.requester_email}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meeting.duration_mins} min · {meeting.meeting_type}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(meeting.created_at), 'MMM d, yyyy')}
          </span>
        </div>

        {meeting.agenda && (
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Agenda: </span>
            {meeting.agenda}
          </div>
        )}

        {meeting.preferred_dates && meeting.preferred_dates.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Preferred: </span>
            {(meeting.preferred_dates as string[]).join(', ')}
          </div>
        )}

        {meeting.status === 'pending' && (
          <MeetingActions meetingId={meeting.id} />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Meeting Requests</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {pending.length} pending · {(meetings ?? []).length} total
        </p>
      </div>

      {(meetings ?? []).length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No meeting requests yet.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                Pending Review
              </h2>
              {pending.map((m) => <MeetingCard key={m.id} meeting={m} />)}
            </div>
          )}
          {others.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                All Meetings
              </h2>
              {others.map((m) => <MeetingCard key={m.id} meeting={m} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Client component for actions
function MeetingActions({ meetingId }: { meetingId: string }) {
  return (
    <div className="flex gap-2">
      <form action={async () => {
        'use server'
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        await supabase.from('meeting_requests').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', meetingId)
      }}>
        <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
          Confirm
        </button>
      </form>
      <form action={async () => {
        'use server'
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        await supabase.from('meeting_requests').update({ status: 'rejected' }).eq('id', meetingId)
      }}>
        <button type="submit" className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-accent transition-colors">
          Decline
        </button>
      </form>
    </div>
  )
}
