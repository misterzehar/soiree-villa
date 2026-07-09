---
name: Soirée Villa
description: Plateforme de matching social pour expériences animées à Nice — "Comprendre, Vivre, Oser"
colors:
  canvas: "#0C0B12"
  gold: "#D4AF37"
  primary: "#4A6CF7"
  secondary: "#A259FF"
  accent: "#FF7A59"
  bg: "#FAFAFA"
  surface: "#FFFFFF"
  border: "#E8E8EC"
  text: "#1A1A2E"
  text-muted: "#6B6B7A"
  wine: "#722F37"
  terracotta: "#BC6B4A"
  success: "#4ADE80"
  error: "#F87171"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "clamp(2.8rem, 7.5vw, 6.75rem)"
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.28em"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  2xl: "16px"
  3xl: "24px"
spacing:
  sm: "16px"
  md: "32px"
  lg: "48px"
  xl: "64px"
  2xl: "112px"
components:
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  button-ghost-dark-hover:
    backgroundColor: "rgba(255,255,255,0.07)"
    textColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  button-ghost-light-hover:
    backgroundColor: "rgba(26,26,46,0.04)"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  experience-card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "0"
  pro-tile:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "24px 32px"
---

# Design System: Soirée Villa

## 1. Overview

**Creative North Star: "La Loge Privée"**

Soirée Villa est une mise en scène, pas une marketplace. Chaque écran doit donner le sentiment d'entrer dans une salle de spectacle privée — l'interface est le plateau, le visiteur est l'acteur principal. Le système visuel opère en huis-clos choisi : retenu, cinématique, sans publicité d'ambiance. La qualité se dit par ce qu'on retire, pas par ce qu'on ajoute. Un hôtel boutique de 12 chambres sait exactement ce qu'il est ; ce design system aussi.

