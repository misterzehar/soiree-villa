'use client'

import { ExperienceCard } from './experience-card'
import type { Experience } from '@/types/experience'

export function ExperiencesList({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="flex flex-col gap-4">
      {experiences.map((exp, i) => (
        <ExperienceCard key={exp.id} experience={exp} index={i} />
      ))}
    </div>
  )
}
