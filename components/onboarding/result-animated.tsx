'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import type { Profile } from '@/constants/profiles'
import type { AxesTarget } from '@/constants/profiles'

const EASE = [0.16, 1, 0.3, 1] as const

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
  const reduced = useReducedMotion() ?? false

  function handleShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center px-4 pt-12 pb-20">
      <div className="w-full max-w-md">

        {/* ——— Act I : Identité ——— */}

        {/* Badge emoji — bloom */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, ease: EASE }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-5xl"
            role="img"
            aria-label={`Profil : ${profile.name}`}
          >
            {profile.emoji}
          </div>
        </motion.div>

        {/* Nom — moment héros : monte en flou puis au net */}
        <motion.h1
          initial={reduced
            ? { opacity: 0 }
            : { opacity: 0, y: 32, scale: 0.95, filter: 'blur(8px)' }
          }
          animate={reduced
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          }
          transition={reduced
            ? { duration: 0 }
            : { duration: 0.75, ease: EASE, delay: 0.22 }
          }
          className="font-display font-light text-center text-text mb-3"
          style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', letterSpacing: '-0.025em', lineHeight: 1.1 }}
        >
          {profile.name}
        </motion.h1>

        {/* ——— Act II : Contexte ——— tagline arrive ~650ms après le nom seul ——— */}

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 1.6 }}
          className="text-text-muted text-sm text-center leading-relaxed mb-6 max-w-xs mx-auto"
        >
          {profile.tagline}
        </motion.p>

        <div className="flex flex-wrap gap-1.5 justify-center mb-8">
          {profile.traits.map((trait, i) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3, ease: EASE, delay: 1.85 + i * 0.07 }}
              className="border border-border text-text-muted text-[11px] font-medium px-3 py-1 rounded-full"
            >
              {trait}
            </motion.span>
          ))}
        </div>

        {/* ——— Act III : Données ——— */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 2.1 }}
          className="border-t border-border pt-6 mb-6"
        >
          <p className="text-text text-sm leading-relaxed">{profile.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 2.3 }}
          className="border-t border-border pt-6 mb-6"
        >
          <div className="flex flex-col gap-4">
            {AXES_ORDER.map((ax, i) => {
              const meta  = AXIS_META[ax]
              const value = userAxes[ax]
              const label = value === 1 ? meta.positive : value === -1 ? meta.negative : 'Neutre'
              const pct   = value === 1 ? 100 : value === -1 ? 5 : 50

              return (
                <div key={ax}>
                  <div className="flex justify-between text-xs text-text-muted mb-1.5">
                    <span>{meta.label}</span>
                    <span className="text-primary">{label}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: 2.35 + i * 0.08 }}
                      className="h-full bg-primary rounded-full"
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 2.8 }}
          className="border-t border-border pt-6 mb-8"
        >
          <p className="text-text-muted text-sm leading-relaxed">
            Tu matches avec des organisateurs{' '}
            <span className="text-gold">{profile.matchesWith.organizers}</span>, des lieux{' '}
            <span className="text-gold">{profile.matchesWith.venues}</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 2.95 }}
          className="flex flex-col gap-3"
        >
          <Link
            href="/experiences"
            className="block w-full text-center border border-text/20 text-text text-[11px] font-medium tracking-[0.12em] uppercase py-4 hover:bg-text/[0.04] focus-visible:outline-none focus-visible:border-text/40 transition-colors duration-300"
          >
            Trouve ma soirée{' '}
            <span aria-hidden className="text-gold tracking-normal normal-case">→</span>
          </Link>

          <button
            onClick={handleShare}
            aria-label={copied ? 'Lien copié !' : 'Partager mon profil'}
            className="flex items-center justify-center gap-2 w-full border border-border text-text-muted hover:text-text hover:border-text/20 text-sm py-3.5 focus-visible:outline-none focus-visible:border-text/40 transition-colors duration-200"
          >
            {copied ? <Check className="w-4 h-4 text-success" aria-hidden /> : <Share2 className="w-4 h-4" aria-hidden />}
            <span aria-hidden>{copied ? 'Lien copié !' : 'Partager mon profil'}</span>
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
