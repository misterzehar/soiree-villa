'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, Loader2 } from 'lucide-react'
import { createCheckoutSession } from './actions'
import { formatPrice } from '@/lib/pricing'
import type { Experience, CurrentTierInfo } from '@/types/experience'

function InputField({
  label,
  name,
  type = 'text',
  autoComplete,
  error,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-text text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className={[
          'w-full border rounded-xl px-4 py-3 text-sm text-text bg-surface',
          'focus:outline-none focus:ring-2 focus:ring-primary/40',
          'placeholder:text-text-muted transition-colors',
          error ? 'border-error' : 'border-border focus:border-primary',
        ].join(' ')}
      />
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}

export function RegisterForm({
  experience,
  tierInfo,
}: {
  experience: Experience
  tierInfo: CurrentTierInfo & { isSoldOut: false }
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [cgu, setCgu] = useState(false)
  const [charte, setCharte] = useState(false)

  const { tier, placesRestantes, nextTier } = tierInfo

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    if (!cgu || !charte) {
      setErrorMsg('Tu dois accepter les deux cases pour continuer.')
      setStatus('error')
      return
    }

    const form = e.currentTarget
    const data = new FormData(form)

    setStatus('loading')
    setErrorMsg('')

    const result = await createCheckoutSession({
      experienceId: experience.id,
      firstName: data.get('firstName') as string,
      lastName: data.get('lastName') as string,
      email: data.get('email') as string,
    })

    if ('error' in result) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }

    window.location.href = result.url
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Form fields */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <InputField
          label="Prénom"
          name="firstName"
          autoComplete="given-name"
          error={fieldErrors.firstName}
        />
        <InputField
          label="Nom"
          name="lastName"
          autoComplete="family-name"
          error={fieldErrors.lastName}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cgu}
            onChange={e => setCgu(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary shrink-0"
          />
          <span className="text-text text-sm leading-relaxed">
            J&apos;accepte les{' '}
            <Link href="/charte" target="_blank" className="text-primary underline hover:no-underline">
              conditions générales et la politique d&apos;annulation
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={charte}
            onChange={e => setCharte(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary shrink-0"
          />
          <div>
            <span className="text-text text-sm leading-relaxed">
              J&apos;ai lu et j&apos;accepte la{' '}
              <Link href="/charte" target="_blank" className="text-primary underline hover:no-underline">
                charte de Soirée Villa
              </Link>
            </span>
            <p className="text-text-muted text-xs mt-0.5 italic">
              &laquo;&nbsp;Tu es là pour vivre l&apos;expérience, pas la subir ni la casser.&nbsp;&raquo;
            </p>
          </div>
        </label>
      </div>

      <p className="text-text-muted text-xs leading-relaxed">
        Tu recevras un email de confirmation après paiement. Annulation possible jusqu&apos;à 48h avant.
      </p>

      {errorMsg && (
        <p className="text-error text-sm bg-error/5 border border-error/20 rounded-xl px-4 py-3">
          {errorMsg}
        </p>
      )}

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-display font-semibold py-4 rounded-2xl shadow-md transition-colors duration-150"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirection vers le paiement…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Payer {formatPrice(tier.price_cents)}
              </>
            )}
          </button>
          {nextTier && (
            <p className="text-center text-text-muted text-xs mt-2">
              {tier.label} · {placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}
            </p>
          )}
          {/* Payment logos */}
          <p className="text-center text-text-muted text-xs mt-1.5">
            Visa · Mastercard · CB — Paiement sécurisé Stripe
          </p>
        </div>
      </div>
    </form>
  )
}
