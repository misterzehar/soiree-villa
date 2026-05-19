# 12 — Les 15 questions de l'onboarding "Tu préfères ?"

> Sources : `app_organisé/03_Matching_et_algorithme/05 - Liste 'Tu préfères ?'.docx` (banque de questions) + `03 - Logique de scoring.docx` (axes).
> Ces 15 questions sont la **version MVP figée**. Pour V1+, on passera à 25-30 questions sur 6 axes.

## Principe

15 cartes "Tu préfères ?" présentées en swipe. Chaque carte modifie **un seul axe** de **+1** ou **-1**.

## Les 4 axes du MVP (cf. `04_DATA_MODEL.md`)

| Axe | Code | Pôle - (-1) | Pôle + (+1) |
|-----|------|-------------|-------------|
| Énergie | `energy` | Introverti (`intro`) | Extraverti (`extra`) |
| Structure | `structure` | Spontané (`spontaneous`) | Structuré (`structured`) |
| Profondeur | `depth` | Léger (`light`) | Profond (`deep`) |
| Socialité | `sociality` | Petit groupe (`small`) | Grand groupe (`large`) |

## Répartition des 15 questions

- **Énergie** : 4 questions
- **Structure** : 4 questions
- **Profondeur** : 4 questions
- **Socialité** : 3 questions

---

## Les 15 questions

### 🎭 ÉNERGIE — 4 questions

#### Question 1
*"Tu préfères ?"*
- **A** — Une soirée festive avec DJ et lumière qui pulse → `energy: +1`
- **B** — Un apéro cosy à la maison entre proches → `energy: -1`

#### Question 2
*"Tu préfères ?"*
- **A** — Arriver le premier et accueillir tout le monde → `energy: +1`
- **B** — Te glisser quand l'ambiance est déjà lancée → `energy: -1`

#### Question 3
*"Tu préfères ?"*
- **A** — Lancer la conversation avec un inconnu → `energy: +1`
- **B** — La rejoindre quand elle a déjà commencé → `energy: -1`

#### Question 4
*"Tu préfères ?"*
- **A** — Être au centre d'une photo de groupe → `energy: +1`
- **B** — Sur le côté, plus discret → `energy: -1`

---

### 🧩 STRUCTURE — 4 questions

#### Question 5
*"Tu préfères ?"*
- **A** — Une soirée avec un programme annoncé → `structure: +1`
- **B** — Une soirée surprise totale → `structure: -1`

#### Question 6
*"Tu préfères ?"*
- **A** — Des jeux avec des règles claires → `structure: +1`
- **B** — De l'impro totale, pas de cadre → `structure: -1`

#### Question 7
*"Tu préfères ?"*
- **A** — Réserver une table à l'avance → `structure: +1`
- **B** — Trouver un endroit sur le moment → `structure: -1`

#### Question 8
*"Tu préfères ?"*
- **A** — Une to-do list pour préparer ta soirée → `structure: +1`
- **B** — Tout improviser le jour J → `structure: -1`

---

### 💎 PROFONDEUR — 4 questions

#### Question 9
*"Tu préfères ?"*
- **A** — Une discussion qui te marque longtemps → `depth: +1`
- **B** — Un fou rire collectif que t'oublies vite → `depth: -1`

#### Question 10
*"Tu préfères ?"*
- **A** — Confier quelque chose de perso à un inconnu → `depth: +1`
- **B** — Rester dans le fun léger → `depth: -1`

#### Question 11
*"Tu préfères ?"*
- **A** — Faire UNE rencontre marquante dans une soirée → `depth: +1`
- **B** — Croiser DIX personnes sympas → `depth: -1`

#### Question 12
*"Tu préfères ?"*
- **A** — Te souvenir d'une émotion forte → `depth: +1`
- **B** — Te souvenir d'une anecdote drôle → `depth: -1`

---

### 👥 SOCIALITÉ — 3 questions

#### Question 13
*"Tu préfères ?"*
- **A** — Une soirée à 12 personnes que tu connais à peine → `sociality: +1`
- **B** — Un dîner à 4 avec des potes proches → `sociality: -1`

#### Question 14
*"Tu préfères ?"*
- **A** — Un bar bondé un samedi soir → `sociality: +1`
- **B** — Un rooftop intimiste avec 6 personnes → `sociality: -1`

