'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { FOURNISSEUR_AXES_QUESTIONS } from '@/constants/axes-questions'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import type { Fournisseur, FournisseurCategory } from '@/types/fournisseur'

export type FournisseurInitialData = Partial<
  Pick<Fournisseur, 'category' | 'city' | 'description' | 'photo_url' | 'price_range' | 'website_url' | 'axes_scores'>
>

type Props = {
  action: (fd: FormData) => Promise<{ error: string } | void>
  initialData?: FournisseurInitialData
  showName?: boolean
  submitLabel?: string
}

function InputField({
  label, name, placeholder, required, hint, type = 'text', defaultValue,
}: {
  label: string; name: string; placeholder?: string; required?: boolean
  hint?: string; type?: string; defaultValue?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text text-sm font-medium">
        {label}
        {!required && <span className="text-text-muted font-normal ml-1">(optionnel)</span>}
      </label>
      <input
        name={name} type={type} required={required} placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
      />
      {hint && <p className="text-text-muted text-xs">{hint}</p>}
    </div>
  )
}

export function FournisseurForm({ action, initialData, showName = false, submitLabel = 'Enregistrer' }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) setError(result.error)
    })
  }

  const d = initialData ?? {}

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-6">

      {showName && (
        <div className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-4">
            1. Identité
          </h2>
          <InputField label="Nom de votre structure" name="name" required placeholder="Ex : SoundFactory DJ" />
        </div>
      )}

      {/* Infos */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-2">
          {showName ? '2.' : '1.'} Votre activité
        </h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-text text-sm font-medium">Catégorie</label>
          <select
            name="category"
            defaultValue={d.category ?? ''}
            required
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          >
            <option value="" disabled>Choisir une catégorie…</option>
            {(Object.entries(FOURNISSEUR_CATEGORY_LABELS) as [FournisseurCategory, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <InputField label="Ville principale" name="city" required placeholder="Nice" defaultValue={d.city ?? 'Nice'} />
        <div className="flex flex-col gap-1.5">
          <label className="text-text text-sm font-medium">
            Description
            <span className="text-text-muted font-normal ml-1">(optionnel)</span>
          </label>
          <textarea
            name="description" rows={3} placeholder="Décrivez votre activité, votre style, votre expérience…"
            defaultValue={d.description ?? ''}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors resize-none"
          />
        </div>
        <InputField label="Fourchette de prix" name="price_range" placeholder="Ex : 200–500 € / soirée" defaultValue={d.price_range ?? ''} hint="Indicatif, pour aider les organisateurs." />
      </div>

      {/* Médias */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-2">
          {showName ? '3.' : '2.'} Médias & liens
        </h2>
        <InputField label="URL photo / logo" name="photo_url" placeholder="https://…" defaultValue={d.photo_url ?? ''} hint="URL d'une image hébergée en ligne." />
        <InputField label="Site web ou réseau social" name="website_url" placeholder="https://instagram.com/…" defaultValue={d.website_url ?? ''} />
      </div>

      {/* Axes */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-5">
        <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-1">
          {showName ? '4.' : '3.'} Votre profil
        </h2>
        <p className="text-text-muted text-xs -mt-3 leading-relaxed">
          Ces 4 questions servent à matcher votre prestation avec les bonnes soirées.
        </p>
        {FOURNISSEUR_AXES_QUESTIONS.map(q => {
          const current = d.axes_scores?.[q.axis]
          return (
            <div key={q.axis} className="flex flex-col gap-2">
              <p className="text-text text-sm font-medium">{q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 cursor-pointer bg-bg border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name={q.name}
                      value={opt.value}
                      defaultChecked={current !== undefined ? String(current) === opt.value : opt.value === '-1'}
                      required
                      className="accent-primary mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-text text-sm">{opt.label}</p>
                      {opt.hint && <p className="text-text-muted text-xs mt-0.5">{opt.hint}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charter — uniquement à la création */}
      {showName && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="charterAccepted"
            required
            className="mt-0.5 accent-primary shrink-0 w-4 h-4"
          />
          <span className="text-text-muted text-sm leading-relaxed">
            J&apos;ai lu et j&apos;accepte la{' '}
            <a
              href="/charte-fournisseur"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              charte prestataire
            </a>
            {' '}de Soirée Villa.
          </span>
        </label>
      )}

      {error && (
        <p className="text-error text-sm bg-error/5 border border-error/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-display font-semibold py-4 rounded-2xl shadow-md transition-colors"
      >
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</> : submitLabel}
      </button>
    </form>
  )
}
