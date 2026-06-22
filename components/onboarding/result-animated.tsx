'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import type { Profile } from '@/constants/profiles'
import type { AxesTarget } from '@/constants/profiles'

const EASE = [0.16, 1, 0.3, 1] as const

// Gradient backgrounds per profile id
const PROFILE_GRADIENTS: Record<string, string> = {
  explorer_festif:        'from-orange-500/30 via-accent/20 to-primary/10',
  connecteur_social:      'from-primary/30 via-success/15 to-secondary/10',
  cerebrale_curieux:      'from-secondary/30 via-primary/15 to-[#1a0533]/20',
  empathique_calme:       'from-success/20 via-primary/10 to-[#e8f5f0]/30',
  creatif_libre:          'from-accent/30 via-secondary/20 to-gold/15',
  observateur_profond:    'from-[#0d1a3e]/50 via-primary/20 to-secondary/10',
  animateur_creatif:      'from-accent/40 via-[#ff5500]/20 to-gold/15',
  philosophe_festif:      'from-secondary/30 via-primary/20 to-accent/10',
  boheme_collectif:       'from-terracotta/25 via-accent/15 to-secondary/10',
  chef_de_projet:         'from-primary/30 via-success/15 to-[#e8f0ff]/20',
  stratege_reseauteur:    'from-[#1a1a3e]/40 via-primary/25 to-secondary/15',
  artiste_intime:         'from-wine/25 via-secondary/15 to-[#2a0033]/10',
  sage_creatif:           'from-gold/20 via-secondary/15 to-primary/10',
  mediateur_discret:      'from-success/20 via-[#e8f5f0]/30 to-primary/5',
  hote_chaleureux:        'from-accent/30 via-[#ffe0d0]/20 to-primary/10',
  disciple_du_flow:       'from-electric/10 via-primary/15 to-secondary/10',
  explorateur_interieur:  'from-[#0d1a3e]/40 via-secondary/20 to-primary/10',
  conteur_social:         'from-accent/25 via-secondary/15 to-primary/10',
  alchimiste_social:      'from-gold/20 via-accent/15 to-secondary/10',
  contemplatif_inspire:   'from-[#0d2233]/40 via-primary/15 to-secondary/5',
}

const AXIS_META: Record<string, { label: string; positive: string; negative: string }> = {
  energy:     { label: 'Énergie',    positive: 'Extraverti',   negative: 'Introverti'    },
  structure:  { label: 'Structure',  positive: 'Structuré',    negative: 'Spontané'      },
  depth:      { label: 'Profondeur', positive: 'Profond',      negative: 'Léger'         },
  sociality:  { label: 'Socialité',  positive: 'Grand groupe', negative: 'Petit comité'  },
  cerebrale:  { label: 'Cérébrale',  positive: 'Analytique',   negative: 'Instinctif'    },
  creativite: { label: 'Créativité', positive: 'Créatif',      negative: 'Conventionnel' },
}

const AXES_ORDER = ['energy', 'structure', 'depth', 'sociality', 'cerebrale', 'creativite'] as const

type Props = {
  profile: Profile
  userAxes: AxesTarget
  shareUrl: string
}

export function ResultAnimated({ profile, userAxes, shareUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const gradient = PROFILE_GRADIENTS[profile.id] ?? 'from-primary/20 via-secondary/10 to-transparent'

  function handleShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <main
      className={`min-h-screen flex flex-col items-center px-4 pt-10 pb-20 relative overflow-hidden`}
    >
      {/* Dynamic background */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center text-text-muted text-xs font-semibold tracking-[0.2em] uppercase mb-8"
        >
          Ton profil social
        </motion.p>

        {/* Profile badge — scale in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl text-5xl">
            {profile.emoji}
          </div>
        </motion.div>

        {/* Name + tagline stagger */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
          className="font-display font-bold text-2xl md:text-3xl text-center text-text mb-2"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
          className="text-text-muted text-sm text-center leading-relaxed mb-5 max-w-xs mx-auto"
        >
          {profile.tagline}
        </motion.p>

        {/* Traits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {profile.traits.map((trait, i) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE, delay: 0.55 + i * 0.07 }}
              className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full"
            >
              {trait}
            </motion.span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-border p-5 mb-5"
        >
          <p className="text-text text-sm leading-relaxed">{profile.description}</p>
        </motion.div>

        {/* 6 Axes — bars animate one by one */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-border p-5 mb-5"
        >
          <h2 className="font-display font-semibold text-xs text-text-muted uppercase tracking-widest mb-4">
            Tes 6 axes
          </h2>
          <div className="flex flex-col gap-4">
            {AXES_ORDER.map((ax, i) => {
              const meta  = AXIS_META[ax]
              const value = userAxes[ax]
              const label = value === 1 ? meta.positive : value === -1 ? meta.negative : 'Neutre'
              const pct   = value === 1 ? 100 : value === -1 ? 20 : 50

              return (
                <div key={ax}>
                  <div className="flex justify-between text-xs text-text-muted mb-1.5">
                    <span>{meta.label}</span>
                    <span className="font-semibold text-primary">{label}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.9 + i * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted/50 mt-0.5">
                    <span>{meta.negative}</span>
                    <span>{meta.positive}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Matches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.5 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6"
        >
          <p className="text-text text-sm leading-relaxed">
            <span className="font-semibold">Tu matches avec :</span> des organisateurs{' '}
            <span className="text-primary">{profile.matchesWith.organizers}</span>, des lieux{' '}
            <span className="text-primary">{profile.matchesWith.venues}</span>.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 1.65 }}
          className="flex flex-col gap-3"
        >
          <Link
            href="/experiences"
            className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Trouve ma soirée →
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full text-center border border-border text-text-muted hover:text-text hover:border-primary/30 text-sm font-medium py-3.5 rounded-2xl transition-colors duration-200"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Lien copié !' : 'Partager mon profil'}
          </button>

          <Link
            href="/onboarding"
            className="block w-full text-center text-text-muted text-sm py-2 hover:text-text transition-colors"
          >
            Refaire le quiz
          </Link>
        </motion.div>

      </div>
    </main>
  )
}
