'use client'

import { useState, useTransition } from 'react'
import { createBrief } from '../actions'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'

type Props = { defaultCity: string }

export function BriefForm({ defaultCity }: Props) {
  const [targetType, setTargetType] = useState<'lieu' | 'fournisseur'>('lieu')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createBrief(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Type */}
      <div>
        <p className="text-sm font-medium text-text mb-2">Type de besoin *</p>
        <div className="grid grid-cols-2 gap-2">
          {(['lieu', 'fournisseur'] as const).map(t => (
            <label
              key={t}
              className={`flex items-center gap-2 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                targetType === t
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-text-muted hover:border-text-muted'
              }`}
            >
              <input
                type="radio"
                name="target_type"
                value={t}
                checked={targetType === t}
                onChange={() => setTargetType(t)}
                className="sr-only"
              />
              <span className="text-sm font-medium capitalize">{t === 'lieu' ? '🏠 Lieu' : '🎵 Prestataire'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Catégorie (fournisseur seulement) */}
      {targetType === 'fournisseur' && (
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Catégorie de prestataire *
          </label>
          <select
            name="target_category"
            required
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-primary/40 transition-colors"
          >
            <option value="">Choisir…</option>
            {Object.entries(FOURNISSEUR_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Titre du brief *</label>
        <input
          name="title"
          required
          placeholder="Ex : Recherche rooftop 50 personnes pour soirée thématique"
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Description *</label>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="Décrivez le contexte, les contraintes, l'ambiance souhaitée…"
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors resize-none"
        />
      </div>

      {/* Ville */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Ville *</label>
        <input
          name="city"
          required
          defaultValue={defaultCity}
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Date événement */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Date de l&apos;événement *</label>
        <input
          type="date"
          name="event_date"
          required
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-primary/40 transition-colors"
        />
        <p className="text-text-muted text-xs mt-1">Les offres seront acceptées jusqu&apos;à 7 jours avant la date.</p>
      </div>

      {/* Budget estimé (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Budget estimé (€, optionnel)</label>
        <input
          type="number"
          name="budget_estimate"
          min="0"
          step="50"
          placeholder="Ex : 800"
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {error && (
        <p className="text-error text-sm bg-error/5 border border-error/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {isPending ? 'Publication en cours…' : 'Publier l\'appel d\'offres'}
      </button>

      <p className="text-text-muted text-xs text-center leading-relaxed">
        En publiant, les partenaires matchants (ville + type) seront notifiés par email.
      </p>
    </form>
  )
}
