'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTIONS } from '@/constants/onboarding-questions'
import { submitOnboarding } from './actions'
import type { AnswersMap } from '@/lib/matching'

const TOTAL = QUESTIONS.length

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswersMap>({})
  const [direction, setDirection] = useState<'A' | 'B' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const question = QUESTIONS[currentIndex]
  const progress = (currentIndex / TOTAL) * 100

  async function handleChoice(choice: 'A' | 'B') {
    if (submitting) return
    setDirection(choice)

    const next = { ...answers, [question.id]: choice }
    setAnswers(next)

    if (currentIndex < TOTAL - 1) {
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        setDirection(null)
      }, 280)
    } else {
      setSubmitting(true)
      await submitOnboarding(next)
    }
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitA: { x: -120, opacity: 0, rotate: -6 },
    exitB: { x: 120, opacity: 0, rotate: 6 },
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-start px-4 pt-8 pb-16">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-semibold text-text text-sm">
            Soirée Villa
          </span>
          <span className="text-text-muted text-sm">
            {currentIndex + 1} / {TOTAL}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress + (1 / TOTAL) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        <p className="text-text-muted text-sm font-medium mb-6 tracking-wide uppercase text-center">
          Tu préfères ?
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit={direction === 'A' ? 'exitA' : 'exitB'}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="flex flex-col gap-4">
              <ChoiceCard
                label={question.optionA.label}
                onClick={() => handleChoice('A')}
                chosen={direction === 'A'}
                disabled={submitting || direction !== null}
                side="A"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-text-muted text-xs font-medium">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <ChoiceCard
                label={question.optionB.label}
                onClick={() => handleChoice('B')}
                chosen={direction === 'B'}
                disabled={submitting || direction !== null}
                side="B"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {submitting && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 text-text-muted text-sm text-center"
          >
            Calcul de ton profil…
          </motion.p>
        )}
      </div>
    </main>
  )
}

function ChoiceCard({
  label,
  onClick,
  chosen,
  disabled,
  side,
}: {
  label: string
  onClick: () => void
  chosen: boolean
  disabled: boolean
  side: 'A' | 'B'
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.015, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      animate={chosen ? { scale: 1.03 } : { scale: 1 }}
      transition={{ duration: 0.18 }}
      className={[
        'w-full rounded-2xl p-5 text-left transition-colors duration-150',
        'border-2 shadow-sm',
        chosen
          ? 'bg-primary border-primary text-white shadow-md'
          : 'bg-surface border-border text-text hover:border-primary/40 hover:shadow-md',
        disabled && !chosen ? 'opacity-60 cursor-default' : 'cursor-pointer',
      ].join(' ')}
    >
      <span className="font-display font-medium text-base leading-snug">
        {label}
      </span>
    </motion.button>
  )
}
