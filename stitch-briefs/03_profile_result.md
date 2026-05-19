# Brief Stitch — 03 Résultat profil

## Route
`/onboarding/result`

## Intent unique
Donner un effet **"wow"** au moment de la révélation du profil, sans surpromettre, et faire cliquer **"Voir mes soirées"**.

## Audience
Utilisateur qui vient de finir le quiz. Il attend une révélation.

## Structure (mobile-first)

### 1. Animation de révélation (400-600ms)
- Fond color-bg
- Au load : un cercle qui pulse au centre (color-primary), puis explose en confettis légers
- Le profil apparaît derrière

### 2. Carte profil (centre)
- Carte plein écran (max-width 480px desktop), rounded-3xl, shadow-md
- **Emoji du profil** en grand (text-6xl ou 96px)
- **Nom du profil** en font-display text-3xl (ex: *"L'Explorateur Festif"*)
- **Tagline** en text-lg italic, color-text-muted (ex: *"Tu aimes les ambiances vivantes, les grandes tablées, les imprévus."*)
- **3 traits** en tags arrondis (rounded-full, bg-primary/10, text-primary) : ex *"Extraverti / Spontané / Fun"*

### 3. Visualisation des 4 axes (en dessous)
- 4 lignes horizontales, chacune avec :
  - Label gauche (ex: *"Introverti"*)
  - Barre horizontale avec curseur positionné
  - Label droite (ex: *"Extraverti"*)
- Le curseur est positionné selon le score (-3 à +3 mappé sur 0-100%)
- Couleur de la barre : color-border ; curseur : color-primary

### 4. Texte de transition (court)
*"On a 3 soirées qui matchent ton style ce mois-ci."* (dynamique : "0 soirée" si vide)

### 5. CTAs
- Bouton primary plein largeur : **"Voir mes soirées"** → `/experiences`
- Bouton ghost en dessous : *"Refaire le quiz"* → `/onboarding`
- Lien petit en bas : *"Partager mon profil"* (copie un lien type `/profil/explorer-festif` — optionnel MVP, peut être désactivé)

## Données affichées
- `profile` retourné par `computeProfile()` (cf. `05_MATCHING.md`)
- `axesScores` (les 4 scores -3 à +3)
- Compteur d'expériences compatibles (count des matches)

## Actions
- "Voir mes soirées" → `/experiences`
- "Refaire le quiz" → `/onboarding` (reset cookie)
- "Partager" (optionnel) → copie l'URL dans le clipboard, toast confirmation

## Style
- Fond color-bg avec peut-être un gradient subtil (color-primary/5 → color-secondary/5)
- Beaucoup d'espace blanc, hiérarchie claire
- Emoji très grand pour porter l'émotion

## États
- Loading (rare) : skeleton de la carte
- Erreur (cookie absent) : message *"On a perdu tes réponses, refais le quiz"* + bouton

## Animations
- Révélation initiale : 400-600ms (confettis CSS ou Lottie léger)
- Apparition des axes : stagger 100ms entre chaque ligne
- Reduce motion : suppression confettis + axes, juste fade-in

## ⚠️ Pour Stitch
- **Un seul profil affiché à la fois** (pas une grille des 6)
- Pas de comparaison avec d'autres profils
- Pas de "score sur 100" — on parle en traits, pas en notes
- Garder l'écran **léger** : le wow vient de l'animation, pas du remplissage
