export type AxisQuestion = {
  axis: 'energy' | 'structure' | 'depth' | 'sociality'
  name: string     // nom du champ HTML
  question: string
  options: { value: '-1' | '1'; label: string; hint?: string }[]
}

export const LIEU_AXES_QUESTIONS: AxisQuestion[] = [
  {
    axis: 'energy',
    name: 'axisEnergy',
    question: "L'ambiance de votre lieu est plutôt…",
    options: [
      { value: '-1', label: 'Calme et intimiste',          hint: 'Soirées posées, discussions, petits groupes' },
      { value:  '1', label: 'Dynamique et électrique',     hint: 'Animation, musique, mouvement, énergie' },
    ],
  },
  {
    axis: 'structure',
    name: 'axisStructure',
    question: 'Vos événements sont généralement…',
    options: [
      { value: '-1', label: 'Libres et flexibles',         hint: 'Les participants font ce qu\'ils veulent' },
      { value:  '1', label: 'Programmés et structurés',    hint: 'Programme défini, animations planifiées' },
    ],
  },
  {
    axis: 'depth',
    name: 'axisDepth',
    question: 'Les soirées dans votre lieu créent plutôt…',
    options: [
      { value: '-1', label: 'Des moments légers et fun',   hint: 'Divertissement, légèreté, rires' },
      { value:  '1', label: 'Des liens profonds et mémorables', hint: 'Échanges authentiques, connexions fortes' },
    ],
  },
  {
    axis: 'sociality',
    name: 'axisSociality',
    question: 'Votre lieu est idéal pour…',
    options: [
      { value: '-1', label: 'Petits groupes intimistes',   hint: 'Jusqu\'à 15 personnes' },
      { value:  '1', label: 'Groupes larges et animés',    hint: '16 personnes et plus' },
    ],
  },
]

export const FOURNISSEUR_AXES_QUESTIONS: AxisQuestion[] = [
  {
    axis: 'energy',
    name: 'axisEnergy',
    question: 'Vos prestations sont plutôt…',
    options: [
      { value: '-1', label: 'Calmes et contemplatives',    hint: 'Atmosphère douce, rythme posé' },
      { value:  '1', label: 'Dynamiques et entraînantes',  hint: 'Énergie, mouvement, enthousiasme' },
    ],
  },
  {
    axis: 'structure',
    name: 'axisStructure',
    question: 'Vos interventions sont…',
    options: [
      { value: '-1', label: 'Improvisées et spontanées',   hint: 'Vous vous adaptez au moment' },
      { value:  '1', label: 'Très scénarisées et préparées', hint: 'Programme millimétré, rien au hasard' },
    ],
  },
  {
    axis: 'depth',
    name: 'axisDepth',
    question: 'Ce que vous cherchez avant tout à créer…',
    options: [
      { value: '-1', label: 'Des moments légers et fun',   hint: 'Divertissement, légèreté, rires' },
      { value:  '1', label: 'Des instants forts et mémorables', hint: 'Souvenirs durables, émotions profondes' },
    ],
  },
  {
    axis: 'sociality',
    name: 'axisSociality',
    question: 'Vous intervenez de préférence pour…',
    options: [
      { value: '-1', label: 'Petits groupes',              hint: 'Jusqu\'à 15 personnes' },
      { value:  '1', label: 'Grands groupes',              hint: '16 personnes et plus' },
    ],
  },
]
