'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Save, Settings } from 'lucide-react'

interface SettingsData {
  id: string
  pa_name: string
  pa_tagline: string
  founder_intro: string
  auto_reply_enabled: boolean
  auto_classify: boolean
  email_notifications: boolean
  push_notifications: boolean
  working_hours_start: string
  working_hours_end: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('owner_id', user.id)
        .single()
      setSettings(data)
      setIsLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!settings) return
    setIsSaving(true)
    const { error } = await supabase
      .from('settings')
      .update({
        pa_name: settings.pa_name,
        pa_tagline: settings.pa_tagline,
        founder_intro: settings.founder_intro,
        auto_reply_enabled: settings.auto_reply_enabled,
        auto_classify: settings.auto_classify,
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        working_hours_start: settings.working_hours_start,
        working_hours_end: settings.working_hours_end,
      })
      .eq('id', settings.id)

    if (error) toast.error('Failed to save settings')
    else toast.success('Settings saved')
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        Settings not found. Make sure your account has admin role.
      </div>
    )
  }

  function Toggle({ label, value, onChange, description }: {
    label: string; value: boolean; onChange: (v: boolean) => void; description?: string
  }) {
    return (
      <div className="flex items-start justify-between gap-4 py-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
            value ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              value ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Configure how Forgeit PA behaves</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* PA Identity */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="px-4 py-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            PA Identity
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">PA Name</label>
            <input
              value={settings.pa_name}
              onChange={(e) => setSettings((p) => p ? { ...p, pa_name: e.target.value } : p)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">PA Tagline</label>
            <input
              value={settings.pa_tagline}
              onChange={(e) => setSettings((p) => p ? { ...p, pa_tagline: e.target.value } : p)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Founder Introduction (shown to PA in context)
            </label>
            <textarea
              value={settings.founder_intro ?? ''}
              onChange={(e) => setSettings((p) => p ? { ...p, founder_intro: e.target.value } : p)}
              rows={4}
              placeholder="Tell the PA more about you and your work style..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="px-4 py-3">
          <h2 className="font-semibold text-sm">Working Hours</h2>
        </div>
        <div className="p-4 flex gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1.5">Start</label>
            <input
              type="time"
              value={settings.working_hours_start}
              onChange={(e) => setSettings((p) => p ? { ...p, working_hours_start: e.target.value } : p)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1.5">End</label>
            <input
              type="time"
              value={settings.working_hours_end}
              onChange={(e) => setSettings((p) => p ? { ...p, working_hours_end: e.target.value } : p)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="px-4 py-3">
          <h2 className="font-semibold text-sm">Automation</h2>
        </div>
        <div className="px-4 divide-y divide-border">
          <Toggle
            label="Auto Reply"
            value={settings.auto_reply_enabled}
            onChange={(v) => setSettings((p) => p ? { ...p, auto_reply_enabled: v } : p)}
            description="PA automatically responds to all incoming messages"
          />
          <Toggle
            label="Auto Classify"
            value={settings.auto_classify}
            onChange={(v) => setSettings((p) => p ? { ...p, auto_classify: v } : p)}
            description="AI automatically classifies and prioritizes requests"
          />
          <Toggle
            label="Email Notifications"
            value={settings.email_notifications}
            onChange={(v) => setSettings((p) => p ? { ...p, email_notifications: v } : p)}
            description="Receive email alerts for new high-priority requests"
          />
          <Toggle
            label="Push Notifications"
            value={settings.push_notifications}
            onChange={(v) => setSettings((p) => p ? { ...p, push_notifications: v } : p)}
            description="Browser push notifications for new requests"
          />
        </div>
      </div>
    </div>
  )
}
