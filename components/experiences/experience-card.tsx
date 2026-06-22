'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { PROFILES } from '@/constants/profiles'
import { getCurrentTierInfo, formatPrice } from '@/lib/pricing'
import { getGradientForExperience } from '@/lib/profile-colors'
import { getThemeStyle } from '@/lib/theme-style'
import type { Experience } from '@/types/experience'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function matchBadgeColor(score: number): string {
  if (score >= 80) return 'bg-success/90'
  if (score >= 60) return 'bg-primary/90'
  return 'bg-text-muted/80'
}

export function ExperienceCard({
  experience,
  index = 0,
  matchScore,
}: {
  experience: Experience
  index?: number
  matchScore?: number
}) {
  const tierInfo = getCurrentTierInfo(experience)
  const gradient = getGradientForExperience(experience.compatible_profiles)
  const themeStyle = getThemeStyle(experience.theme ?? null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/experiences/${experience.id}`}
        className={`block bg-surface rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] ${themeStyle ? themeStyle.accentBorder + ' border' : ''}`}
      >
        {/* Cover image / gradient fallback */}
        <div className="relative w-full aspect-video overflow-hidden">
          {experience.cover_image_url ? (
            <img
              src={experience.cover_image_url}
              alt={experience.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${themeStyle ? themeStyle.gradient : gradient}`} />
          )}

          {/* Theme badge — bottom left on image */}
          {themeStyle && (
            <span className={`absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm border ${themeStyle.badgeBg} ${themeStyle.badgeText} border-white/10`}>
              {themeStyle.emoji} {themeStyle.label}
            </span>
          )}

          {/* Match score badge — top left */}
          {matchScore !== undefined && (
            <span className={`absolute top-3 left-3 ${matchBadgeColor(matchScore)} text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm`}>
              {matchScore}% match
            </span>
          )}

          {/* Status badges — top right */}
          {!tierInfo.isSoldOut && tierInfo.tier.id === 'last' && (
            <span className="absolute top-3 right-3 bg-error/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              Last chance
            </span>
          )}
          {tierInfo.isSoldOut && (
            <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              Complet
            </span>
          )}
        </div>

        <div className="p-4">
          <h2 className="font-display font-semibold text-lg text-text leading-snug mb-1">
            {experience.title}
          </h2>
          <p className="text-text-muted text-sm mb-2 capitalize">
            {formatDate(experience.date)}
          </p>
          <div className="flex items-center gap-1 text-text-muted text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{experience.venue_name}</span>
          </div>

          {/* Profile tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {experience.compatible_profiles.map(pid => {
              const profile = PROFILES.find(p => p.id === pid)
              if (!profile) return null
              return (
                <span
                  key={pid}
                  className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {profile.emoji} {profile.name.replace(/^(L['']|Le |La )/, '')}
                </span>
              )
            })}
          </div>

          {/* Price + places */}
          {!tierInfo.isSoldOut ? (
            <div>
              <p className="text-text font-semibold text-base">
                {formatPrice(tierInfo.tier.price_cents)}{' '}
                <span className="text-text-muted font-normal text-sm">
                  {tierInfo.tier.label} · {tierInfo.placesRestantes} place{tierInfo.placesRestantes > 1 ? 's' : ''} restante{tierInfo.placesRestantes > 1 ? 's' : ''}
                </span>
              </p>
              {tierInfo.nextTier && (
                <p className="text-text-muted text-xs mt-0.5">
                  puis {formatPrice(tierInfo.nextTier.price_cents)} {tierInfo.nextTier.label.toLowerCase()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-text-muted text-sm font-medium">Complet</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
