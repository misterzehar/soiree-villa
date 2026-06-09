'use client'

import { useState, useTransition } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import { createExperience } from './actions'
import { PROFILES } from '@/constants/profiles'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-semibold text-base text-text border-b border-border pb-2 mb-4">
      {children}
    </h2>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  hint,
  children,
}: {
  label: string
  name?: string
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text text-sm font-medium">
        {label}
        {!required && <span className="text-text-muted font-normal ml-1">(optionnel)</span>}
      </label>
      {children ?? (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
        />
      )}
      {hint && <p className="text-text-muted text-xs">{hint}</p>}
    </div>
  )
}

function TextArea({ label, name, placeholder, required, rows = 3, hint }: {
  label: string; name: string; placeholder?: string; required?: boolean; rows?: number; hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text text-sm font-medium">
        {label}
        {!required && <span className="text-text-muted font-normal ml-1">(optionnel)</span>}
      </label>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors resize-none"
      />
      {hint && <p className="text-text-muted text-xs">{hint}</p>}
    </div>
  )
}

type MenuActProps = {
  phase: string
  emoji: string
  namePrefix: string
  defaultDuration: number
  placeholder: string
}

function MenuActSection({ phase, emoji, namePrefix, defaultDuration, placeholder }: MenuActProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-bg transition-colors"
      >
        <span className="font-medium text-text text-sm">
          {emoji} {phase}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 py-3 flex flex-col gap-3 bg-bg">
          <Field label="Titre de l'acte" name={`${namePrefix}Label`} placeholder={placeholder} required />
          <TextArea
            label="Description"
            name={`${namePrefix}Desc`}
            placeholder="Ce qui se passe pendant cet acte…"
            rows={2}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-text text-sm font-medium">Durée (minutes)</label>
            <select
              name={`${namePrefix}Duration`}
              defaultValue={defaultDuration}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            >
              {[15, 20, 25, 30, 40, 45, 60, 75, 90].map(v => (
                <option key={v} value={v}>{v} min</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export function CreateForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createExperience(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-6">

      {/* Section 1 — Infos générales */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <SectionTitle>1. Infos générales</SectionTitle>
        <Field label="Titre de la soirée" name="title" placeholder="Ex : Blind Test Mystère au Rooftop" required />
        <TextArea
          label="Description"
          name="description"
          rows={4}
          required
          placeholder="Décris l'ambiance, le concept, ce que les participants vivront…"
        />
      </section>

      {/* Section 2 — Lieu */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <SectionTitle>2. Lieu</SectionTitle>
        <Field label="Nom du lieu" name="venueName" placeholder="Ex : Rooftop Le Negresco" required />
        <Field
          label="Ambiance / style du lieu"
          name="venueAmbiance"
          placeholder="Ex : rooftop avec vue mer, lumières tamisées, 40 personnes max"
          hint="Aide les participants à visualiser l'endroit."
        />
      </section>

      {/* Section 3 — Date et durée */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <SectionTitle>3. Programmation</SectionTitle>
        <Field label="Date et heure" name="date" type="datetime-local" required />
        <div className="flex flex-col gap-1.5">
          <label className="text-text text-sm font-medium">Durée totale</label>
          <select
            name="durationMinutes"
            defaultValue={120}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          >
            {[60, 90, 120, 150, 180, 210, 240].map(v => (
              <option key={v} value={v}>{v} min ({Math.floor(v / 60)}h{v % 60 > 0 ? `${String(v % 60).padStart(2, '0')}` : ''})</option>
            ))}
          </select>
        </div>
      </section>

      {/* Section 4 — Menu social */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <SectionTitle>4. Menu social — Comprendre / Vivre / Oser</SectionTitle>
        <p className="text-text-muted text-xs -mt-2 mb-1 leading-relaxed">
          Les 3 actes de ton expérience. Ce ne sont pas des plats — ce sont des phases sociales.
        </p>
        <MenuActSection
          phase="Entrée — Comprendre"
          emoji="🧩"
          namePrefix="entree"
          defaultDuration={30}
          placeholder="Ex : Tour de table en musique, Le jeu des prénoms…"
        />
        <MenuActSection
          phase="Plat — Vivre"
          emoji="🎯"
          namePrefix="plat"
          defaultDuration={60}
          placeholder="Ex : Blind test par équipes, Atelier création cocktails…"
        />
        <MenuActSection
          phase="Dessert — Oser"
          emoji="✨"
          namePrefix="dessert"
          defaultDuration={30}
          placeholder="Ex : Question Jackpot, Partage libre autour d'un verre…"
        />
      </section>

      {/* Section 5 — Tarification */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <SectionTitle>5. Tarification (paliers Shotgun)</SectionTitle>
        <p className="text-text-muted text-xs -mt-2 leading-relaxed">
          Laisse à 0 les paliers que tu n&apos;utilises pas.
          Les places se vendent dans l&apos;ordre : Early bird → Standard → Last chance.
        </p>
        {[
          { id: 'early', label: '🟢 Early bird', defaultQty: 5, defaultPrice: 15 },
          { id: 'standard', label: '🔵 Standard', defaultQty: 10, defaultPrice: 20 },
          { id: 'last', label: '🔴 Last chance', defaultQty: 5, defaultPrice: 25 },
        ].map(tier => (
          <div key={tier.id} className="flex items-center gap-3">
            <span className="text-sm font-medium text-text w-28 shrink-0">{tier.label}</span>
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <label className="text-text-muted text-xs block mb-1">Places</label>
                <input
                  name={`${tier.id}Qty`}
                  type="number"
                  min={0}
                  max={200}
                  defaultValue={tier.defaultQty}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-text-muted text-xs block mb-1">Prix (€)</label>
                <input
                  name={`${tier.id}Price`}
                  type="number"
                  min={0}
                  step={0.5}
                  defaultValue={tier.defaultPrice}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Section 6 — Profils compatibles */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <SectionTitle>6. Profils compatibles</SectionTitle>
        <p className="text-text-muted text-xs -mt-2 mb-1 leading-relaxed">
          Quels profils sociaux se sentiront le plus à leur place lors de cette soirée ?
        </p>
        <div className="flex flex-col gap-2">
          {PROFILES.map(profile => (
            <label
              key={profile.id}
              className="flex items-center gap-3 cursor-pointer bg-bg border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                name="compatibleProfiles"
                value={profile.id}
                className="accent-primary shrink-0"
              />
              <span className="text-xl shrink-0">{profile.emoji}</span>
              <div>
                <p className="text-text text-sm font-medium">{profile.name}</p>
                <p className="text-text-muted text-xs">{profile.tagline}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

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
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Création en cours…
          </>
        ) : (
          'Soumettre ma soirée'
        )}
      </button>

    </form>
  )
}
