'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { QUESTIONS } from '@/constants/onboarding-questions'
import { submitOnboarding } from './actions'
import type { AnswersMap } from '@/lib/matching'

const TOTAL = QUESTIONS.length
const EASE = [0.16, 1, 0.3, 1] as const

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswersMap>({})
  const [direction, setDirection] = useState<'A' | 'B' | null>(null)
  const [navDir, setNavDir] = useState<'forward' | 'back'>('forward')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const reduced = useReducedMotion() ?? false

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
  const slideVariants = reduced
    ? {
        enter:    { opacity: 0 },
        center:   { opacity: 1 },
        exitA:    { opacity: 0 },
        exitB:    { opacity: 0 },
        exitBack: { opacity: 0 },
      }
    : {
        enter:    { x: enterX, opacity: 0 },
        center:   { x: 0, opacity: 1 },
        exitA:    { x: -120, opacity: 0, rotate: -6 },
        exitB:    { x: 120, opacity: 0, rotate: 6 },
        exitBack: { x: 60, opacity: 0 },
      }

  const exitVariant = navDir === 'back' ? 'exitBack' : direction === 'A' ? 'exitA' : 'exitB'

  return (
    <main className="relative overflow-hidden min-h-screen flex flex-col">

      {/* ——— Layer 0 : image immersive ——— */}
      <Image
        src="/fallback-experience.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />

      {/* ——— Layer 1 : dégradé sombre ——— */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(12,11,18,0.60) 0%, rgba(12,11,18,0.88) 100%)',
        }}
      />

      {/* ——— Layer 10 : contenu ——— */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }}
        className="relative flex-1 flex flex-col"
        style={{ zIndex: 10 }}
      >

        {/* ——— Overlay : calcul du profil ——— */}
        <AnimatePresence>
          {submitting && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="text-white/60 text-sm tracking-[0.2em] uppercase">
                Calcul de ton profil…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ——— Overlay : erreur réseau ——— */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-8"
            >
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                Une erreur s'est produite.<br />Vérifie ta connexion et réessaie.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <button
                  onClick={handleRetry}
                  className="text-white text-sm border border-white/25 px-6 py-3 hover:border-gold hover:text-gold transition-colors duration-200"
                >
                  Réessayer <span aria-hidden className="text-gold">→</span>
                </button>
                {canGoBack && (
                  <button
                    onClick={handleBack}
                    className="text-white/50 text-sm hover:text-white/80 transition-colors duration-200"
                  >
                    <span aria-hidden>←</span> Retour
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ——— Header ——— */}
        <header className="px-6 pt-6 pb-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            {canGoBack ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors duration-150 -ml-1 py-1 pr-2"
                aria-label="Question précédente"
              >
                <span aria-hidden>←</span>
                <span>Retour</span>
              </button>
            ) : (
              <span className="font-display font-light text-white/90 text-sm tracking-[0.12em] uppercase">
                Soirée Villa
              </span>
            )}
            <span className="text-white/60 text-sm tabular-nums">
              {currentIndex + 1} / {TOTAL}
            </span>
          </div>

          {/* Progress bar dorée */}
          <div
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-label="Progression du quiz"
            className="w-full h-0.5 bg-white/10"
          >
            <motion.div
              className="h-full bg-gold"
              animate={{ width: `${progress + (1 / TOTAL) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </header>

        {/* ——— Titre dramatique ——— */}
        <div className="text-center px-6 py-6 md:py-10 shrink-0">
          <p
            className="font-display font-light text-white/90 uppercase"
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
              letterSpacing: 'clamp(0.1em, 2vw, 0.35em)',
            }}
          >
            Tu préfères ?
          </p>
        </div>

        {/* ——— Split screen ——— */}
        <div className="flex-1 flex min-h-0 px-4 md:px-8 pb-4 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit={exitVariant}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col md:flex-row min-h-0"
            >
              {/* Option A */}
              <ChoiceCard
                label={question.optionA.label}
                onClick={() => handleChoice('A')}
                chosen={direction === 'A'}
                disabled={submitting || direction !== null}
                side="A"
              />

              {/* Séparateur mobile (horizontal) */}
              <div className="md:hidden flex items-center shrink-0" aria-hidden>
                <div className="flex-1 h-px bg-gold/20" />
                <span className="text-gold text-[10px] tracking-[0.5em] uppercase px-4">ou</span>
                <div className="flex-1 h-px bg-gold/20" />
              </div>

              {/* Séparateur desktop (vertical) */}
              <div className="hidden md:block self-stretch w-px bg-gold/20 my-4 shrink-0" aria-hidden />

              {/* Option B */}
              <ChoiceCard
                label={question.optionB.label}
                onClick={() => handleChoice('B')}
                chosen={direction === 'B'}
                disabled={submitting || direction !== null}
                side="B"
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </motion.div>
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
  void side // présent pour usage futur (analytics / aria)

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={[
        'flex-1 flex items-center justify-center',
        'min-h-[140px]',
        'p-8 md:p-12',
        'border backdrop-blur-sm',
        'transition-colors duration-200',
        disabled && !chosen ? 'cursor-default' : 'cursor-pointer',
        chosen
          ? 'border-gold bg-gold/10'
          : 'border-white/25 bg-black/30 hover:border-white/60 hover:bg-black/50',
      ].join(' ')}
    >
      <span
        className={[
          'font-display font-light',
          'text-xl md:text-2xl',
          'leading-relaxed tracking-[-0.01em]',
          'text-center text-balance',
          chosen ? 'text-gold' : 'text-white',
        ].join(' ')}
      >
        {label}
      </span>
    </motion.button>
  )
}
