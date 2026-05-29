export const PROFILE_GRADIENTS: Record<string, string> = {
  explorer_festif:    'from-orange-400 to-rose-500',
  connecteur_social:  'from-blue-400 to-indigo-600',
  cerebrale_curieux:  'from-indigo-500 to-violet-700',
  empathique_calme:   'from-emerald-400 to-teal-600',
  creatif_libre:      'from-fuchsia-400 to-purple-600',
  observateur_profond:'from-slate-500 to-slate-800',
}

export function getGradientForExperience(compatibleProfiles: string[]): string {
  const first = compatibleProfiles[0]
  return PROFILE_GRADIENTS[first] ?? 'from-primary to-secondary'
}
