import { createClient } from '@/lib/supabase/server'
import { Users, Mail, Phone } from 'lucide-react'

const roleColors: Record<string, string> = {
  founder: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  cto: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  cdo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  cmo: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  pro: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  developer: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  designer: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  member: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('is_active', { ascending: false })
    .order('role')

  const active = (members ?? []).filter((m) => m.is_active)
  const inactive = (members ?? []).filter((m) => !m.is_active)

  function MemberCard({ member }: { member: (typeof members)[0] }) {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 ${!member.is_active ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg font-bold text-primary">
            {member.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold text-sm">{member.full_name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${roleColors[member.role] ?? roleColors.member}`}>
                {member.role}
              </span>
            </div>
            {member.title && (
              <p className="text-xs text-muted-foreground mb-2">{member.title}</p>
            )}
            {member.responsibilities && member.responsibilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {member.responsibilities.map((r: string) => (
                  <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {r}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {member.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {member.email}
                </span>
              )}
              {member.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {member.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {active.length} active member{active.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {(members ?? []).length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No team members yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {active.map((m) => <MemberCard key={m.id} member={m} />)}
          </div>
          {inactive.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                Inactive
              </h2>
              {inactive.map((m) => <MemberCard key={m.id} member={m} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
