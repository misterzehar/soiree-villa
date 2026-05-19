# Brief Stitch — 02 Onboarding "Tu préfères ?"

## Route
`/onboarding`

## Intent unique
Faire répondre l'utilisateur à **15 questions binaires** sans frustration, en mode jeu.

## Audience
Visiteur qui vient de cliquer "Découvre ton style". Engagement faible — il faut que ce soit fun et rapide (< 2 minutes).

## Structure

### En-tête (sticky top)
- Logo discret à gauche
- **Progress bar** au centre : 15 segments, remplit 1 par 1 à mesure des réponses
- À droite : *"3 / 15"* (compteur texte)

### Zone principale — UNE carte à la fois, plein écran

Carte de question (rounded-3xl, plein écran sur mobile, max-width 400px desktop) :

```
┌─────────────────────────────┐
│                             │
│   [Image option A]          │
│                             │
│   "Apéro avec 10 inconnus"  │
│                             │
├─── ou ──────────────────────┤
│                             │
│   [Image option B]          │
│                             │
│   "Dîner avec 3 amis"       │
│                             │
└─────────────────────────────┘
```

- 2 zones cliquables (haut = option A, bas = option B)
- **Swipe horizontal aussi** : swipe à gauche = A, swipe à droite = B (ou inverse, à tester)
- Animation au tap : la carte choisie scale 1.05 + glow primary, l'autre fade
- Transition vers carte suivante : slide up + fade in (300ms)

### Bas de page
- Bouton ghost *"Retour"* (revenir à la question précédente)
- Pas de bouton "Skip" — on force la réponse pour avoir un score propre

## Données affichées
- Les 15 questions chargées depuis la constante `QUESTIONS` (cf. `04_DATA_MODEL.md`)
- Stockage local des réponses en cookie/sessionStorage au fur et à mesure

## Actions
- Tap option A → enregistre `{ q: 1, choice: 'A' }`, passe à la question suivante
- Tap option B → idem
- Bouton retour → revient à la question précédente sans perdre la progression
- À la 15ème question répondue → `computeProfile()` → redirection vers `/onboarding/result`

## Style
- Fond très neutre (color-bg) pour laisser respirer les images
- Cartes : photo cover en haut (60% de la hauteur), label en bas (texte court)
- Le label en font-display, text-2xl, en gras
- "ou" entre les deux options : badge rond bg-accent, text-white, text-sm

## États
- Loading initial : skeleton de la première carte (200ms max)
- Erreur de chargement (rare) : message inline + bouton "Recommencer"

## Animations
- Swipe : `cubic-bezier(0.22, 1, 0.36, 1)`, durée 200ms
- Apparition carte suivante : 300ms slide up + fade
- Progress bar : transition fluide (CSS, pas saccadée)
- Reduce motion : suppression du swipe, simple fondu

## Retour haptique (mobile)
- 10ms vibration sur chaque réponse validée (`navigator.vibrate(10)`)

## ⚠️ Pour Stitch
- **Une seule carte affichée à la fois**, pas un long formulaire scrollable
- Pas de progress en pourcentage, juste segments visuels
- Mobile = priorité absolue (375px)
- Pas de header de menu, pas de sidebar
- Le swipe est **secondaire** — le tap doit aussi marcher pour ceux qui ne devinent pas le swipe
