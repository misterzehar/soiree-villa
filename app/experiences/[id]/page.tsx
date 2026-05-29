import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, MapPin, Eye, Play, Heart } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { getCurrentTierInfo, formatPrice, formatDuration } from '@/lib/pricing'
import { getGradientForExperience } from '@/lib/profile-colors'
import { PROFILES } from '@/constants/profiles'
import type { Experience, MenuSocialAct } from '@/types/experience'
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
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const ACT_META = {
  entree:  { verb: 'Comprendre', type: 'Entrée',  Icon: Eye,   hostRole: "Il t'accueille, te présente le cadre, te met à l'aise." },
  plat:    { verb: 'Vivre',      type: 'Plat',    Icon: Play,  hostRole: "Il s'efface, observe, encourage si tu galères."        },
  dessert: { verb: 'Oser',       type: 'Dessert', Icon: Heart, hostRole: "Il facilite, sans jamais forcer."                      },
} as const

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const experience = await getExperience(id)
  if (!experience) notFound()

  const tierInfo = getCurrentTierInfo(experience)
  const gradient = getGradientForExperience(experience.compatible_profiles)
  const placesRestantes = experience.capacity_max - experience.capacity_current

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <div className="relative w-full aspect-video max-h-72 overflow-hidden">
        {experience.cover_image_url ? (
          <img
            src={experience.cover_image_url}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Back button */}
        <Link
          href="/experiences"
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white text-sm font-medium px-3 py-2 rounded-full backdrop-blur-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        {/* Title on overlay */}
        <h1 className="absolute bottom-4 left-4 right-4 font-display font-bold text-2xl text-white leading-tight">
          {experience.title}
        </h1>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-32 space-y-6">

        {/* Infos clés */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-text text-sm capitalize leading-snug">
                {formatDateLong(experience.date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-text text-sm">{formatDuration(experience.duration_minutes)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span className="text-text text-sm">{placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''} / {experience.capacity_max}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-text text-sm truncate">{experience.venue_name}</span>
            </div>
          </div>

          {/* Prix palier */}
          {!tierInfo.isSoldOut ? (
            <div className="border-t border-border pt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-text">
                  {formatPrice(tierInfo.tier.price_cents)}
                </span>
                <span className={[
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  tierInfo.tier.id === 'early'    ? 'bg-success/15 text-success' :
                  tierInfo.tier.id === 'standard' ? 'bg-primary/10 text-primary' :
                                                    'bg-error/10 text-error'
                ].join(' ')}>
                  {tierInfo.tier.label} — {tierInfo.placesRestantes} place{tierInfo.placesRestantes > 1 ? 's' : ''}
                </span>
              </div>
              {tierInfo.nextTier && (
                <p className="text-text-muted text-xs mt-1">
                  Bientôt en {tierInfo.nextTier.label.toLowerCase()} à {formatPrice(tierInfo.nextTier.price_cents)}
                </p>
              )}
            </div>
          ) : (
            <div className="border-t border-border pt-4">
              <p className="font-display font-bold text-xl text-text-muted">Complet</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-text text-sm leading-relaxed">{experience.description}</p>
        </div>

        {/* Menu social — 3 actes */}
        <section>
          <h2 className="font-display font-semibold text-xl text-text mb-4">
            Le menu social
          </h2>
          <div className="relative flex flex-col gap-0">
            {(Object.entries(ACT_META) as [keyof typeof ACT_META, (typeof ACT_META)[keyof typeof ACT_META]][]).map(
              ([key, meta], idx) => {
                const act: MenuSocialAct = experience.menu_social[key]
                const { Icon } = meta
                return (
                  <div key={key} className="relative flex gap-4">
                    {/* Vertical line */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 z-10">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {idx < 2 && (
                        <div className="w-0.5 flex-1 bg-border mt-1 mb-1 min-h-[24px]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6 flex-1">
                      <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-0.5">
                        {meta.verb} · {meta.type}
                      </p>
                      <h3 className="font-display font-semibold text-lg text-text leading-snug mb-1">
                        {act.label}
                      </h3>
                      <p className="text-text text-sm leading-relaxed mb-2">
                        {act.description}
                      </p>
                      <p className="text-text-muted text-xs">
                        {act.duration_minutes >= 60
                          ? `${formatDuration(act.duration_minutes)}`
                          : `${act.duration_minutes} min`}
                      </p>
                      <p className="text-text-muted text-xs italic mt-2">
                        {meta.hostRole}
                      </p>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </section>

        {/* Le lieu */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-xl text-text mb-2">Le lieu</h2>
          <div className="flex items-start gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-text font-medium text-sm">{experience.venue_name}</span>
          </div>
          <p className="text-text-muted text-sm leading-relaxed pl-6">
            {experience.venue_ambiance}
          </p>
        </section>

        {/* L'animateur */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-xl text-text mb-3">L&apos;animateur</h2>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
              {experience.organizer_name.charAt(0)}
            </div>
            <span className="font-medium text-text text-sm">{experience.organizer_name}</span>
          </div>
          {experience.organizer_bio && (
            <p className="text-text-muted text-sm leading-relaxed pl-13">
              {experience.organizer_bio}
            </p>
          )}
        </section>

        {/* Pour qui */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm">
          <h2 className="font-display font-semibold text-xl text-text mb-2">Pour qui</h2>
          <p className="text-text-muted text-sm mb-3">
            On a pensé cette soirée pour les profils :
          </p>
          <div className="flex flex-wrap gap-2">
            {experience.compatible_profiles.map(pid => {
              const profile = PROFILES.find(p => p.id === pid)
              if (!profile) return null
              return (
                <span
                  key={pid}
                  className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {profile.emoji} {profile.name}
                </span>
              )
            })}
          </div>
        </section>

      </div>

      {/* CTA sticky */}
      <StickyCtaBar experience={experience} tierInfo={tierInfo} />
    </main>
  )
}
