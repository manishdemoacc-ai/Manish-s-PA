'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Inbox, CheckSquare, Calendar, BookOpen,
  Brain, Users, BarChart2, Sparkles, Settings, Zap, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/requests',      icon: Inbox,           label: 'Requests' },
  { href: '/admin/tasks',         icon: CheckSquare,     label: 'Tasks' },
  { href: '/admin/meetings',      icon: Calendar,        label: 'Meetings' },
  { href: '/admin/knowledge',     icon: BookOpen,        label: 'Knowledge' },
  { href: '/admin/memory',        icon: Brain,           label: 'Memory' },
  { href: '/admin/team',          icon: Users,           label: 'Team' },
  { href: '/admin/analytics',     icon: BarChart2,       label: 'Analytics' },
  { href: '/admin/train',         icon: Sparkles,        label: 'Train PA' },
  { href: '/admin/settings',      icon: Settings,        label: 'Settings' },
]

interface Props {
  profile: { full_name?: string | null; email: string; role: string }
}

export default function AdminSidebar({ profile }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Forgeit PA</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public PA
          </Link>
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{profile.full_name ?? profile.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
