'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'magic'>('login')
  const [magicSent, setMagicSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    setMagicSent(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold leading-tight">Forgeit PA</h1>
            <p className="text-xs text-muted-foreground">Admin Access</p>
          </div>
        </div>

        {magicSent ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
            <div className="text-3xl">📬</div>
            <h2 className="font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Try a different method
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-lg">Sign in</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {mode === 'login' ? 'Enter your credentials' : 'Get a magic link by email'}
              </p>
            </div>

            <form onSubmit={mode === 'login' ? handleLogin : handleMagicLink} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@forgeit.co"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {mode === 'login' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Send Magic Link'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setMode(mode === 'login' ? 'magic' : 'login')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === 'login' ? 'Use magic link instead' : 'Sign in with password'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">
            ← Back to public assistant
          </a>
        </p>
      </div>
    </div>
  )
}
