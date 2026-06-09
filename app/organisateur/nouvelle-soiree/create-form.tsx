'use client'

import { ExperienceForm } from '../_components/experience-form'
import { createExperience } from './actions'
import type { Lieu } from '@/types/lieu'

export function CreateForm({ availableLieux }: { availableLieux: Lieu[] }) {
  return (
    <ExperienceForm
      action={createExperience}
      availableLieux={availableLieux}
      submitLabel="Soumettre ma soirée"
    />
  )
}
