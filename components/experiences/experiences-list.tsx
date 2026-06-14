'use client'

import { ExperienceCard } from './experience-card'
import type { Experience } from '@/types/experience'

export function ExperiencesList({
  experiences,
  matchScores,
}: {
  experiences:  Experience[]
  matchScores?: Record<string, number>
}) {
  return (
    <div className="flex flex-col gap-4">
      {experiences.map((exp, i) => (
        <ExperienceCard
          key={exp.id}
          experience={exp}
          index={i}
          matchScore={matchScores?.[exp.id]}
        />
      ))}
    </div>
  )
}
