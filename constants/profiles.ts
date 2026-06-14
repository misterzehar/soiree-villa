export type ProfileId =
  | 'explorer_festif'
  | 'connecteur_social'
  | 'cerebrale_curieux'
  | 'empathique_calme'
  | 'creatif_libre'
  | 'observateur_profond'
  | 'animateur_creatif'
  | 'philosophe_festif'
  | 'boheme_collectif'
  | 'chef_de_projet'
  | 'stratege_reseauteur'
  | 'artiste_intime'
  | 'sage_creatif'
  | 'mediateur_discret'
  | 'hote_chaleureux'
  | 'disciple_du_flow'
  | 'explorateur_interieur'
  | 'conteur_social'
  | 'alchimiste_social'
  | 'contemplatif_inspire'

export type AxesTarget = {
  energy:     -1 | 0 | 1
  structure:  -1 | 0 | 1
  depth:      -1 | 0 | 1
  sociality:  -1 | 0 | 1
  cerebrale:  -1 | 0 | 1
  creativite: -1 | 0 | 1
}

export type Profile = {
  id: ProfileId
  name: string
  emoji: string
  tagline: string
  traits: [string, string, string]
  description: string
  axes_target: AxesTarget
  matchesWith: {
    organizers: string
    venues: string
    experiences: string[]
  }
  avoids: string[]
}

// axes_target: { energy, structure, depth, sociality, cerebrale, creativite }
// +1 = pôle positif (extraverti / structuré / profond / grand groupe / cérébral / créatif)
// -1 = pôle négatif (introverti / spontané / léger / petit comité / instinctif / conventionnel)
//  0 = neutre sur cet axe

