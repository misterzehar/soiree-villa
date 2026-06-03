import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { getCurrentTierInfo, formatPrice } from '@/lib/pricing'
import { getGradientForExperience } from '@/lib/profile-colors'
import type { Experience } from '@/types/experience'
import { RegisterForm } from './register-form'

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' · ' + new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!data) notFound()

  const experience = data as Experience
  const tierInfo = getCurrentTierInfo(experience)
  const gradient = getGradientForExperience(experience.compatible_profiles)

  if (tierInfo.isSoldOut) {
    return (
      <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
        <p className="text-3xl mb-4">😔</p>
        <h1 className="font-display font-bold text-xl text-text mb-2">Cette expérience est complète.</h1>
        <Link href={`/experiences/${id}`} className="text-primary text-sm underline mt-2">
          Retour à la fiche
        </Link>
      </main>
    )
  }

  const { tier, placesRestantes, nextTier } = tierInfo

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-40">

        {/* Header */}
        <Link
          href={`/experiences/${id}`}
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Tu réserves ta place pour
        </h1>
        <p className="text-text-muted text-sm mb-6 capitalize">
          {experience.title} · {formatDateShort(experience.date)}
        </p>

        {/* Récap commande */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-4 mb-6">
          {/* Thumbnail */}
          <div className={`w-20 h-20 rounded-xl shrink-0 overflow-hidden bg-gradient-to-br ${gradient}`}>
            {experience.cover_image_url && (
              <img
                src={experience.cover_image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-text text-sm leading-snug truncate">
              {experience.title}
            </p>
            <p className="text-text-muted text-xs capitalize mt-0.5">
              {formatDateShort(experience.date)}
            </p>
          </div>
          {/* Price */}
          <div className="text-right shrink-0">
            <p className="font-display font-bold text-xl text-text">
              {formatPrice(tier.price_cents)}
            </p>
            <span className={[
              'inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5',
              tier.id === 'early'    ? 'bg-success/15 text-success' :
              tier.id === 'standard' ? 'bg-primary/10 text-primary' :
                                       'bg-error/10 text-error',
            ].join(' ')}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Urgency message */}
        {placesRestantes <= 3 && (
          <p className="text-warning text-sm bg-warning/10 border border-warning/20 rounded-xl px-4 py-2.5 mb-4">
            ⚡ Tu profites du tarif {tier.label.toLowerCase()} — il reste {placesRestantes} place{placesRestantes > 1 ? 's' : ''} à ce prix.
            {nextTier && ` Ensuite : ${formatPrice(nextTier.price_cents)} ${nextTier.label.toLowerCase()}.`}
          </p>
        )}

        {/* Form */}
        <RegisterForm experience={experience} tierInfo={{ ...tierInfo, isSoldOut: false }} />

      </div>
    </main>
  )
}
