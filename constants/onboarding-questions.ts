export type Axis = 'energy' | 'structure' | 'depth' | 'sociality' | 'cerebrale' | 'creativite'

export type OnboardingQuestion = {
  id: number
  axis: Axis
  optionA: { label: string; value: 1 | -1 }
  optionB: { label: string; value: 1 | -1 }
}

export const QUESTIONS: OnboardingQuestion[] = [
  // ── ÉNERGIE — 4 questions ────────────────────────────────────
  { id: 1,  axis: 'energy',     optionA: { label: 'Une soirée festive avec DJ et lumière qui pulse',          value:  1 }, optionB: { label: 'Un apéro cosy à la maison entre proches',                      value: -1 } },
  { id: 2,  axis: 'energy',     optionA: { label: 'Arriver le premier et accueillir tout le monde',           value:  1 }, optionB: { label: "Te glisser quand l'ambiance est déjà lancée",                  value: -1 } },
  { id: 3,  axis: 'energy',     optionA: { label: 'Lancer la conversation avec un inconnu',                   value:  1 }, optionB: { label: 'La rejoindre quand elle a déjà commencé',                     value: -1 } },
  { id: 4,  axis: 'energy',     optionA: { label: "Être au centre d'une photo de groupe",                     value:  1 }, optionB: { label: 'Sur le côté, plus discret',                                   value: -1 } },

  // ── STRUCTURE — 4 questions ──────────────────────────────────
  { id: 5,  axis: 'structure',  optionA: { label: 'Une soirée avec un programme annoncé à l\'avance',         value:  1 }, optionB: { label: 'Une soirée surprise totale, sans savoir ce qui arrive',        value: -1 } },
  { id: 6,  axis: 'structure',  optionA: { label: 'Des jeux avec des règles claires et bien expliquées',      value:  1 }, optionB: { label: "De l'impro totale, pas de cadre du tout",                     value: -1 } },
  { id: 7,  axis: 'structure',  optionA: { label: "Réserver une table à l'avance",                            value:  1 }, optionB: { label: 'Trouver un endroit sur le moment',                            value: -1 } },
  { id: 8,  axis: 'structure',  optionA: { label: 'Une to-do list pour préparer ta soirée',                   value:  1 }, optionB: { label: 'Tout improviser le jour J',                                   value: -1 } },

  // ── PROFONDEUR — 4 questions ─────────────────────────────────
  { id: 9,  axis: 'depth',      optionA: { label: 'Une discussion qui te marque longtemps',                   value:  1 }, optionB: { label: "Un fou rire collectif qu'on oublie le lendemain",             value: -1 } },
  { id: 10, axis: 'depth',      optionA: { label: 'Confier quelque chose de perso à un inconnu',              value:  1 }, optionB: { label: 'Rester dans le fun léger toute la soirée',                   value: -1 } },
  { id: 11, axis: 'depth',      optionA: { label: 'Faire UNE rencontre marquante dans une soirée',            value:  1 }, optionB: { label: 'Croiser DIX personnes sympas',                               value: -1 } },
  { id: 12, axis: 'depth',      optionA: { label: 'Te souvenir d\'une émotion forte',                         value:  1 }, optionB: { label: "Te souvenir d'une anecdote drôle",                           value: -1 } },

  // ── SOCIALITÉ — 3 questions ──────────────────────────────────
  { id: 13, axis: 'sociality',  optionA: { label: 'Une soirée à 12 personnes que tu connais à peine',         value:  1 }, optionB: { label: 'Un dîner à 4 avec des potes proches',                        value: -1 } },
  { id: 14, axis: 'sociality',  optionA: { label: 'Un bar bondé un samedi soir',                              value:  1 }, optionB: { label: 'Un rooftop intimiste avec 6 personnes',                      value: -1 } },
  { id: 15, axis: 'sociality',  optionA: { label: 'Un festival',                                              value:  1 }, optionB: { label: 'Un dîner privé',                                             value: -1 } },

  // ── CÉRÉBRALE — 3 questions ──────────────────────────────────
  { id: 16, axis: 'cerebrale',  optionA: { label: 'Analyser pourquoi la dynamique du groupe change au fil de la soirée', value: 1 }, optionB: { label: 'Te laisser emporter par le courant sans chercher à comprendre', value: -1 } },
  { id: 17, axis: 'cerebrale',  optionA: { label: 'Un jeu stratégique avec beaucoup de règles à maîtriser',  value:  1 }, optionB: { label: 'Un jeu instinctif et rapide où tu réagis sans réfléchir',     value: -1 } },
  { id: 18, axis: 'cerebrale',  optionA: { label: 'Une conférence ou débat animé par un passionné',           value:  1 }, optionB: { label: 'Un concert où tu ne penses à rien du tout',                  value: -1 } },

  // ── CRÉATIVITÉ — 2 questions ─────────────────────────────────
  { id: 19, axis: 'creativite', optionA: { label: "Inventer un thème de soirée original que personne n'a vu", value: 1 }, optionB: { label: 'Retrouver des soirées avec un format qui a fait ses preuves',  value: -1 } },
  { id: 20, axis: 'creativite', optionA: { label: 'Participer à une création collective (impro, dessin, story-building)', value: 1 }, optionB: { label: 'Assister à une performance déjà rodée avec un beau résultat fini', value: -1 } },
]
