'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createCheckoutSession } from './actions'
import type { Experience, CurrentTierInfo } from '@/types/experience'

function InputField({
  label,
  name,
  type = 'text',
  autoComplete,
  defaultValue,
  error,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  defaultValue?: string
  error?: string
}) {
  return (
    <div className="flex flex-col mb-8">
      <label htmlFor={name} className="text-white/50 text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        defaultValue={defaultValue}
        className={[
          'w-full bg-transparent border-b px-0 py-3',
          'text-white text-lg placeholder:text-white/20',
          'focus:outline-none transition-colors duration-200',
          'rounded-none appearance-none',
          error ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-gold',
        ].join(' ')}
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  )
}

export function RegisterForm({
  experience,
  tierInfo,
  prefill = {},
}: {
  experience: Experience
  tierInfo: CurrentTierInfo & { isSoldOut: false }
  prefill?: { firstName?: string; lastName?: string; email?: string }
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [cgu, setCgu] = useState(false)
  const [charte, setCharte] = useState(false)

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

  // fieldErrors is set server-side; keep the ref to avoid ts unused-var warning
  void fieldErrors

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">

      <InputField
        label="Prénom"
        name="firstName"
        autoComplete="given-name"
        defaultValue={prefill.firstName}
      />
      <InputField
        label="Nom"
        name="lastName"
        autoComplete="family-name"
        defaultValue={prefill.lastName}
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={prefill.email}
      />

      {/* Checkboxes */}
      <div className="flex flex-col gap-5 mb-10">

        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={cgu}
            onChange={e => setCgu(e.target.checked)}
            className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer accent-gold"
          />
          <span className="text-white/70 text-sm leading-relaxed">
            J&apos;accepte les{' '}
            <Link href="/charte" target="_blank" className="text-gold underline hover:no-underline">
              conditions générales et la politique d&apos;annulation
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={charte}
            onChange={e => setCharte(e.target.checked)}
            className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer accent-gold"
          />
          <div>
            <span className="text-white/70 text-sm leading-relaxed">
              J&apos;ai lu et j&apos;accepte la{' '}
              <Link href="/charte" target="_blank" className="text-gold underline hover:no-underline">
                charte de Soirée Villa
              </Link>
            </span>
            <p className="text-white/40 text-xs mt-1 italic">
              &laquo;&nbsp;Tu es là pour vivre l&apos;expérience, pas la subir ni la casser.&nbsp;&raquo;
            </p>
          </div>
        </label>

      </div>

      {/* Erreur */}
      {errorMsg && (
        <div className="border border-red-400/30 bg-red-400/5 px-5 py-4 mb-8">
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* CTA Ghost Doré — inline, pas sticky */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full md:w-auto md:min-w-[280px] inline-flex items-center justify-center gap-3 border border-gold/60 bg-transparent text-gold font-medium tracking-[0.15em] uppercase text-sm px-10 py-5 hover:bg-gold/10 hover:border-gold focus-visible:border-gold focus-visible:bg-gold/15 focus-visible:outline-none transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            Redirection...
          </>
        ) : (
          <>
            Continuer vers le paiement
            <span aria-hidden="true" className="tracking-normal normal-case">→</span>
          </>
        )}
      </button>

      <p className="text-white/30 text-xs mt-5">
        Visa · Mastercard · CB — Paiement sécurisé Stripe
      </p>

    </form>
  )
}
