'use client'

import { useState } from 'react'
import Link from 'next/link'
import { joinWaitlist } from '@/app/actions'

export function EmptyState() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    const result = await joinWaitlist(formData)
    if ('error' in result) {
      setErrorMsg(result.error ?? 'Une erreur est survenue.')
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <span className="text-5xl mb-4">🦗</span>
      <h2 className="font-display font-semibold text-xl text-text mb-2">
        On n&apos;a pas encore d&apos;expérience pour ton style.
      </h2>
      <p className="text-text-muted text-sm mb-6 max-w-xs">
        Laisse-nous ton email, on te prévient dès qu&apos;on en organise une.
      </p>

      {status === 'success' ? (
        <p className="text-success font-medium text-sm">
          ✓ Parfait, on te tient au courant !
        </p>
      ) : (
        <form action={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="ton@email.com"
            required
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-text-muted"
          />
          {status === 'error' && (
            <p className="text-error text-xs">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary hover:bg-primary/90 text-white font-display font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Envoi…' : 'Me prévenir'}
          </button>
        </form>
      )}

      <Link
        href="/onboarding"
        className="mt-6 text-text-muted text-sm hover:text-text transition-colors"
      >
        Refaire le quiz
      </Link>
    </div>
  )
}