export const PROFILES: Profile[] = [
  // ── PROFILS ORIGINAUX (6) ────────────────────────────────────────────────
  {
    id: 'explorer_festif',
    name: "L'Explorateur Festif",
    emoji: '🎉',
    tagline: "Tu aimes les ambiances vivantes, les grandes tablées, les imprévus qui réchauffent la nuit.",
    traits: ['Extraverti', 'Spontané', 'Festif'],
    description: "Tu es l'âme des soirées. Tu donnes l'impulsion, tu lances les fous rires, tu rends les inconnus complices en moins de 10 minutes. Pour toi, une réussite c'est une foule qui vibre ensemble. Le reste ? Détails.",
    axes_target: { energy: 1, structure: -1, depth: -1, sociality: 1, cerebrale: -1, creativite: 0 },
    matchesWith: {
      organizers: 'drôles, énergiques, fédérateurs',
      venues: 'festifs, ouverts, lumineux (rooftop, club, scène ouverte)',
      experiences: ['blind tests', 'soirées DJ', 'fêtes thématiques', "jeux d'ambiance", 'défis de groupe'],
    },
    avoids: ['activités calmes', 'cérébrales ou trop introspectives', 'petits comités contemplatifs'],
  },
  {
    id: 'connecteur_social',
    name: 'Le Connecteur Social',
    emoji: '🤝',
    tagline: "Tu rassembles les gens. Tu vois les ponts entre les personnalités, et tu kiffes les construire.",
    traits: ['Fédérateur', 'Empathique', 'Stratège social'],
    description: "Tu n'es pas juste sociable, tu es architecte de liens. Tu te souviens des prénoms, tu présentes les gens entre eux, tu remarques qui s'isole. Tu kiffes les soirées où tout le monde repart avec une vraie rencontre. La superficialité te lasse vite.",
    axes_target: { energy: 1, structure: 1, depth: 1, sociality: 1, cerebrale: 0, creativite: 0 },
    matchesWith: {
      organizers: 'facilitants, structurés',
      venues: 'ouverts, modulables (loft, salle privatisable, jardin)',
      experiences: ['dîners scénarisés', 'ateliers collaboratifs', 'soirées thématiques avec brassage'],
    },
    avoids: ['activités où on reste passif spectateur', 'soirées sans cadre'],
  },
  {
    id: 'cerebrale_curieux',
    name: 'Le Cérébral Curieux',
    emoji: '🧠',
    tagline: "Tu choisis tes soirées comme tes lectures : avec exigence, et l'envie d'en sortir plus riche.",
    traits: ['Stratège', 'Curieux', 'Sélectif'],
    description: "Tu n'es pas là pour le bruit. Tu cherches du sens, des conversations qui t'apprennent quelque chose, des jeux qui te font réfléchir. Tu préfères 5 personnes qui te stimulent à 50 qui s'agitent. Pour toi, une soirée réussie laisse une trace mentale.",
    axes_target: { energy: -1, structure: 1, depth: 1, sociality: -1, cerebrale: 1, creativite: -1 },
    matchesWith: {
      organizers: 'rigoureux, qui tiennent la barre',
      venues: 'intimistes (cave, bibliothèque privée, atelier)',
      experiences: ['escape games', 'murder parties', 'ateliers dégustation', 'débats animés', 'quiz pointus'],
    },
    avoids: ['foules anonymes', 'musique trop forte', 'improvisation totale'],
  },
  {
    id: 'empathique_calme',
    name: "L'Empathique Calme",
    emoji: '🌿',
    tagline: "Tu sens les ambiances avant de les comprendre. Et c'est ta plus belle qualité.",
    traits: ['Sensible', 'Médiateur', 'Authentique'],
    description: "Tu ne forces rien, tu observes, tu absorbes. Quand tu parles, tu vises juste. Les gens se confient à toi sans savoir pourquoi. Tu fuis les ambiances forcées et les conversations creuses. Une vraie soirée, pour toi, c'est un moment où on se sent vu.",
    axes_target: { energy: -1, structure: -1, depth: 1, sociality: -1, cerebrale: 0, creativite: 0 },
    matchesWith: {
      organizers: "facilitants, doux, à l'écoute",
      venues: 'chaleureux, intimistes (jardin, salon avec cheminée, tiers-lieu cosy)',
      experiences: ["cercles de parole", "dîners en petit comité", "ateliers d'expression douce", 'balades guidées'],
    },
    avoids: ['compétitions', 'jeux à enjeux', 'grands groupes', 'ambiances oppressantes'],
  },
  {
    id: 'creatif_libre',
    name: 'Le Créatif Libre',
    emoji: '🎨',
    tagline: "Tu n'arrives jamais avec un plan. Mais tu repars toujours avec une idée.",
    traits: ['Imaginatif', 'Improvisateur', 'Authentique'],
    description: "Tu es l'oxygène d'un groupe : tu lances des idées qui n'existaient pas avant que tu les dises. Tu kiffes l'inattendu, mais tu cherches aussi du fond. Une bonne soirée pour toi mélange du fou, du beau, et un truc qui te fait sentir vivant.",
    axes_target: { energy: 1, structure: -1, depth: 1, sociality: -1, cerebrale: 0, creativite: 1 },
    matchesWith: {
      organizers: "créatifs, ouverts, qui laissent de l'espace",
      venues: "atypiques, scénographiés (loft d'artiste, friche, lieu d'art)",
      experiences: ["ateliers d'impro", 'soirées artistiques', 'performances participatives', 'dîners expérimentaux'],
    },
    avoids: ['cadres rigides', 'programmes minute par minute', 'ambiances conventionnelles'],
  },
  {
    id: 'observateur_profond',
    name: "L'Observateur Profond",
    emoji: '🔭',
    tagline: "Tu choisis le silence et le détail. Et c'est là que la magie opère.",
    traits: ['Posé', 'Lucide', 'Sage'],
    description: "Tu ne cherches ni à briller, ni à fuir. Tu observes, tu écoutes, tu sens. Tu accordes ta confiance lentement mais elle vaut de l'or. Pour toi, une soirée réussie est un moment ciselé, où chaque détail compte : la musique, la lumière, le rythme.",
    axes_target: { energy: -1, structure: 1, depth: 1, sociality: -1, cerebrale: 1, creativite: 0 },
    matchesWith: {
      organizers: 'rigoureux, qui soignent les détails',
      venues: "posés, élégants, à l'esthétique travaillée",
      experiences: ['dîners gastronomiques', 'soirées musicales acoustiques', 'ateliers de connaisseur (vin, thé, méditation, calligraphie)'],
    },
    avoids: ['foule', 'bruit', 'chaos', 'soirées sans intention'],
  },

  // ── NOUVEAUX PROFILS (14) ─────────────────────────────────────────────────
  {
    id: 'animateur_creatif',
    name: "L'Animateur Créatif",
    emoji: '🎭',
    tagline: "Tu transformes chaque soirée en scène. Sans filet, sans script, et avec beaucoup de style.",
    traits: ['Spontané', 'Expressif', 'Fédérateur'],
    description: "Tu improvises des jeux, tu chantes, tu dessines, tu fédères par le geste et la créativité collective. L'énergie monte quand tu arrives. Tu n'as pas besoin de programme — tu es le programme.",
    axes_target: { energy: 1, structure: -1, depth: -1, sociality: 1, cerebrale: 0, creativite: 1 },
    matchesWith: {
      organizers: "spontanés, expressifs, qui font confiance à l'impro",
      venues: 'scènes ouvertes, espaces modulables, bars avec scène',
      experiences: ["soirées impro", 'karaokés alternatifs', 'jeux créatifs collectifs', 'ateliers dessin/écriture'],
    },
    avoids: ['soirées trop formelles', 'règles complexes', 'ambiances statiques'],
  },
  {
    id: 'philosophe_festif',
    name: 'Le Philosophe Festif',
    emoji: '💡',
    tagline: "Tu débats, tu questiones, tu dînes. Et tu veux tout faire en même temps, avec du monde.",
    traits: ['Curieux', 'Engagé', 'Convivial'],
    description: "Tu poses des questions qui dérangent, tu défends des thèses inattendues, et tu adorés ça en grand groupe. Pour toi, une soirée réussie fait bouger les idées autant que les corps. La flemme intellectuelle t'ennuie.",
    axes_target: { energy: 1, structure: 1, depth: 1, sociality: 1, cerebrale: 1, creativite: -1 },
    matchesWith: {
      organizers: 'intellectuellement engagés, structurés, passionnés',
      venues: 'grands espaces avec zones de discussion (amphithéâtres, rooftop, galeries)',
      experiences: ['débats mouvants', 'dîners philo', 'conférences participatives', 'murder parties'],
    },
    avoids: ['soirées superficielles', 'conversations de surface', 'programmes creux'],
  },
  {
    id: 'boheme_collectif',
    name: 'Le Bohème Collectif',
    emoji: '🌀',
    tagline: "Tu vis l'instant. Tu crées en groupe. Et tu n'as pas besoin de programme pour ça.",
    traits: ['Libre', 'Chaleureux', 'Instinctif'],
    description: "L'essentiel c'est d'être là, ensemble, dans quelque chose de vrai et d'inattendu. Tu te fondre dans une grande énergie collective, tu improvises, tu laisses les choses se faire. Le reste suit.",
    axes_target: { energy: 1, structure: -1, depth: 1, sociality: 1, cerebrale: -1, creativite: 1 },
    matchesWith: {
      organizers: "libres, chaleureux, qui font confiance au groupe",
      venues: 'friches, jardins communautaires, espaces alternatifs',
      experiences: ['festivals participatifs', 'dîners collaboratifs', 'soirées slam/performance'],
    },
    avoids: ['plannings rigides', 'soirées trop corporates', 'ambiances froides'],
  },
  {
    id: 'chef_de_projet',
    name: 'Le Chef de Projet Social',
    emoji: '📋',
    tagline: "Tu t'assures que tout le monde s'amuse. Et tu le fais avec une efficacité redoutable.",
    traits: ['Organisé', 'Leader', 'Fiable'],
    description: "Tu aimes organiser, fédérer, faire tourner le groupe efficacement. Tu t'assures que chaque invité a son moment, que le timing tient, que personne ne se perd. Pour toi, une soirée réussie c'est une soirée bien menée.",
    axes_target: { energy: 1, structure: 1, depth: -1, sociality: 1, cerebrale: 1, creativite: -1 },
    matchesWith: {
      organizers: 'sérieux, professionnels, bien organisés',
      venues: 'salles de réception, espaces professionnels, rooftops privatisés',
      experiences: ['team buildings', 'soirées quiz', 'blind tests', 'murder parties structurées'],
    },
    avoids: ['improvisation totale', 'soirées sans hôte', 'ambiances chaotiques'],
  },
  {
    id: 'stratege_reseauteur',
    name: 'Le Stratège Réseauteur',
    emoji: '🎯',
    tagline: "Tu choisis tes soirées comme tes investissements : avec méthode et intention.",
    traits: ['Stratégique', 'Analytique', 'Sélectif'],
    description: "Tu veux rencontrer des gens qui valent ton temps dans un cadre décontracté mais maîtrisé. Tu lis la pièce rapidement, tu identifies qui est qui, et tu construis des connexions utiles et sincères à la fois.",
    axes_target: { energy: 1, structure: 1, depth: -1, sociality: -1, cerebrale: 1, creativite: -1 },
    matchesWith: {
      organizers: 'professionnels, structurés, dans des niches claires',
      venues: 'lieux premium intimistes (restaurant privé, club select, bureau partagé en soirée)',
      experiences: ['networking by interest', 'dîners thématiques pros', 'soirées pitch & connect'],
    },
    avoids: ['soirées sans intention', 'groupes trop grands', 'improvisation'],
  },
  {
    id: 'artiste_intime',
    name: "L'Artiste Intime",
    emoji: '🖋️',
    tagline: "Dans un grand groupe tu te perds. Dans un petit cercle tu t'exprimes.",
    traits: ['Introverti', 'Créatif', 'Profond'],
    description: "Tu ne brilles pas dans les grandes foules mais dans les petits cercles où tu peux vraiment t'exprimer. Ta créativité est personnelle, profonde, presque silencieuse. Quand tu partages quelque chose, c'est réel.",
    axes_target: { energy: -1, structure: -1, depth: 1, sociality: -1, cerebrale: -1, creativite: 1 },
    matchesWith: {
      organizers: "sensibles, artists, qui créent de l'espace pour chacun",
      venues: "ateliers d'artiste, studios, tiers-lieux cosy",
      experiences: ["ateliers d'écriture", 'cercles de lecture', 'dîners intimes créatifs', 'sessions jamming'],
    },
    avoids: ['grands événements', 'compétitions', 'ambiances bruyantes'],
  },
  {
    id: 'sage_creatif',
    name: 'Le Sage Créatif',
    emoji: '🌙',
    tagline: "Tu combines l'analyse et l'imagination. Et tu en ressors toujours plus riche.",
    traits: ['Analytique', 'Imaginatif', 'Profond'],
    description: "Tu aimes les ateliers qui te font réfléchir ET créer. Tu choisis tes soirées avec soin, tu arrives préparé, et tu repartiras avec une idée nouvelle. Mieux vaut un soir mémorable que dix soirées ordinaires.",
    axes_target: { energy: -1, structure: 1, depth: 1, sociality: -1, cerebrale: 1, creativite: 1 },
    matchesWith: {
      organizers: 'rigoureux et créatifs à la fois',
      venues: 'espaces intimistes avec une esthétique forte (bibliothèques, caves voûtées, ateliers)',
      experiences: ['escape games narratifs', 'ateliers de design thinking', 'workshops co-création', 'dîners philosophiques'],
    },
    avoids: ['superficialité', 'grandes foules', 'soirées sans fond'],
  },
  {
    id: 'mediateur_discret',
    name: 'Le Médiateur Discret',
    emoji: '🕊️',
    tagline: "Tu n'occupes pas l'espace. Tu le régules. Et c'est ce qui rend les soirées douces.",
    traits: ['Discret', 'Fiable', 'Attentionné'],
    description: "Tu remarques ce que les autres ne voient pas. Tu désamorces les tensions d'un sourire, tu invites la personne en retrait, tu rends les soirées plus douces sans que personne sache comment. Dans un petit groupe bien cadré, tu excelles.",
    axes_target: { energy: -1, structure: 1, depth: -1, sociality: -1, cerebrale: 0, creativite: 0 },
    matchesWith: {
      organizers: "bienveillants, attentifs, à l'écoute",
      venues: 'chaleureux, intimistes, sans excès de stimulation',
      experiences: ['dîners en petit comité', 'ateliers coopératifs', 'balades thématiques', 'cercles de discussion'],
    },
    avoids: ['compétitions', 'grandes foules', 'ambiances tendues ou bruyantes'],
  },
  {
    id: 'hote_chaleureux',
    name: "L'Hôte Chaleureux",
    emoji: '🏡',
    tagline: "Tu prépares tout à la perfection pour tes proches. Et ça se voit.",
    traits: ['Généreux', 'Organisé', 'Accueillant'],
    description: "Tu es à ton meilleur quand tu accueilles dans un cadre intimiste que tu maîtrises de A à Z. Le détail qui fait la différence ? Tu y as pensé avant tout le monde. Et tu aimes ça.",
    axes_target: { energy: 1, structure: 1, depth: -1, sociality: -1, cerebrale: 0, creativite: 0 },
    matchesWith: {
      organizers: 'professionnels, chaleureux, aux petits soins',
      venues: "appartements privatisés, maisons d'hôtes, espaces cosy",
      experiences: ['dîners thématiques', 'soirées dégustation', 'blind tests intimes', 'ateliers cuisine'],
    },
    avoids: ['grandes foules', 'improvisation', 'lieux impersonnels'],
  },
  {
    id: 'disciple_du_flow',
    name: 'Le Disciple du Flow',
    emoji: '🌊',
    tagline: "Pas de planning, pas de réseau à construire — juste l'énergie du moment.",
    traits: ['Libre', 'Instinctif', 'Créatif'],
    description: "Tu te laisses porter. Tu arrives, tu ressens l'énergie collective, tu crées quelque chose avec les autres sans que ça soit prévu. Tu n'as pas besoin de contrôle — tu fais confiance au courant.",
    axes_target: { energy: -1, structure: -1, depth: -1, sociality: 1, cerebrale: -1, creativite: 1 },
    matchesWith: {
      organizers: "libres, spontanés, qui font confiance à l'énergie collective",
      venues: 'espaces ouverts, friches, jardins, plages',
      experiences: ['festivals', 'soirées spontanées', 'sessions musicales libres', 'soirées impro'],
    },
    avoids: ['plannings trop rigides', 'soirées cérébrales', 'cadres formels'],
  },
  {
    id: 'explorateur_interieur',
    name: "L'Explorateur Intérieur",
    emoji: '🧭',
    tagline: "Tu te perds dans un grand événement pour te retrouver toi-même.",
    traits: ['Introspectif', 'Curieux', 'Profond'],
    description: "L'anonymat de la foule te libère. Tu y observes, tu y rêves, tu fais de vraies découvertes sur toi-même. Un grand festival ou une soirée immersive peut changer quelque chose en toi.",
    axes_target: { energy: -1, structure: -1, depth: 1, sociality: 1, cerebrale: -1, creativite: 1 },
    matchesWith: {
      organizers: "créatifs, qui proposent des expériences immersives",
      venues: 'lieux immersifs, installations artistiques, espaces de performance',
      experiences: ['soirées immersives', 'expositions interactives', 'escape games narratifs', 'performances collectives'],
    },
    avoids: ['soirées superficielles', 'conversations creuses', 'ambiances compétitives'],
  },
  {
    id: 'conteur_social',
    name: 'Le Conteur Social',
    emoji: '📖',
    tagline: "Tu narres, tu joues, tu habites chaque histoire. Et les autres t'écoutent, les yeux brillants.",
    traits: ['Expressif', 'Profond', 'Spontané'],
    description: "Dans un petit groupe, tu es la personne qu'on écoute. Tu animes, tu connectes, tu transmets quelque chose de sincère. Tu n'as pas besoin d'une grande scène — juste de quelques personnes qui méritent une vraie histoire.",
    axes_target: { energy: 1, structure: -1, depth: 1, sociality: -1, cerebrale: -1, creativite: 1 },
    matchesWith: {
      organizers: "storytellers, expressifs, qui créent de l'espace pour l'autre",
      venues: 'espaces cosy et intimistes, caves, ateliers',
      experiences: ['dîners narratifs', 'soirées impro', 'ateliers slam', 'cercles de récit'],
    },
    avoids: ['grand anonymat', 'soirées sans parole', 'compétitions'],
  },
  {
    id: 'alchimiste_social',
    name: "L'Alchimiste Social",
    emoji: '⚗️',
    tagline: "Tu transformes les soirées en laboratoires humains. Et ça marche à chaque fois.",
    traits: ['Analytique', 'Créatif', 'Engagé'],
    description: "Tu observes, tu joues, tu crées des connexions inattendues. Tu combines la rigueur et l'imagination pour que des gens qui ne se seraient jamais rencontrés repartent complices. Dans un petit groupe, la magie peut vraiment opérer.",
    axes_target: { energy: 1, structure: 1, depth: 1, sociality: -1, cerebrale: 1, creativite: 1 },
    matchesWith: {
      organizers: 'rigoureux et créatifs, facilitateurs de liens',
      venues: 'espaces atypiques et bien pensés (lofts, ateliers, maisons d\'hôte)',
      experiences: ['workshops de design thinking', 'dîners scénarisés', 'ateliers créatifs structurés', 'escape games narratifs'],
    },
    avoids: ['grandes foules anonymes', 'soirées sans intention', 'conversations superficielles'],
  },
  {
    id: 'contemplatif_inspire',
    name: 'Le Contemplatif Inspiré',
    emoji: '✨',
    tagline: "Tu n'as pas besoin de beaucoup. Un verre, deux personnes, et tu reviens avec une nouvelle idée.",
    traits: ['Introverti', 'Créatif', 'Léger'],
    description: "Tu n'as pas besoin de grands événements. Une rencontre, une conversation, un détail qui te touche — et tu repars inspiré. Tes soirées idéales sont simples, belles, et laissent beaucoup de place au silence.",
    axes_target: { energy: -1, structure: -1, depth: -1, sociality: -1, cerebrale: -1, creativite: 1 },
    matchesWith: {
      organizers: 'sensibles, minimalistes, qui créent de la beauté simple',
      venues: 'petits lieux cosy (café, appartement, jardin secret)',
      experiences: ["apéros artistiques", 'soirées ciné indie', 'ateliers créatifs libres', 'dîners minimalistes'],
    },
    avoids: ['grandes foules', 'structures rigides', 'pression sociale'],
  },
]
