export type Axis = 'energy' | 'structure' | 'depth' | 'sociality'

export type OnboardingQuestion = {
  id: number
  axis: Axis
  optionA: { label: string; value: 1 | -1 }
  optionB: { label: string; value: 1 | -1 }
}

export const QUESTIONS: OnboardingQuestion[] = [
  // ÉNERGIE — 4 questions
  { id: 1,  axis: 'energy',    optionA: { label: 'Une soirée festive avec DJ et lumière qui pulse', value: 1 },  optionB: { label: 'Un apéro cosy à la maison entre proches', value: -1 } },
  { id: 2,  axis: 'energy',    optionA: { label: 'Arriver le premier et accueillir tout le monde', value: 1 },  optionB: { label: 'Te glisser quand l\'ambiance est déjà lancée', value: -1 } },
  { id: 3,  axis: 'energy',    optionA: { label: 'Lancer la conversation avec un inconnu', value: 1 },          optionB: { label: 'La rejoindre quand elle a déjà commencé', value: -1 } },
  { id: 4,  axis: 'energy',    optionA: { label: 'Être au centre d\'une photo de groupe', value: 1 },           optionB: { label: 'Sur le côté, plus discret', value: -1 } },

  // STRUCTURE — 4 questions
  { id: 5,  axis: 'structure', optionA: { label: 'Une soirée avec un programme annoncé', value: 1 },            optionB: { label: 'Une soirée surprise totale', value: -1 } },
  { id: 6,  axis: 'structure', optionA: { label: 'Des jeux avec des règles claires', value: 1 },                optionB: { label: 'De l\'impro totale, pas de cadre', value: -1 } },
  { id: 7,  axis: 'structure', optionA: { label: 'Réserver une table à l\'avance', value: 1 },                  optionB: { label: 'Trouver un endroit sur le moment', value: -1 } },
  { id: 8,  axis: 'structure', optionA: { label: 'Une to-do list pour préparer ta soirée', value: 1 },          optionB: { label: 'Tout improviser le jour J', value: -1 } },

  // PROFONDEUR — 4 questions
  { id: 9,  axis: 'depth',     optionA: { label: 'Une discussion qui te marque longtemps', value: 1 },          optionB: { label: 'Un fou rire collectif que t\'oublies vite', value: -1 } },
  { id: 10, axis: 'depth',     optionA: { label: 'Confier quelque chose de perso à un inconnu', value: 1 },     optionB: { label: 'Rester dans le fun léger', value: -1 } },
  { id: 11, axis: 'depth',     optionA: { label: 'Faire UNE rencontre marquante dans une soirée', value: 1 },   optionB: { label: 'Croiser DIX personnes sympas', value: -1 } },
  { id: 12, axis: 'depth',     optionA: { label: 'Te souvenir d\'une émotion forte', value: 1 },                optionB: { label: 'Te souvenir d\'une anecdote drôle', value: -1 } },

  // SOCIALITÉ — 3 questions
  { id: 13, axis: 'sociality', optionA: { label: 'Une soirée à 12 personnes que tu connais à peine', value: 1 }, optionB: { label: 'Un dîner à 4 avec des potes proches', value: -1 } },
  { id: 14, axis: 'sociality', optionA: { label: 'Un bar bondé un samedi soir', value: 1 },                     optionB: { label: 'Un rooftop intimiste avec 6 personnes', value: -1 } },
  { id: 15, axis: 'sociality', optionA: { label: 'Un festival', value: 1 },                                     optionB: { label: 'Un dîner privé', value: -1 } },
]
