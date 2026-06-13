'use client'

import { Bell, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  profile: { full_name?: string | null; email: string }
}

export default function AdminTopBar({ profile }: Props) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
      <div className="md:hidden font-semibold text-sm">Forgeit PA</div>
      <div className="hidden md:block" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={signOut}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
