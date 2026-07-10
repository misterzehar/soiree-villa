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
  const [hoveredSide, setHoveredSide] = useState<'A' | 'B' | null>(null)
  const reduced = useReducedMotion() ?? false

  const question = QUESTIONS[currentIndex]
  const progress = (currentIndex / TOTAL) * 100
  const canGoBack = currentIndex > 0 && !submitting && direction === null

  async function handleChoice(choice: 'A' | 'B') {
    if (submitting || direction !== null) return
    setHoveredSide(null)
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

      {/* ——— Layer 0 : image cinématique globale (visible dans la zone header) ——— */}
      <Image
        src="/fallback-experience.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />

      {/* ——— Layer 1 : dégradé opaque en haut, transparent vers la zone cards ——— */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(12,11,18,0.92) 0%, rgba(12,11,18,0.55) 22%, rgba(12,11,18,0) 42%)',
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

        {/* ——— Overlay : calcul du profil (z-30) ——— */}
        <AnimatePresence>
          {submitting && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(12,11,18,0.55)' }}
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="text-white/70 text-sm tracking-[0.2em] uppercase">
                Calcul de ton profil…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ——— Overlay : erreur réseau (z-30) ——— */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-8"
              style={{ background: 'rgba(12,11,18,0.78)' }}
            >
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                Une erreur s'est produite.<br />Vérifie ta connexion et réessaie.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <button
                  onClick={handleRetry}
                  className="text-white text-sm border border-white/25 px-6 py-3 hover:border-gold hover:text-gold transition-colors duration-200"
                >
                  Réessayer <span aria-hidden="true" className="text-gold">→</span>
                </button>
                {canGoBack && (
                  <button
                    onClick={handleBack}
                    className="text-white/50 text-sm hover:text-white/80 transition-colors duration-200"
                  >
                    <span aria-hidden="true">←</span> Retour
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ——— Header (z-20) ——— */}
        <header className="relative z-20 px-6 pt-6 pb-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            {canGoBack ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors duration-150 -ml-1 py-1 pr-2"
                aria-label="Question précédente"
              >
                <span aria-hidden="true">←</span>
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

          {/* Barre de progression dorée avec glow */}
          <div
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-label="Progression du quiz"
            className="w-full h-[2px] bg-white/10"
          >
            <motion.div
              className="h-full bg-gold"
              animate={{ width: `${progress + (1 / TOTAL) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 8px rgba(212,175,55,0.5)' }}
            />
          </div>
        </header>

        {/* ——— Titre flottant (z-20, absolutement positionné sur le split screen) ——— */}
        <div
          className="absolute left-0 right-0 flex justify-center z-20 pointer-events-none top-[88px] md:top-28 px-6"
          aria-hidden="true"
        >
          <div className="inline-block px-8 py-3 bg-black/50 backdrop-blur-md">
            <p
              className="font-display font-light text-white/90 uppercase text-center tracking-[0.12em] md:tracking-[0.45em]"
              style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)' }}
            >
              Tu préfères&nbsp;?
            </p>
          </div>
        </div>

        {/* ——— Split screen plein écran ——— */}
        <div className="flex-1 flex min-h-0">
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
              {/* Option A — cadrage gauche, teinte chaude dorée */}
              <QuizHalf
                label={question.optionA.label}
                side="A"
                objectPosition="left"
                tintRgb="184,134,11"
                hoveredSide={hoveredSide}
                chosen={direction === 'A'}
                disabled={submitting || direction !== null}
                reduced={reduced}
                onHover={() => setHoveredSide('A')}
                onHoverEnd={() => setHoveredSide(prev => prev === 'A' ? null : prev)}
                onClick={() => handleChoice('A')}
              />

              {/* Médaillon central */}
              <Medallion />

              {/* Option B — cadrage droit, teinte froide nuit */}
              <QuizHalf
                label={question.optionB.label}
                side="B"
                objectPosition="right"
                tintRgb="24,24,60"
                hoveredSide={hoveredSide}
                chosen={direction === 'B'}
                disabled={submitting || direction !== null}
                reduced={reduced}
                onHover={() => setHoveredSide('B')}
                onHoverEnd={() => setHoveredSide(prev => prev === 'B' ? null : prev)}
                onClick={() => handleChoice('B')}
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </motion.div>
    </main>
  )
}

/* ============================================================
   QuizHalf — demi-écran immersif avec image propre + hover théâtral
   ============================================================ */

type QuizHalfProps = {
  label: string
  side: 'A' | 'B'
  objectPosition: 'left' | 'right'
  tintRgb: string
  hoveredSide: 'A' | 'B' | null
  chosen: boolean
  disabled: boolean
  reduced: boolean
  onHover: () => void
  onHoverEnd: () => void
  onClick: () => void
}

function QuizHalf({
  label,
  side,
  objectPosition,
  tintRgb,
  hoveredSide,
  chosen,
  disabled,
  reduced,
  onHover,
  onHoverEnd,
  onClick,
}: QuizHalfProps) {
  const isHoveredSelf  = hoveredSide === side
  const isHoveredOther = hoveredSide !== null && hoveredSide !== side

  const darkOpacity = chosen ? 0.30 : isHoveredSelf ? 0.28 : isHoveredOther ? 0.88 : 0.62
  const tintOpacity = chosen ? 0.22 : isHoveredSelf ? 0.22 : isHoveredOther ? 0.03 : 0.12

  const tx = reduced
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const }

  const labelColor = chosen
    ? 'text-gold'
    : isHoveredSelf
      ? 'text-gold'
      : isHoveredOther
        ? 'text-white/30'
        : 'text-white'

  return (
    <div className="flex-1 relative overflow-hidden min-h-[140px]">

      {/* Image cadrée proprement de ce côté */}
      <Image
        src="/fallback-experience.jpg"
        alt=""
        fill
        className="object-cover"
        style={{ objectPosition }}
      />

      {/* Couche sombre animée selon le hover */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgb(12,11,18)' }}
        animate={{ opacity: darkOpacity }}
        transition={tx}
      />

      {/* Teinte colorée animée (dorée à gauche, nuit à droite) */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(${tintRgb})` }}
        animate={{ opacity: tintOpacity }}
        transition={tx}
      />

      {/* Halo doré subtil si option choisie */}
      {chosen && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(212,175,55,0.07)' }}
        />
      )}

      {/* Zone interactive — couvre toute la demi-surface */}
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={!disabled ? onHover : undefined}
        onMouseLeave={!disabled ? onHoverEnd : undefined}
        onFocus={!disabled ? onHover : undefined}
        onBlur={!disabled ? onHoverEnd : undefined}
        className={[
          'absolute inset-0',
          'flex flex-col items-center justify-center',
          'px-8 py-12 md:px-14',
          disabled && !chosen ? 'cursor-default' : 'cursor-pointer',
        ].join(' ')}
      >
        {/* Label principal */}
        <span
          className={[
            'font-display font-light',
            'text-2xl md:text-3xl lg:text-4xl',
            'leading-[1.15] tracking-[-0.02em]',
            'max-w-[20ch] text-center text-balance',
            'transition-colors duration-[400ms]',
            labelColor,
          ].join(' ')}
        >
          {label}
        </span>

        {/* Soulignement décoratif doré — s'allonge au hover */}
        <motion.div
          className="h-px bg-gold mt-6"
          animate={{
            width: isHoveredSelf || chosen ? 64 : 32,
            opacity: isHoveredSelf || chosen ? 1 : 0.35,
          }}
          transition={tx}
        />

        {/* "Choisir →" — apparaît au survol, invisible sinon */}
        <motion.span
          className="flex items-center gap-1.5 text-gold text-[10px] font-medium tracking-[0.4em] uppercase mt-5"
          animate={{ opacity: isHoveredSelf && !chosen ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.45 }}
          aria-hidden="true"
        >
          Choisir <span>→</span>
        </motion.span>
      </button>
    </div>
  )
}

/* ============================================================
   Medallion — séparateur central dramatique avec badge "OU"
   ============================================================ */

function Medallion() {
  const badge = (
    <div className="w-14 h-14 rounded-full border border-gold bg-black/60 backdrop-blur-md flex items-center justify-center shrink-0">
      <span className="font-display font-light text-gold text-[10px] uppercase tracking-[0.4em] leading-none">
        OU
      </span>
    </div>
  )

  return (
    <>
      {/* Mobile : ligne horizontale avec médaillon */}
      <div className="md:hidden relative flex items-center shrink-0 z-10" aria-hidden="true">
        <div className="flex-1 h-px bg-gold/60" />
        {badge}
        <div className="flex-1 h-px bg-gold/60" />
      </div>

      {/* Desktop : ligne verticale avec médaillon centré */}
      <div className="hidden md:flex flex-col items-center self-stretch shrink-0 z-10" aria-hidden="true">
        <div className="flex-1 w-px bg-gold/60" />
        {badge}
        <div className="flex-1 w-px bg-gold/60" />
      </div>
    </>
  )
}
