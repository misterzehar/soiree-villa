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
  const [navDir, setNavDir] = useState<'forward' | 'back'>('forward')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const question = QUESTIONS[currentIndex]
  const progress = (currentIndex / TOTAL) * 100
  const canGoBack = currentIndex > 0 && !submitting && direction === null

  async function handleChoice(choice: 'A' | 'B') {
    if (submitting || direction !== null) return
    setNavDir('forward')
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
      try {
        await submitOnboarding(next)
      } catch {
        setSubmitting(false)
        setDirection(null)
        setSubmitError(true)
      }
    }
  }

  async function handleRetry() {
    setSubmitError(false)
    setSubmitting(true)
    try {
      await submitOnboarding(answers)
    } catch {
      setSubmitting(false)
      setSubmitError(true)
    }
  }

  function handleBack() {
    if (!canGoBack) return
    const prevQuestion = QUESTIONS[currentIndex - 1]
    setNavDir('back')
    setSubmitError(false)
    setAnswers(prev => {
      const next = { ...prev }
      delete next[prevQuestion.id]
      return next
    })
    setCurrentIndex(i => i - 1)
  }

  const enterX = navDir === 'back' ? -40 : 40
  const slideVariants = {
    enter: { x: enterX, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitA: { x: -120, opacity: 0, rotate: -6 },
    exitB: { x: 120, opacity: 0, rotate: 6 },
    exitBack: { x: 60, opacity: 0 },
  }
  const exitVariant = navDir === 'back' ? 'exitBack' : direction === 'A' ? 'exitA' : 'exitB'

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-start px-4 pt-8 pb-16">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-3">
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors duration-150 -ml-1 py-1 pr-2"
              aria-label="Question précédente"
            >
              <span aria-hidden>←</span>
              <span>Retour</span>
            </button>
          ) : (
            <span className="font-display font-semibold text-text text-sm">
              Soirée Villa
            </span>
          )}
          <span className="text-text-muted text-sm">
            {currentIndex + 1} / {TOTAL}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Progression du quiz"
          className="w-full h-1.5 bg-border rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gold rounded-full"
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

        {submitError ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-center pt-8"
          >
            <p className="text-text-muted text-sm mb-6">
              Une erreur s'est produite.<br />Vérifie ta connexion et réessaie.
            </p>
            <button
              onClick={handleRetry}
              className="text-text text-sm border border-border px-5 py-2.5 hover:border-text/30 transition-colors duration-150"
            >
              Réessayer <span aria-hidden className="text-gold">→</span>
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit={exitVariant}
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
        )}

        <div aria-live="polite" aria-atomic="true" className="mt-10 text-center">
          {submitting && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-text-muted text-sm"
            >
              Calcul de ton profil…
            </motion.p>
          )}
        </div>
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
