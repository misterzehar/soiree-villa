'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const ease = [0.25, 0.46, 0.45, 0.94] as const

export function HeroAnimated() {
  return (
    <div className="relative z-10 flex flex-col justify-end flex-1 px-6 pb-20 md:px-16 lg:px-24 md:pb-32">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className="text-[10px] font-medium tracking-[0.28em] uppercase text-white/50 mb-7"
      >
        Nice · Expériences sociales animées
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease, delay: 0.32 }}
        className="font-display font-light text-white mb-10"
        style={{
          fontSize: 'clamp(2.8rem, 7.5vw, 6rem)',
          letterSpacing: '-0.04em',
          lineHeight: 1.03,
          maxWidth: '13ch',
        }}
      >
        La soirée qui{' '}
        <span className="text-gold">te ressemble</span>
        {' '}existe.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.55 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8"
      >
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-3 border border-white/20 text-white text-[11px] font-medium tracking-[0.12em] uppercase px-8 py-4 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:border-white/60 transition-colors duration-300"
        >
          Découvrir mon profil
          <span aria-hidden className="text-gold tracking-normal normal-case">→</span>
        </Link>
        <Link
          href="/experiences"
          className="py-2 text-white/55 hover:text-white/80 focus-visible:text-white focus-visible:outline-none text-[11px] tracking-[0.1em] uppercase transition-colors duration-300"
        >
          Voir les soirées
        </Link>
      </motion.div>
    </div>
  )
}
