'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { LIEU_AXES_QUESTIONS } from '@/constants/axes-questions'
import type { Lieu } from '@/types/lieu'

export type LieuInitialData = Partial<
  Pick<Lieu, 'address' | 'city' | 'capacity' | 'ambiance' | 'lieu_type' | 'photo_url' | 'website_url' | 'axes_scores'>
>

type Props = {
  action: (fd: FormData) => Promise<{ error: string } | void>
  initialData?: LieuInitialData
  showName?: boolean  // true uniquement sur la page inscription (create)
  submitLabel?: string
}

const LIEU_TYPE_OPTIONS = [
  { value: 'salle',       label: 'Salle' },
  { value: 'rooftop',     label: 'Rooftop' },
  { value: 'plein_air',   label: 'Plein air' },
  { value: 'bar',         label: 'Bar' },
  { value: 'restaurant',  label: 'Restaurant' },
  { value: 'atelier',     label: 'Atelier' },
  { value: 'autre',       label: 'Autre' },
]

function InputField({
  label, name, placeholder, required, hint, type = 'text', defaultValue,
}: {
  label: string; name: string; placeholder?: string; required?: boolean
  hint?: string; type?: string; defaultValue?: string | number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text text-sm font-medium">
        {label}
        {!required && <span className="text-text-muted font-normal ml-1">(optionnel)</span>}
      </label>
      <input
        name={name} type={type} required={required} placeholder={placeholder}
        defaultValue={defaultValue as string}
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
      />
      {hint && <p className="text-text-muted text-xs">{hint}</p>}
    </div>
  )
}

export function LieuForm({ action, initialData, showName = false, submitLabel = 'Enregistrer' }: Props) {
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

      {/* Nom — uniquement à la création */}
      {showName && (
        <div className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-4">
            1. Identité
          </h2>
          <InputField label="Nom du lieu" name="name" required placeholder="Ex : Le Rooftop 360" />
        </div>
      )}

      {/* Infos pratiques */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-2">
          {showName ? '2.' : '1.'} Infos pratiques
        </h2>
        <InputField label="Adresse" name="address" placeholder="10 promenade des Anglais, Nice" defaultValue={d.address ?? ''} />
        <InputField label="Ville" name="city" required placeholder="Nice" defaultValue={d.city ?? 'Nice'} />
        <InputField label="Capacité max" name="capacity" type="number" placeholder="30" defaultValue={d.capacity ?? ''} hint="Nombre de personnes maximum." />
        <div className="flex flex-col gap-1.5">
          <label className="text-text text-sm font-medium">Type de lieu</label>
          <select
            name="lieu_type"
            defaultValue={d.lieu_type ?? 'salle'}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          >
            {LIEU_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <InputField label="Ambiance / style" name="ambiance" placeholder="Moderne et épuré, vue mer, lumières tamisées…" defaultValue={d.ambiance ?? ''} />
      </div>

      {/* Médias */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-2">
          {showName ? '3.' : '2.'} Médias & liens
        </h2>
        <InputField label="URL photo principale" name="photo_url" placeholder="https://…" defaultValue={d.photo_url ?? ''} hint="URL d'une image hébergée en ligne." />
        <InputField label="Site web" name="website_url" placeholder="https://votresite.fr" defaultValue={d.website_url ?? ''} />
      </div>

      {/* Axes */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-5">
        <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-1">
          {showName ? '4.' : '3.'} Profil de votre lieu
        </h2>
        <p className="text-text-muted text-xs -mt-3 leading-relaxed">
          Ces 4 questions servent à matcher votre lieu avec les bonnes expériences.
        </p>
        {LIEU_AXES_QUESTIONS.map(q => {
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
