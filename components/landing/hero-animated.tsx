'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const

export function HeroAnimated() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pb-24 text-center md:px-12">

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.1 }}
        className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-6"
      >
        Comprendre · Vivre · Oser
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.25 }}
        className="font-display font-bold text-white max-w-3xl leading-[1.05] mb-6 text-balance"
        style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
      >
        La soirée{' '}
        <em className="not-italic" style={{ color: 'rgb(var(--color-accent-rgb))' }}>
          qui te ressemble
        </em>{' '}
        existe.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.45 }}
        className="text-lg md:text-xl text-white/60 max-w-md mb-10 leading-relaxed"
      >
        On te matche avec des expériences animées, pensées pour ton style social.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE_PREMIUM, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-white text-text font-display font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          Découvre ton style
          <span aria-hidden className="text-primary">→</span>
        </Link>
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm px-6 py-4 transition-colors duration-200"
        >
          Voir les soirées
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-5 text-xs text-white/30"
      >
        15 questions · moins d'une minute · gratuit
      </motion.p>
    </div>
  )
}
