# Brief Stitch — 05 Détail d'une expérience

## Route
`/experiences/[id]`

## Intent unique
Faire cliquer sur **"Je participe"** (CTA primary).

## Audience
Utilisateur qui a cliqué sur une card du catalogue. Il veut comprendre ce qu'il achète.

## Structure (mobile-first)

### 1. Hero
- Image cover plein largeur (ratio 16:9 mobile, 21:9 desktop)
- Overlay dégradé bas (color-text à 40% opacity → transparent)
- Titre en blanc, font-display text-3xl, sur l'overlay
- Bouton retour ghost (top-left) → catalogue

### 2. Bandeau infos clés (sticky scroll)
- Date + heure (icône Calendar)
- Durée (icône Clock — ex: *"2h30"*)
- Capacité (icône Users — ex: *"8 places restantes / 12"*)
- **Prix du palier en cours** (text-2xl, font-bold) — ex: *"28€"*
- Sous le prix, badge du palier (rounded-full, text-xs) — ex: *"Early bird — 2 places restantes"* / *"Standard"* / *"Last chance"*
- En dessous, ligne discrète (text-xs, color-text-muted) annonçant le palier suivant — ex: *"Puis 35 € standard"* (cachée si on est déjà au last chance)

> Le prix et le palier sont calculés côté serveur via `getCurrentTier()`. Voir `09_PRICING.md`.

### 3. Section "Le menu social — Comprendre, Vivre, Oser"

C'est la signature de l'app. **3 actes psychologiques** présentés comme une timeline verticale.

> ⚠️ Pas d'icônes culinaires (assiettes, couverts, plats). Les termes "Entrée / Plat / Dessert" sont des **phases sociales**, pas de la nourriture. Voir `01_CONCEPT.md`.

Format de chaque acte (card rounded-2xl, p-4, reliées entre elles par une ligne verticale color-border) :

```
[1]  COMPRENDRE  ·  Entrée
     "Brise-glace"
     Présentation rapide en duo : qu'est-ce qui
     t'a fait accepter cette soirée ?
     · 20 min

[2]  VIVRE  ·  Plat
     "Blind test musical"
     5 manches en équipes de 3, le DJ provoque
     les débats.
     · 1h30

[3]  OSER  ·  Dessert
     "Cercle final"
     Verre offert, photo souvenir, on se livre
     avant de se quitter.
     · 30 min
```

- Le **verbe psychologique** (Comprendre / Vivre / Oser) est en font-display, text-2xl, color-primary
- Le mot "Entrée / Plat / Dessert" est secondaire (text-sm, color-text-muted, après le verbe)
- Le label de l'activité (ex: "Blind test musical") est en font-display text-xl
- La description en text-base
- La durée en text-xs color-text-muted
- En bas de chaque card, ligne discrète **"Le rôle de ton hôte"** (text-xs, italic, color-text-muted) qui rassure le participant :
  - Acte 1 : *"Il t'accueille, te présente le cadre, te met à l'aise."*
  - Acte 2 : *"Il s'efface, observe, encourage si tu galères."*
  - Acte 3 : *"Il facilite, sans jamais forcer."*

Pas d'emoji culinaire. Si un visuel est nécessaire, utiliser un **chiffre** (1 / 2 / 3) dans un cercle color-primary, ou les icônes lucide-react `eye` (Comprendre), `play` (Vivre), `heart` (Oser).

### 4. Section "Le lieu"
- Nom du lieu + ambiance (1 phrase)
- Pas de carte (map) en MVP — juste texte + adresse cliquable (`tel:` ou Google Maps)

### 5. Section "L'animateur"
- Avatar rond + prénom de l'organisateur
- Bio courte (2-3 phrases)

### 6. Section "Pour qui"
- Tags des profils compatibles (rounded-full, bg-primary/10)
- Phrase : *"On a pensé cette soirée pour les profils :"*

### 7. Section "Ce qui n'est pas compris"
- Bullet courte (texte transparent) : transport, conso non listée, etc.

### 8. CTA fixe (bottom sticky sur mobile)
- Bouton primary plein largeur : **"Je participe — 28€"** (le prix affiché est celui du palier en cours)
- Mention discrète sous le bouton : *"Tarif early bird — 2 places restantes"*
- Disabled si `capacity_current >= capacity_max` (label : *"Complet"*)

## Données affichées
- `Experience` complète depuis Supabase (par id)
- `menu_social` (jsonb) → entree / plat / dessert
- `compatible_profiles` (array) → afficher les noms via PROFILES constante

## Actions
- Tap "Je participe" → `/experiences/[id]/register`
- Tap retour → `/experiences`
- Tap adresse → ouvre Google Maps externe (target _blank)

## Style
- Fond color-surface pour la zone de contenu (légèrement détaché du bg)
- Hiérarchie : H1 hero → H2 sections (text-xl, font-display) → body
- Beaucoup d'espace vertical entre sections (`space-y-6`)

## États
- Loading : skeleton hero + sections
- Not found (id invalide) : message + lien retour catalogue
- Sold out : CTA disabled + form *"Inscris-toi en liste d'attente"* (waitlist par expérience — V1, pas MVP)

## Animations
- Hero parallax léger au scroll (desktop seulement)
- Sections en fade-in au scroll
- Reduce motion : pas de parallax, fade direct

## ⚠️ Pour Stitch
- **Pas** de carrousel d'images (une seule cover)
- **Pas** de témoignages d'anciens participants
- **Pas** de "soirées similaires" en bas (on a 5 expériences en tout en MVP)
- Le **menu social** est un élément différenciant — le mettre en valeur