#### Question 15
*"Tu préfères ?"*
- **A** — Un festival → `sociality: +1`
- **B** — Un dîner privé → `sociality: -1`

---

## Format TypeScript prêt à copier-coller

```ts
// constants/onboarding-questions.ts

export type Axis = 'energy' | 'structure' | 'depth' | 'sociality'

export type OnboardingQuestion = {
  id: number
  axis: Axis
  optionA: { label: string; value: 1 | -1 }
  optionB: { label: string; value: 1 | -1 }
}

export const QUESTIONS: OnboardingQuestion[] = [
  // ÉNERGIE
  { id: 1,  axis: 'energy',    optionA: { label: 'Une soirée festive avec DJ et lumière qui pulse', value: 1 },  optionB: { label: 'Un apéro cosy à la maison entre proches', value: -1 } },
  { id: 2,  axis: 'energy',    optionA: { label: 'Arriver le premier et accueillir tout le monde', value: 1 },  optionB: { label: 'Te glisser quand l\'ambiance est déjà lancée', value: -1 } },
  { id: 3,  axis: 'energy',    optionA: { label: 'Lancer la conversation avec un inconnu', value: 1 },          optionB: { label: 'La rejoindre quand elle a déjà commencé', value: -1 } },
  { id: 4,  axis: 'energy',    optionA: { label: 'Être au centre d\'une photo de groupe', value: 1 },           optionB: { label: 'Sur le côté, plus discret', value: -1 } },

  // STRUCTURE
  { id: 5,  axis: 'structure', optionA: { label: 'Une soirée avec un programme annoncé', value: 1 },            optionB: { label: 'Une soirée surprise totale', value: -1 } },
  { id: 6,  axis: 'structure', optionA: { label: 'Des jeux avec des règles claires', value: 1 },                optionB: { label: 'De l\'impro totale, pas de cadre', value: -1 } },
  { id: 7,  axis: 'structure', optionA: { label: 'Réserver une table à l\'avance', value: 1 },                  optionB: { label: 'Trouver un endroit sur le moment', value: -1 } },
  { id: 8,  axis: 'structure', optionA: { label: 'Une to-do list pour préparer ta soirée', value: 1 },          optionB: { label: 'Tout improviser le jour J', value: -1 } },

  // PROFONDEUR
  { id: 9,  axis: 'depth',     optionA: { label: 'Une discussion qui te marque longtemps', value: 1 },          optionB: { label: 'Un fou rire collectif que t\'oublies vite', value: -1 } },
  { id: 10, axis: 'depth',     optionA: { label: 'Confier quelque chose de perso à un inconnu', value: 1 },     optionB: { label: 'Rester dans le fun léger', value: -1 } },
  { id: 11, axis: 'depth',     optionA: { label: 'Faire UNE rencontre marquante dans une soirée', value: 1 },   optionB: { label: 'Croiser DIX personnes sympas', value: -1 } },
  { id: 12, axis: 'depth',     optionA: { label: 'Te souvenir d\'une émotion forte', value: 1 },                optionB: { label: 'Te souvenir d\'une anecdote drôle', value: -1 } },

  // SOCIALITÉ
  { id: 13, axis: 'sociality', optionA: { label: 'Une soirée à 12 personnes que tu connais à peine', value: 1 },optionB: { label: 'Un dîner à 4 avec des potes proches', value: -1 } },
  { id: 14, axis: 'sociality', optionA: { label: 'Un bar bondé un samedi soir', value: 1 },                     optionB: { label: 'Un rooftop intimiste avec 6 personnes', value: -1 } },
  { id: 15, axis: 'sociality', optionA: { label: 'Un festival', value: 1 },                                     optionB: { label: 'Un dîner privé', value: -1 } },
]
```

## ⚠️ Pour Claude Code

- Ces 15 questions sont **figées** pour le MVP. Si J veut en ajouter / modifier, il les modifie ici **avant** de toucher au code, et tu mets à jour la constante dans le même commit.
- L'ordre de présentation peut être **mélangé** (random shuffle) à chaque session pour éviter les biais d'ordre. Mais on garde toujours les 15 questions, pas un sous-ensemble.
- Chaque réponse modifie **un seul axe**. Pas de cumul, pas de croisement (V1+).
- Les 6 axes du concept original (cf. `app_organisé/03_Matching_et_algorithme/03 - Logique de scoring.docx`) reviendront en V1. Pour le MVP, on n'utilise que 4 axes.
