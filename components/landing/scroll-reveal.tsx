'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const

type Props = {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'none'
}

export function ScrollReveal({ children, delay = 0, className, direction = 'up' }: Props) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: direction === 'up' ? 24 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.6, ease: EASE_PREMIUM, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}
