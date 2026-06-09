'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createOrganizerProfile } from './actions'

export default function OrganisateurInscriptionPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createOrganizerProfile(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-8 pb-20">

        <Link
          href="/compte"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mon compte
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Devenir organisateur
        </h1>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">
          Crée ton profil pour proposer tes propres soirées sur Soirée Villa.
          Une commission de 15&nbsp;% est retenue sur chaque inscription.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Nom public */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className="text-text text-sm font-medium">
              Nom affiché (visible par les participants)
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              minLength={2}
              maxLength={60}
              placeholder="Ex : Thomas M. · Soirée Villa Nice"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-text text-sm font-medium">
              Présentation courte <span className="text-text-muted font-normal">(optionnel)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={300}
              placeholder="Passionné d'expériences sociales depuis 5 ans…"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors resize-none"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <span className="text-text text-sm font-medium">Type d&apos;organisateur</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-3 cursor-pointer bg-surface border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="organizerType"
                  value="amateur"
                  defaultChecked
                  className="mt-0.5 accent-primary shrink-0"
                />
                <div>
                  <p className="font-medium text-text text-sm">Amateur</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    Tu organises des soirées pour le plaisir — style Airbnb Experiences.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer bg-surface border border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="organizerType"
                  value="pro"
                  className="mt-0.5 accent-primary shrink-0"
                />
                <div>
                  <p className="font-medium text-text text-sm">Professionnel</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    Tu exerces dans l&apos;événementiel — animation, facilitation, team-building.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Ville */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="text-text text-sm font-medium">
              Ville principale
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue="Nice"
              placeholder="Nice"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
            />
          </div>

          {error && (
            <p className="text-error text-sm bg-error/5 border border-error/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <p className="text-text-muted text-xs leading-relaxed bg-surface rounded-xl px-4 py-3 border border-border">
            ℹ️ Ton profil sera soumis à validation avant publication de ta première soirée.
            Tu seras notifié par email.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-display font-semibold py-4 rounded-2xl transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours…
              </>
            ) : (
              'Créer mon profil organisateur'
            )}
          </button>

        </form>
      </div>
    </main>
  )
}
