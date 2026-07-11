import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, Users, MapPin } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { getCurrentTierInfo, formatPrice, formatDuration } from '@/lib/pricing'
import { PROFILES } from '@/constants/profiles'
import { FALLBACK_EXPERIENCE } from '@/lib/fallback-image'
import type { Experience } from '@/types/experience'
import { StickyCtaBar } from './sticky-cta'

export const revalidate = 60

async function getExperience(id: string): Promise<Experience | null> {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()
  return data as Experience | null
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

const ACT_META = {
  entree:  { number: '01', verb: 'Comprendre', type: 'Entrée',  hostRole: "Il t'accueille, te présente le cadre, te met à l'aise." },
  plat:    { number: '02', verb: 'Vivre',      type: 'Plat',    hostRole: "Il s'efface, observe, encourage si tu galères."        },
  dessert: { number: '03', verb: 'Oser',       type: 'Dessert', hostRole: 'Il facilite, sans jamais forcer.'                     },
} as const

const THEME_META: Record<string, { emoji: string; label: string }> = {
  mystere:   { emoji: '🕵️', label: 'Mystérieuse & Classe'      },
  sensuel:   { emoji: '💋', label: 'Sensuelle & Élégante'       },
  convivial: { emoji: '🍷', label: 'Conviviale & Chaleureuse'   },
  creatif:   { emoji: '🎨', label: 'Créative & Artistique'      },
  aventure:  { emoji: '⚡', label: 'Aventure & Sensations'      },
  culturel:  { emoji: '📚', label: 'Culturelle & Intellectuelle' },
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const experience = await getExperience(id)
  if (!experience) notFound()

  const tierInfo       = getCurrentTierInfo(experience)
  const placesRestantes = experience.capacity_max - experience.capacity_current
  const heroSrc         = experience.cover_image_url ?? FALLBACK_EXPERIENCE
  const themeMeta       = experience.theme ? (THEME_META[experience.theme] ?? null) : null
  const kicker          = themeMeta
    ? `${themeMeta.emoji} ${themeMeta.label}`
    : 'Expérience Soirée Villa'

  return (
    <main className="min-h-screen">

      {/* ═══════════════════════════════════════════
          1. HERO CINÉMATIQUE plein écran
      ═══════════════════════════════════════════ */}
      <section className="relative h-[70svh] md:h-screen overflow-hidden">

        <Image
          src={heroSrc}
          alt={experience.title}
          fill
          priority
          className="object-cover"
        />

        {/* Triple gradient overlay : nav lisible en haut, photo respire au centre, titre au fond */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,11,18,0.55) 0%, rgba(12,11,18,0.12) 25%, rgba(12,11,18,0) 50%, rgba(12,11,18,0.12) 70%, rgba(12,11,18,0.95) 100%)',
          }}
        />

        {/* Contenu : retour en haut, titre en bas */}
        <div className="absolute inset-0 flex flex-col justify-between px-6 py-6 md:px-12 md:py-10">

          {/* TOP LEFT — Bouton retour */}
          <div>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm border border-white/20 bg-black/20 backdrop-blur-sm px-4 py-2 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>

          {/* BOTTOM — Kicker + H1 + Métadonnées */}
          <div className="max-w-4xl">
            <p className="text-gold text-[10px] font-medium tracking-[0.35em] uppercase mb-4">
              {kicker}
            </p>
            <h1
              className="font-display font-light text-white max-w-[16ch] mb-6 text-balance"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              }}
            >
              {experience.title}
            </h1>
            <p className="text-white/60 text-sm tracking-wide capitalize">
              {formatDateLong(experience.date)} · {experience.venue_name}
            </p>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. INFOS CLÉS — fond canvas (noir cinématique)
      ═══════════════════════════════════════════ */}
      <section className="bg-canvas py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">

          {/* Colonne gauche — Détails pratiques */}
          <div className="flex flex-col gap-8">

            <div className="flex items-start gap-4">
              <Calendar className="w-4 h-4 text-gold mt-1 shrink-0" />
              <div>
                <p className="text-gold text-[10px] font-medium tracking-[0.35em] uppercase mb-1">Date &amp; Heure</p>
                <p className="font-display font-light text-white text-lg leading-snug capitalize">
                  {formatDateLong(experience.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-4 h-4 text-gold mt-1 shrink-0" />
              <div>
                <p className="text-gold text-[10px] font-medium tracking-[0.35em] uppercase mb-1">Durée</p>
                <p className="font-display font-light text-white text-lg">
                  {formatDuration(experience.duration_minutes)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="w-4 h-4 text-gold mt-1 shrink-0" />
              <div>
                <p className="text-gold text-[10px] font-medium tracking-[0.35em] uppercase mb-1">Places</p>
                <p className="font-display font-light text-white text-lg">
                  {placesRestantes} restante{placesRestantes > 1 ? 's' : ''} / {experience.capacity_max}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-4 h-4 text-gold mt-1 shrink-0" />
              <div>
                <p className="text-gold text-[10px] font-medium tracking-[0.35em] uppercase mb-1">Lieu</p>
                <p className="font-display font-light text-white text-lg">
                  {experience.venue_name}
                </p>
              </div>
            </div>

          </div>

          {/* Colonne droite — Prix grande présence */}
          <div className="flex flex-col justify-center">
            {!tierInfo.isSoldOut ? (
              <>
                <p className="text-white/50 text-[10px] font-medium tracking-[0.3em] uppercase mb-3">
                  À partir de
                </p>
                <p
                  className="font-display font-light text-gold leading-none"
                  style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '-0.03em' }}
                >
                  {formatPrice(tierInfo.tier.price_cents)}
                </p>
                <p className="text-white/70 text-sm mt-3">
                  {tierInfo.tier.label}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {tierInfo.placesRestantes} place{tierInfo.placesRestantes > 1 ? 's' : ''} à ce tarif
                </p>
                {tierInfo.nextTier && (
                  <p className="text-white/40 text-xs italic mt-3">
                    Puis {formatPrice(tierInfo.nextTier.price_cents)} {tierInfo.nextTier.label.toLowerCase()}
                  </p>
                )}
              </>
            ) : (
              <p
                className="font-display font-light text-white/40"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}
              >
                COMPLET
              </p>
            )}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. DESCRIPTION — fond clair éditorial
      ═══════════════════════════════════════════ */}
      <section className="bg-bg py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-text-muted text-[10px] font-medium tracking-[0.3em] uppercase mb-10">
            L&apos;expérience
          </p>
          <p
            className="font-display font-light text-text max-w-[68ch] text-balance"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', lineHeight: 1.6 }}
          >
            {experience.description}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. MENU SOCIAL — 3 actes théâtraux
      ═══════════════════════════════════════════ */}
      <section className="bg-canvas py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">

          <h2
            className="font-display font-light text-white text-center mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Le menu social
          </h2>
          <p className="text-white/50 text-sm md:text-base tracking-wide max-w-[42ch] mx-auto text-center italic mb-24 md:mb-32">
            Trois actes pour une soirée qui te ressemble
          </p>

          {/* Fil narratif vertical + 3 actes */}
          <div className="relative">

            {/* Ligne continue reliant les 3 actes */}
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-gold/40"
            />

            <div className="flex flex-col">
              {(['entree', 'plat', 'dessert'] as const).map((key, idx) => {
                const meta = ACT_META[key]
                const act  = experience.menu_social[key]
                const durLabel = act.duration_minutes >= 60
                  ? formatDuration(act.duration_minutes)
                  : `${act.duration_minutes} min`

                return (
                  <div key={key}>

                    {/* Ornement de transition entre actes */}
                    {idx > 0 && (
                      <div className="flex items-center justify-center gap-4 my-20 md:my-24" aria-hidden="true">
                        <div className="w-16 h-px bg-gold/30" />
                        <span className="text-gold/60 text-xs tracking-[0.5em]">✦</span>
                        <div className="w-16 h-px bg-gold/30" />
                      </div>
                    )}

                    <div className="text-center flex flex-col items-center py-4">

                      {/* Numéro outline — flotte sur le fil via masque bg-canvas */}
                      <div className="relative z-10 px-6 bg-canvas">
                        <p
                          className="font-display font-black text-transparent select-none leading-none"
                          style={{ fontSize: 'clamp(6rem, 12vw, 10rem)', WebkitTextStroke: '1px rgba(212,175,55,0.5)' } as React.CSSProperties}
                          aria-hidden="true"
                        >
                          {meta.number}
                        </p>
                      </div>

                      {/* Kicker : Type · Durée */}
                      <div className="inline-flex items-center gap-3 mt-4 mb-2">
                        <span className="text-gold text-[10px] font-medium tracking-[0.5em] uppercase">
                          {meta.type}
                        </span>
                        <span className="text-white/30 text-[10px]" aria-hidden="true">·</span>
                        <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase">
                          {durLabel}
                        </span>
                      </div>

                      {/* Verbe */}
                      <h3
                        className="font-display font-light text-white mt-2"
                        style={{
                          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                          letterSpacing: '-0.03em',
                          lineHeight: 1.05,
                        }}
                      >
                        {meta.verb}
                      </h3>

                      {/* Label de l'acte */}
                      <p
                        className="font-display font-medium text-white my-6 leading-snug"
                        style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
                      >
                        {act.label}
                      </p>

                      {/* Description de l'acte */}
                      <p
                        className="text-white/70 max-w-[52ch]"
                        style={{ fontSize: 'clamp(1rem, 1.75vw, 1.25rem)', lineHeight: 1.7 }}
                      >
                        {act.description}
                      </p>

                      {/* Rôle de l'hôte — bloc mis en valeur */}
                      <div className="mt-8 border-t border-white/10 pt-6 max-w-[52ch] mx-auto w-full">
                        <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-2">
                          L&apos;hôte
                        </p>
                        <p className="text-white/70 text-base leading-relaxed italic">
                          {meta.hostRole}
                        </p>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. LIEU + ANIMATEUR — fond clair
      ═══════════════════════════════════════════ */}
      <section className="bg-bg py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Le lieu */}
          <div>
            <p className="text-text-muted text-[10px] font-medium tracking-[0.3em] uppercase mb-6">
              Le lieu
            </p>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              <p className="font-display font-light text-text text-xl">{experience.venue_name}</p>
            </div>
            <p className="text-text-muted text-sm leading-relaxed pl-7">
              {experience.venue_ambiance}
            </p>
          </div>

          {/* L'animateur */}
          <div>
            <p className="text-text-muted text-[10px] font-medium tracking-[0.3em] uppercase mb-6">
              L&apos;animateur
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-light text-gold text-base shrink-0 border border-gold/30"
                style={{ backgroundColor: 'rgb(12,11,18)' }}
              >
                {experience.organizer_name.charAt(0)}
              </div>
              <p className="font-display font-light text-text text-xl">
                {experience.organizer_name}
              </p>
            </div>
            {experience.organizer_bio && (
              <p className="text-text-muted text-sm leading-relaxed pl-14">
                {experience.organizer_bio}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. PROFILS COMPATIBLES — fond canvas
      ═══════════════════════════════════════════ */}
      <section className="bg-canvas pt-16 md:pt-20 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/50 text-[10px] font-medium tracking-[0.3em] uppercase mb-6">
            Pour qui
          </p>
          <p className="text-white/60 text-sm mb-8">
            On a pensé cette soirée pour les profils :
          </p>
          <div className="flex flex-wrap gap-3">
            {experience.compatible_profiles.map(pid => {
              const profile = PROFILES.find(p => p.id === pid)
              if (!profile) return null
              return (
                <span
                  key={pid}
                  className="border border-gold/40 text-gold text-sm font-medium px-4 py-2 tracking-wide"
                >
                  {profile.emoji} {profile.name}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <StickyCtaBar experience={experience} tierInfo={tierInfo} />

    </main>
  )
}