La dualité tonale — fond cinématique sombre (`canvas`, #0C0B12) pour les scènes de mise en ambiance, fond éditorial clair (`bg`, #FAFAFA) pour le contenu lisible — n'est pas un dark mode. C'est une grammaire dramaturgique : chaque cut entre surface claire et sombre est une transition de scène. L'Or Niçois (#D4AF37) est le seul signal chromatique fort ; sa rareté est son pouvoir. Le bleu primaire (#4A6CF7) opère en coulisse, fonctionnel, jamais décoratif.

Ce système repousse explicitement : Eventbrite (transactionnel, listing de masse, l'exact contraire de la curation), Fever/Shotgun (FOMO par design, neon, manipulation visible — "nous ne vendons pas de l'anxiété"), Meetup (UX forum, communautaire bruyant), Facebook Events (bruit réseau, pas de mise en scène), et la monoculture SaaS cream de 2026 (fond beige/sable, Fraunces + kicker small-caps sur chaque section, générique IA). Si l'une de ces références peut décrire ce que vous êtes en train de construire, recommencez.

**Key Characteristics:**
- Scènes cinématiques (`bg-canvas`) alternent avec sections éditoriales (`bg-bg`) comme des cuts de montage — pas un toggle dark mode
- Un seul accent chromatique fort par écran maximum — l'Or Niçois (#D4AF37)
- Typographie font-light (weight 300) comme personnalité principale — la retenue signale la qualité
- Coins francs (0px) sur tous les CTAs : le luxe ne s'arrondit pas
- Labels 10px / tracking 0.28em comme système nommé ("Le Kicker Contextuel"), non comme scaffolding réflexe
- Plat par défaut : pas d'ombres au repos, profondeur par contraste tonal et bordures 1px

## 2. Colors: La Palette du Soir

Un continuum sombre-clair ancré sur deux pôles — la nuit cinématique et le jour éditorial — avec un seul éclat chromatique, l'Or Niçois.

### Primary (Brand Identity)

- **Nuit Cinématique** (`canvas`, #0C0B12): Le fond des sections héros et de toute mise en scène immersive. Quasi-noir avec un glissement violet-bleu imperceptible (oklch ~8% C 0.02 H 275). Jamais utilisé comme fond de texte courant.
- **Or Niçois** (`gold`, #D4AF37): La signature chromatique de la marque. Lumière méditerranéenne à la tombée du jour — chaude, présente, sans ostentation. Utilisé uniquement sur : le mot-clé du titre hero, la règle horizontale des 3 actes (w-6 h-px), la flèche des CTAs.

**The One Voice Rule.** L'Or Niçois apparaît sur ≤3 éléments distincts par écran. Sa rareté est le point. Plus c'est rare, plus l'œil s'y arrête. Dès qu'il apparaît partout, il n'existe plus.

### Secondary (Product Interface)

- **Bleu Social** (`primary`, #4A6CF7): Accent fonctionnel — labels d'étapes ("Comprendre", "Vivre", "Oser" dans le stepper), états hover sur titles de cards, focus rings, flèche des CTAs sur surface claire. Jamais décoratif ; toujours porteur d'information.
- **Violet Créatif** (`secondary`, #A259FF): Réservé aux éléments de profil social et aux tags de catégorie. Signale la dimension "matching" du produit.
- **Orange Chaleureux** (`accent`, #FF7A59): Accents d'alerte et indicateurs d'urgence (places limitées, deadline). Jamais en fond de section.

### Neutral

- **Encre Profonde** (`text`, #1A1A2E): Texte courant sur surfaces claires. Navy-noir — jamais noir pur (#000), trop froid pour le registre intime.
- **Encre Secondaire** (`text-muted`, #6B6B7A): Metadata, labels de section, prix secondaires, texte d'appui. Ratio 4.53:1 sur `bg` — WCAG AA passant de justesse. Ne pas éclaircir.
- **Page Claire** (`bg`, #FAFAFA): Fond éditorial par défaut. Near-white sans tinte chaude — la chaleur vient du contenu (typographie, or, images), pas du fond.
- **Surface Élevée** (`surface`, #FFFFFF): Fond des modals, drawers, popovers — 1 niveau au-dessus de `bg`.
- **Frontière Invisible** (`border`, #E8E8EC): Séparateurs de section, bordures de tiles Pro, input borders. Toujours 1px.

### Evening Themes (Contextual)

Tokens réservés aux badges et tags de thème de soirée. Interdit comme fond de section :

- **Bordeaux Théâtre** (`burgundy`, #800020) · **Bourgogne** (`wine`, #722F37) · **Terre d'Ocre** (`terracotta`, #BC6B4A) · **Acid Vert** (`acid`, #9EDC3A) · **Cyan Électrique** (`electric`, #00FFFF)

### Status

`success` (#4ADE80), `error` (#F87171), `warning` (#FACC15) — usage uniquement sémantique, jamais décoratif.

**The Canvas-or-White Rule.** Les fonds de section n'ont que deux valeurs autorisées : `canvas` (#0C0B12) ou `bg` (#FAFAFA). Tout autre fond de section est interdit — ni gris intermédiaire, ni teinte de thème de soirée, ni `surface` (#FFFFFF) en pleine page.

## 3. Typography: La Voix du Kiosque

**Display Font:** Plus Jakarta Sans (weights 300–800, via `--font-display`) — fallback Inter, sans-serif.
**Body Font:** system-ui (via `--font-body`) — stack natif pour performance maximale.

**Character:** Un contraste volontaire entre l'élégance du display (Plus Jakarta Sans léger, condensé, tracking négatif) et la transparence du body (system-ui, neutre, invisible). Le display EST la marque ; le body SE RETIRE pour laisser lire. Pas de serif, pas de mono — l'intimité vient de la légèreté et du tracking négatif, pas du classicisme librairie.

### Hierarchy

- **Display** (weight 300, `clamp(2.8rem, 7.5vw, 6.75rem)`, line-height 1.03, letter-spacing -0.04em): Titre hero uniquement. Maximal par définition. `maxWidth: 13ch` — jamais plus de 13 caractères de large. L'accent Or Niçois peut colorer un mot ou fragment dans ce contexte.
- **Headline** (weight 300, `clamp(1.75rem, 4vw, 3rem)`, line-height 1.2, letter-spacing -0.03em): Titres de section (H2). Font-light toujours — le medium (500) n'est jamais appliqué aux H2.
- **Title** (weight 500, `clamp(1.1rem, 2.5vw, 1.5rem)`, line-height 1.2, letter-spacing -0.02em): Sous-titres (H3) dans les steppers et les cards d'acte.
- **Body** (weight 400, 0.875rem / 14px, line-height 1.5): Descriptions, copy d'appui. Maximum 60ch de large (`max-w-xs` / `max-w-sm`). `text-sm leading-relaxed` en Tailwind.
- **Label** (weight 500, 0.625rem / 10px, letter-spacing 0.28em, UPPERCASE): "Le Kicker Contextuel" — une seule ligne de contexte au-dessus d'un Headline H2. Couleur : `text-muted` sur fond clair, `white/30` sur fond `canvas`. Ne jamais apparaître seul ou isolé d'un H2.

**The Featherweight Rule.** Font-weight 300 (light) est le poids par défaut pour tous les titres display et headline. Le medium (500) est réservé aux sous-titres (H3) et labels uniquement. Le bold (700+) n'apparaît que dans les nombres outline du stepper — et uniquement parce que `WebkitTextStroke` nécessite l'épaisseur pour tenir le tracé sur ce fond blanc.

**The Kicker System Rule.** Les labels 10px / tracking 0.28em / uppercase ("Le Kicker Contextuel") sont un système de marque nommé, pas un scaffolding réflexe. Règles d'usage : (1) un seul kicker par section, positionné immédiatement au-dessus du H2 ; (2) le texte du kicker doit apporter une information absente du titre (localisation, catégorie, numéro d'étape) — un kicker qui répète le sens du titre est une redondance interdite ; (3) `text-muted` sur fond clair, `white/30` sur fond canvas.

## 4. Elevation

Ce système est plat par défaut. Les surfaces sont au repos sans ombre. La profondeur est exprimée par deux mécanismes : le contraste tonal (la transition entre `canvas` et `bg` crée la profondeur la plus dramatique du système) et les bordures `border` 1px (#E8E8EC), qui délimitent sans soulever.

Les tokens d'ombre définis dans les variables CSS sont disponibles, mais réservés aux couches flottantes uniquement :

- **`shadow-sm`** (`0 1px 2px rgba(0,0,0,0.04)`): Inputs au focus, dropdowns au repos.
- **`shadow-md`** (`0 4px 12px rgba(0,0,0,0.08)`): Drawers et panneaux latéraux ouverts.
- **`shadow-lg`** (`0 8px 24px rgba(0,0,0,0.12)`): Modals et dialogs.
- **`shadow-xl`** (`0 16px 48px rgba(0,0,0,0.16)`): Toasts et notifications.

**The Flat-By-Default Rule.** Aucune surface au repos n'a d'ombre. Un card d'expérience, un tile partenaire, une section de contenu : toujours plats. Les ombres n'existent qu'en réponse à une élévation interactive (modal ouvert, drawer déployé) ou à un état flottant (tooltip, dropdown). Si un élément a une ombre et qu'il n'est ni interactif ni flottant, supprimez l'ombre.

## 5. Components

### Buttons

Les CTAs de Soirée Villa ne sont pas des boutons — ce sont des apartés théâtraux. Forme délibérément sobre pour ne pas interrompre la mise en scène.

- **Shape:** Coins francs (0px de rayon). Interdit : `rounded-*` sur tout CTA. Le luxe ne s'arrondit pas.
- **Ghost Dark** (surface `canvas`): `border: 1px solid rgba(255,255,255,0.2)`, `color: white`, `font-size: 11px`, `font-weight: 500`, `letter-spacing: 0.12em`, `text-transform: uppercase`, `padding: 14px 32px`. Toujours accompagné d'une flèche `→` en Or Niçois (#D4AF37).
- **Ghost Light** (surface `bg`): Même structure, `border: 1px solid rgba(26,26,46,0.2)`, `color: text`. Flèche `→` en Bleu Social (#4A6CF7) sur surface claire.
- **Text Link** (navigation secondaire): Texte seul, `font-size: 11px`, `letter-spacing: 0.1em`, uppercase, `color: text-muted/40`. Hover: `text-muted/70`. Jamais de soulignement.
- **Hover:** `background-color 300ms ease` (ghost) ou `color 200ms ease` (text link). Focus-visible: `outline: 2px solid #4A6CF7; outline-offset: 2px`. Aucune transformation scale ou translate sur les CTAs.

**The Ghost-Only Rule.** Les boutons solides (fond plein) n'existent pas dans le registre brand. Tout CTA est transparent au repos. Un fond plein signalerait une interface applicative (dashboard, admin), pas une expérience éditoriale.

### Cards / Experience Cards

Le card d'expérience est un cadre photographique, pas un conteneur d'information.

- **Corner Style:** 0px.
- **Structure:** Image `aspect-video` (ou `aspect-[4/3]` pour Explorer) en pleine largeur, métadonnées typographiques en-dessous. Pas de padding sur l'image. Pas de fond coloré sous les métadonnées.
- **Image behavior:** `object-cover`, `overflow-hidden`. Hover: `scale(1.02)` en `transition-transform duration-500 cubic-bezier(0.16,1,0.3,1)`. La transformation est sur l'image, pas sur le card.
- **Title:** font-display, font-medium (500), font-size 14px, letter-spacing -0.01em. Hover: `text` → `primary`.
- **Meta:** system-ui, 12px, `text-muted`. Date · Lieu · Prix sur une même ligne.
- **Background:** transparent. Aucune ombre. Aucune bordure.

**The No-Card-Border Rule.** Les cards d'expérience n'ont aucune bordure. L'espace blanc entre les cards est la seule délimitation. Une bordure signalerait une liste de résultats (registre product).

### Pro Partner Tiles

Grille de 3 colonnes séparées par `gap-px` sur fond `border` — l'illusion d'un séparateur 1px entre les tiles sur desktop (`md:grid-cols-3 gap-4 md:gap-px md:bg-border`).

- **Shape:** 0px, padding `24px 32px`.
- **Background:** `bg-bg` au repos, `bg-surface` au hover. `transition: background-color 300ms ease`.
- **Border:** `border border-border` sur mobile. Supprimée sur desktop (le gap-px remplace).
- **Structure:** Label role (10px uppercase, `text-muted`) → Description body (14px, `text-muted`, line-height 1.5) → CTA text link (11px uppercase, `text` → `primary` au hover).

### Inputs / Fields

Système shadcn/ui. `border border-input bg-surface rounded-lg` (radius 8px). Focus: `ring-2 ring-ring ring-offset-2` (Bleu Social). Error: `border-destructive`. Disabled: `opacity-50 cursor-not-allowed`. Placeholder: contraste ≥ 4.5:1 contre `bg-surface` — ne pas utiliser le gris placeholder par défaut qui échoue WCAG.

### Navigation (SiteHeader)

Deux variantes : `dark` (sur `canvas`, texte blanc) et `light` (sur `bg`, texte `text`). Logo : font-display, font-medium (500), letter-spacing -0.02em. Liens de nav : 11px, uppercase, tracking-[0.1em]. Nav transparente, pas de fond, pas d'ombre — elle flotte sur l'image ou la couleur de fond.

### Signature Components

**The 3 Actes Card (on Canvas):** Micro-anatomie propre à Soirée Villa. Chaque acte est une colonne desktop, un bloc empilé mobile. Structure : numéro + tagline (10px uppercase, `white/30`) → règle horizontale Or Niçois (`w-6 h-px bg-gold`) → verb H3 (font-light, `white`, letter-spacing -0.025em) → description (14px, `white/45`). La règle gold est l'accent chromatique distinctif de cette section — sa seule occurrence autre que le hero.

**The Stepper Numbers (How It Works):** Nombres outline (1, 2, 3) réalisés par `WebkitTextStroke: 1.5px rgb(var(--color-border-rgb))` + `color: transparent`. Taille : `clamp(5rem, 12vw, 10rem)`. Font-bold requis pour que le tracé tienne. Connecteur vertical entre étapes : `w-px h-12 bg-border mt-3`. Technique non-standard mais broadly supported (Chrome, Safari, Firefox) et sans alternative CSS équivalente.

## 6. Do's and Don'ts

### Do:

- **Do** utiliser `bg-canvas` (#0C0B12) et `bg-bg` (#FAFAFA) comme seuls fonds de section — le contraste entre les deux EST la mise en scène.
- **Do** maintenir l'Or Niçois (#D4AF37) sur ≤3 éléments par écran. Sa rareté est son pouvoir.
- **Do** appliquer font-weight 300 (light) à tous les H1 et H2 — la légèreté typographique signale la retenue de marque.
- **Do** garder les CTAs en ghost (transparent au repos, bordure fine 1px) avec coins 0px — jamais de fond solide, jamais d'arrondi.
- **Do** vérifier le contraste de `text-muted` (#6B6B7A) sur `bg-bg` (#FAFAFA) à chaque nouvelle occurrence — ratio 4.53:1, WCAG AA passant de justesse. Ne pas éclaircir `text-muted`.
- **Do** respecter `prefers-reduced-motion` — toutes les animations Framer Motion ont une alternative instantanée (globals.css `animation-duration: 0.01ms !important`).
- **Do** utiliser `text-wrap: balance` sur les H1–H3 pour éviter les orphelines.
- **Do** remplacer tout `bg-border/30` placeholder par une image réelle dès qu'elle est disponible — les placeholders CSS sont un mensonge de marque (PRODUCT.md, Principe 5 : "L'image comme preuve").

### Don't:

- **Don't** utiliser un fond coloré autre que `canvas` ou `bg` pour des sections entières — ni `primary/10`, ni fond de thème de soirée (`wine`, `burgundy`), ni gris intermédiaire.
- **Don't** utiliser des dégradés de couleur (gradient text avec `background-clip: text`, ou fonds dégradés décoratifs) — "l'esthétique neon/fluo : dégradés électriques" est explicitement rejetée par PRODUCT.md.
- **Don't** reproduire l'esthétique SaaS cream : fond beige/sable chaud, Fraunces + kicker small-caps générique sur chaque section. C'est "la monoculture IA 2026 — exactement ce que nous ne sommes pas" (PRODUCT.md).
- **Don't** construire dans le registre Eventbrite (grilles denses de listings, filtres en barre latérale, cards identiques en masse) — "transactionnel, générique, catalogue de masse. Le contraire de la curation" (PRODUCT.md).
- **Don't** simuler Fever/Shotgun : FOMO visible, urgence neon, compteurs de décompte manipulatoires. "Nous ne vendons pas de l'anxiété" (PRODUCT.md).
- **Don't** arrondir les CTAs — `rounded-*` est interdit sur les boutons. Interdit aussi `rounded-full` sur les chips de filtre si elles apparaissent dans le registre brand.
- **Don't** utiliser les tokens de thème de soirée (`wine`, `burgundy`, `terracotta`, `acid`, `electric`) comme fonds de section ou accents récurrents — ce sont des accents de badge/tag uniquement.
- **Don't** cumuler Kicker Contextuel + numéros de section (01/02/03) + H2 sur le même bloc — c'est le scaffolding AI à 3 niveaux. Maximum 2 éléments de hiérarchie visuelle par en-tête de section.
- **Don't** utiliser `border-left` ou `border-right` supérieur à 1px comme accent coloré sur des cards ou list items — la règle horizontale en Or Niçois (6×1px) est le seul trait coloré autorisé dans ce système.
- **Don't** appliquer `glassmorphism` (backdrop-blur + fond semi-transparent + bordure colorée) comme décoration — usage rare et justifié uniquement (ex : modal flottant sur hero vidéo).
- **Don't** laisser Meetup ou Facebook Events inspirer la structure de navigation sociale — "communautaire bruyant", "bruit des réseaux sociaux" (PRODUCT.md). Soirée Villa n'est pas une communauté en ligne.
