'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, Brain } from 'lucide-react'

const exampleInstructions = [
  "When someone asks for a website, always ask for their budget range before anything else.",
  "Client requests with budget above ₹1 lakh are always HIGH priority.",
  "I prefer video calls over in-person meetings unless they're in Chennai.",
  "Partnership requests from edtech companies are always HIGH priority.",
  "When media requests arrive, ask for the publication name and article topic first.",
  "I'm available for calls after 5 PM IST on weekdays and anytime on weekends.",
]

export default function TrainPage() {
  const [instruction, setInstruction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ key: string; value: string; category: string }[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleTrain() {
    if (!instruction.trim() || isLoading) return

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      setResult(data.memories)
      setInstruction('')
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Train My PA</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Teach Forgeit PA how to handle requests your way.
        </p>
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Brain className="w-4 h-4" />
          New Instruction
        </div>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='e.g. "When partnership requests arrive, ask for the company website first."'
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <button
          onClick={handleTrain}
          disabled={!instruction.trim() || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? 'Teaching PA...' : 'Teach PA'}
        </button>
      </div>

      {/* Success */}
      {result && result.length > 0 && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            PA learned {result.length} rule{result.length > 1 ? 's' : ''}
          </div>
          {result.map((mem) => (
            <div key={mem.key} className="text-xs bg-white dark:bg-black/20 rounded-lg p-2.5 border border-green-200 dark:border-green-800">
              <span className="font-mono text-muted-foreground">{mem.key}</span>
              <p className="text-sm mt-0.5">{mem.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Examples */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Example Instructions</h2>
        <div className="space-y-2">
          {exampleInstructions.map((ex) => (
            <button
              key={ex}
              onClick={() => setInstruction(ex)}
              className="w-full text-left text-sm px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
            >
              <span className="text-muted-foreground text-xs">Try →</span>{' '}
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
