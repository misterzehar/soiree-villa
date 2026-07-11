import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check, Lock, Mail } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { getCurrentTierInfo, formatPrice } from '@/lib/pricing'
import { FALLBACK_EXPERIENCE } from '@/lib/fallback-image'
import type { Experience } from '@/types/experience'
import { RegisterForm } from './register-form'

const THEME_META: Record<string, { label: string }> = {
  mystere:   { label: 'Mystérieuse & Classe'      },
  sensuel:   { label: 'Sensuelle & Élégante'       },
  convivial: { label: 'Conviviale & Chaleureuse'   },
  creatif:   { label: 'Créative & Artistique'      },
  aventure:  { label: 'Aventure & Sensations'      },
  culturel:  { label: 'Culturelle & Intellectuelle' },
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [expResult, authClient] = await Promise.all([
    createServerSupabase()
      .from('experiences')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single(),
    createSupabaseServerClient(),
  ])

  if (!expResult.data) notFound()

  const experience = expResult.data as Experience
  const tierInfo = getCurrentTierInfo(experience)

  const { data: { user } } = await authClient.auth.getUser()
  let prefill: { firstName?: string; lastName?: string; email?: string } = {}
  if (user) {
    const { data: profile } = await createServerSupabase()
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    const parts = (profile?.display_name ?? '').split(' ')
    prefill = {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
      email: user.email ?? '',
    }
  }

  if (tierInfo.isSoldOut) {
    return (
      <main className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-8">😔</p>
        <h1 className="font-display font-light text-white text-2xl mb-6">
          Cette expérience est complète.
        </h1>
        <Link
          href={`/experiences/${id}`}
          className="border border-gold/60 text-gold text-sm px-6 py-3 hover:bg-gold/10 transition-colors duration-200"
        >
          Retour à la fiche
        </Link>
      </main>
    )
  }

  const { tier, placesRestantes, nextTier } = tierInfo
  const heroSrc = experience.cover_image_url ?? FALLBACK_EXPERIENCE
  const themeLabel = experience.theme
    ? (THEME_META[experience.theme]?.label ?? 'Expérience Soirée Villa')
    : 'Expérience Soirée Villa'

  return (
    <main className="min-h-screen bg-canvas px-6 md:px-8 py-12 md:py-16">

      {/* Retour */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link
          href={`/experiences/${id}`}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la fiche
        </Link>
      </div>

      {/* Grid 12 colonnes desktop / flex colonne mobile */}
      <div className="max-w-6xl mx-auto flex flex-col gap-10 md:grid md:grid-cols-12 md:gap-16 md:items-start">

        {/* ——— DROITE : formulaire (1er dans le DOM = en haut sur mobile) ——— */}
        <div className="md:col-span-7 md:col-start-6 md:row-start-1">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            Réservation
          </p>
          <h1
            className="font-display font-light text-white leading-tight tracking-[-0.02em] mt-2 mb-2"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Tes coordonnées
          </h1>
          <p className="text-white/60 mb-12">
            On te confirme tout par email dans 30 secondes.
          </p>

          {/* Urgence palier */}
          {placesRestantes <= 3 && (
            <div className="border border-gold/30 bg-gold/5 px-5 py-3 mb-10">
              <p className="text-gold/90 text-sm">
                ⚡ {placesRestantes} place{placesRestantes > 1 ? 's' : ''} au tarif {tier.label.toLowerCase()}.
                {nextTier && ` Ensuite : ${formatPrice(nextTier.price_cents)} ${nextTier.label.toLowerCase()}.`}
              </p>
            </div>
          )}

          <RegisterForm
            experience={experience}
            tierInfo={{ ...tierInfo, isSoldOut: false }}
            prefill={prefill}
          />
        </div>

        {/* ——— GAUCHE : récap commande (2ème dans le DOM = en bas sur mobile) ——— */}
        <div className="md:col-span-5 md:col-start-1 md:row-start-1">

          {/* Photo cover */}
          <div className="relative aspect-video overflow-hidden border border-gold/30 mb-8">
            <Image
              src={heroSrc}
              alt={experience.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Kicker + titre + date */}
          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-3">
            {themeLabel}
          </p>
          <p
            className="font-display font-light text-white leading-tight tracking-[-0.02em] mb-3"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
          >
            {experience.title}
          </p>
          <p className="text-white/60 text-sm capitalize">
            {formatDateLong(experience.date)} · {experience.venue_name}
          </p>

          <div className="h-px bg-gold/30 my-8" />

          {/* Bloc prix */}
          <p className="text-white/40 text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
            Tu paies
          </p>
          <p
            className="font-display font-light text-gold leading-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.03em' }}
          >
            {formatPrice(tier.price_cents)}
          </p>
          <p className="text-white/60 text-sm mt-3">
            {tier.label} · {placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}
          </p>

          <div className="h-px bg-gold/30 my-8" />

          {/* Garanties */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" />
              <p className="text-white/60 text-sm">Annulation gratuite jusqu&apos;à 48h avant</p>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" />
              <p className="text-white/60 text-sm">Paiement sécurisé par Stripe</p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" />
              <p className="text-white/60 text-sm">Confirmation immédiate par email</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
