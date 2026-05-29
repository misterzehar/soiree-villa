export type ProfileId =
  | 'explorer_festif'
  | 'connecteur_social'
  | 'cerebrale_curieux'
  | 'empathique_calme'
  | 'creatif_libre'
  | 'observateur_profond'

export type AxesSigns = {
  energy: 'extra' | 'intro'
  structure: 'structured' | 'spontaneous'
  depth: 'deep' | 'light'
  sociality: 'large' | 'small'
}

export type Profile = {
  id: ProfileId
  name: string
  emoji: string
  tagline: string
  traits: [string, string, string]
  description: string
  axes: AxesSigns
  matchesWith: {
    organizers: string
    venues: string
    experiences: string[]
  }
  avoids: string[]
}

export const PROFILES: Profile[] = [
  {
    id: 'explorer_festif',
    name: "L'Explorateur Festif",
    emoji: '🎉',
    tagline: "Tu aimes les ambiances vivantes, les grandes tablées, les imprévus qui réchauffent la nuit.",
    traits: ['Extraverti', 'Spontané', 'Festif'],
    description: "Tu es l'âme des soirées. Tu donnes l'impulsion, tu lances les fous rires, tu rends les inconnus complices en moins de 10 minutes. Pour toi, une réussite c'est une foule qui vibre ensemble. Le reste ? Détails.",
    axes: { energy: 'extra', structure: 'spontaneous', depth: 'light', sociality: 'large' },
    matchesWith: {
      organizers: 'drôles, énergiques, fédérateurs',
      venues: 'festifs, ouverts, lumineux (rooftop, club, scène ouverte)',
      experiences: ["blind tests", "soirées DJ", "fêtes thématiques", "jeux d'ambiance", "défis de groupe"],
    },
    avoids: ["activités calmes", "cérébrales ou trop introspectives", "petits comités contemplatifs"],
  },
  {
    id: 'connecteur_social',
    name: 'Le Connecteur Social',
    emoji: '🤝',
    tagline: "Tu rassembles les gens. Tu vois les ponts entre les personnalités, et tu kiffes les construire.",
    traits: ['Fédérateur', 'Empathique', 'Stratège social'],
    description: "Tu n'es pas juste sociable, tu es architecte de liens. Tu te souviens des prénoms, tu présentes les gens entre eux, tu remarques qui s'isole. Tu kiffes les soirées où tout le monde repart avec une vraie rencontre. La superficialité te lasse vite.",
    axes: { energy: 'extra', structure: 'structured', depth: 'deep', sociality: 'large' },
    matchesWith: {
      organizers: 'facilitants, structurés',
      venues: 'ouverts, modulables (loft, salle privatisable, jardin)',
      experiences: ["dîners scénarisés", "ateliers collaboratifs", "soirées thématiques avec brassage"],
    },
    avoids: ["activités où on reste passif spectateur", "soirées sans cadre"],
  },
  {
    id: 'cerebrale_curieux',
    name: 'Le Cérébral Curieux',
    emoji: '🧠',
    tagline: "Tu choisis tes soirées comme tes lectures : avec exigence, et l'envie d'en sortir plus riche.",
    traits: ['Stratège', 'Curieux', 'Sélectif'],
    description: "Tu n'es pas là pour le bruit. Tu cherches du sens, des conversations qui t'apprennent quelque chose, des jeux qui te font réfléchir. Tu préfères 5 personnes qui te stimulent à 50 qui s'agitent. Pour toi, une soirée réussie laisse une trace mentale.",
    axes: { energy: 'intro', structure: 'structured', depth: 'deep', sociality: 'small' },
    matchesWith: {
      organizers: 'rigoureux, qui tiennent la barre',
      venues: 'intimistes (cave, bibliothèque privée, atelier)',
      experiences: ["escape games", "murder parties", "ateliers dégustation", "débats animés", "quiz pointus"],
    },
    avoids: ["foules anonymes", "musique trop forte", "improvisation totale"],
  },
  {
    id: 'empathique_calme',
    name: "L'Empathique Calme",
    emoji: '🌿',
    tagline: "Tu sens les ambiances avant de les comprendre. Et c'est ta plus belle qualité.",
    traits: ['Sensible', 'Médiateur', 'Authentique'],
    description: "Tu ne forces rien, tu observes, tu absorbes. Quand tu parles, tu vises juste. Les gens se confient à toi sans savoir pourquoi. Tu fuis les ambiances forcées et les conversations creuses. Une vraie soirée, pour toi, c'est un moment où on se sent vu.",
    axes: { energy: 'intro', structure: 'spontaneous', depth: 'deep', sociality: 'small' },
    matchesWith: {
      organizers: "facilitants, doux, à l'écoute",
      venues: 'chaleureux, intimistes (jardin, salon avec cheminée, tiers-lieu cosy)',
      experiences: ["cercles de parole", "dîners en petit comité", "ateliers d'expression douce", "balades guidées"],
    },
    avoids: ["compétitions", "jeux à enjeux", "grands groupes", "ambiances oppressantes"],
  },
  {
    id: 'creatif_libre',
    name: 'Le Créatif Libre',
    emoji: '🎨',
    tagline: "Tu n'arrives jamais avec un plan. Mais tu repars toujours avec une idée.",
    traits: ['Imaginatif', 'Improvisateur', 'Authentique'],
    description: "Tu es l'oxygène d'un groupe : tu lances des idées qui n'existaient pas avant que tu les dises. Tu kiffes l'inattendu, mais tu cherches aussi du fond. Une bonne soirée pour toi mélange du fou, du beau, et un truc qui te fait sentir vivant.",
    axes: { energy: 'extra', structure: 'spontaneous', depth: 'deep', sociality: 'small' },
    matchesWith: {
      organizers: "créatifs, ouverts, qui laissent de l'espace",
      venues: "atypiques, scénographiés (loft d'artiste, friche, lieu d'art)",
      experiences: ["ateliers d'impro", "soirées artistiques", "performances participatives", "dîners expérimentaux"],
    },
    avoids: ["cadres rigides", "programmes minute par minute", "ambiances conventionnelles"],
  },
  {
    id: 'observateur_profond',
    name: "L'Observateur Profond",
    emoji: '🔭',
    tagline: "Tu choisis le silence et le détail. Et c'est là que la magie opère.",
    traits: ['Posé', 'Lucide', 'Sage'],
    description: "Tu ne cherches ni à briller, ni à fuir. Tu observes, tu écoutes, tu sens. Tu accordes ta confiance lentement mais elle vaut de l'or. Pour toi, une soirée réussie est un moment ciselé, où chaque détail compte : la musique, la lumière, le rythme.",
    axes: { energy: 'intro', structure: 'structured', depth: 'deep', sociality: 'small' },
    matchesWith: {
      organizers: 'rigoureux, qui soignent les détails',
      venues: "posés, élégants, à l'esthétique travaillée",
      experiences: ["dîners gastronomiques", "soirées musicales acoustiques", "ateliers de connaisseur (vin, thé, méditation, calligraphie)"],
    },
    avoids: ["foule", "bruit", "chaos", "soirées sans intention"],
  },
]
