import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminTopBar from '@/components/admin/TopBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'member'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
