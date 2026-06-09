'use client'

import { ExperienceForm } from '../_components/experience-form'
import { createExperience } from './actions'

export function CreateForm() {
  return (
    <ExperienceForm
      action={createExperience}
      submitLabel="Soumettre ma soirée"
    />
  )
}
