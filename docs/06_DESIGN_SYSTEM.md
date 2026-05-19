# 06 — Design System

## Philosophie

Trois piliers :

1. **Human First** — formes arrondies, couleurs chaleureuses, photos humaines
2. **Playful & Social** — interactions fluides, animations douces, cartes swipeables
3. **Premium & Simple** — surfaces propres, peu de bruit visuel, hiérarchie claire

> ⚠️ **Toutes les valeurs ci-dessous sont à intégrer comme tokens dans Tailwind config**, pas en valeurs hex en dur dans le code.

## 🎨 Couleurs

### Couleurs de marque

```css
--color-primary:   #4A6CF7;  /* Social Blue — confiance, énergie sociale */
--color-secondary: #A259FF;  /* Creative Purple — créativité, originalité */
--color-accent:    #FF7A59;  /* Warm Orange — chaleur, action */
```

### Neutres

```css
--color-bg:        #FAFAFA;  /* Fond global, off-white chaleureux */
--color-surface:   #FFFFFF;  /* Cartes, modals */
--color-border:    #E8E8EC;  /* Borders subtiles */
--color-text:      #1A1A2E;  /* Texte principal */
--color-text-muted:#6B6B7A;  /* Texte secondaire */
```

### Sémantiques

```css
--color-success:   #4ADE80;
--color-warning:   #FACC15;
--color-error:     #F87171;
```

### Mode sombre (optionnel MVP, recommandé V1)

Hors scope MVP. Préparer les tokens en CSS variables pour V1.

## 🔤 Typographie

```css
--font-display: 'Cabinet Grotesk', 'Inter', sans-serif;  /* Titres */
--font-body:    'Inter', system-ui, sans-serif;          /* Texte */
--font-mono:    'JetBrains Mono', monospace;             /* Code, debug */
```

### Échelle

| Token | Taille | Usage |
|-------|--------|-------|
| `text-xs` | 12px | Légendes |
| `text-sm` | 14px | Texte secondaire |
| `text-base` | 16px | Texte courant |
| `text-lg` | 18px | Texte introductif |
| `text-xl` | 20px | Sous-titres |
| `text-2xl` | 24px | Titres de section |
| `text-3xl` | 30px | Titres de page |
| `text-4xl` | 36px | Hero secondaire |
| `text-5xl` | 48px | Hero principal |

**Line-height** : 1.5 pour body, 1.2 pour titres.

## 🧩 Composants UI

### Boutons

| Variant | Usage | Style |
|---------|-------|-------|
| `primary` | CTA principal | bg-primary, text-white, rounded-full, py-3 px-6 |
| `secondary` | Actions secondaires | bg-surface, border, text-text |
| `ghost` | Liens, retours | bg-transparent, hover:bg-bg |

Tailles : `sm`, `md` (default), `lg`. Toujours `rounded-full` pour le primary.

### Cartes (`Card`)

- `border-radius: 16px` (rounded-2xl)
- `padding: 16px` mobile, `24px` desktop
- `shadow-sm` au repos, `shadow-md` au hover
- Background `surface`, border `border-border`

### Cartes Swipe (onboarding "Tu préfères ?")

- Plein écran sur mobile, max-width 400px sur desktop
- `border-radius: 24px` (rounded-3xl)
- Image cover en haut + label en bas
- Animation au swipe : `scale 1.05` + `translate-x` + ombre douce
- Carte opposée : `blur` léger (`backdrop-blur-sm`)

### Tags

- `rounded-full`, `px-3 py-1`, `text-xs font-medium`
- Couleur de fond selon le profil ou la nature

### Inputs

- `rounded-lg`, `border`, `px-4 py-3`
- Focus : `ring-2 ring-primary/30`

## 📐 Espacement

Échelle Tailwind par défaut (`0.25rem` = `4px`). Préférer les multiples de 4.

Tokens fréquents :
- `p-4` (16px) → padding standard
- `gap-4` (16px) → entre cartes catalogue
- `gap-2` (8px) → entre éléments inline
- `space-y-6` (24px) → entre sections page

## 🔘 Border radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-md` | 6px | Inputs, petits éléments |
| `rounded-lg` | 8px | Boutons sm |
| `rounded-xl` | 12px | Tags |
| `rounded-2xl` | 16px | Cards |
| `rounded-3xl` | 24px | Hero, swipe cards |
| `rounded-full` | ∞ | Boutons primary, avatars |

## 💫 Ombres

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.16);
```

## 🎬 Animations & Micro-interactions

> Voir `app_organisé/06_Design_et_wireframes/04 - Micro-interactions.docx` pour le détail complet.

### Règles d'or

- **Durée** : 150-300ms pour les transitions UI ; 600-1000ms pour les animations narratives
- **Easing** : `ease-out` par défaut, `cubic-bezier(0.22, 1, 0.36, 1)` pour les swipes
- **Reduce motion** : respecter `prefers-reduced-motion` (toutes les animations doivent avoir un fallback statique)

### Animations clés

| Élément | Animation |
|---------|-----------|
| Swipe card | `scale(1.05)` + `translate-x` + ombre, 200ms |
| Apparition carte suivante | `slide-up 20px` + `fade-in`, 150ms |
| Bouton CTA hover | `scale(1.02)`, 150ms |
| Apparition section | `fade-in + slide-up 16px`, 400ms |
| Progression onboarding | progress bar fluide (pas saccadée) |
| Validation | tick vert, 200ms scale puis fade |

### Retour haptique (mobile)

10-20 ms sur chaque swipe validé.

## 🖼️ Iconographie

Utiliser **lucide-react** pour la cohérence. Toujours `stroke-width: 1.5`.

Pas d'emoji dans les composants UI structurels (boutons, navigation). Les emojis sont réservés au **contenu** (profils, expériences).

## 📱 Responsive

### Breakpoints (Tailwind defaults)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Stratégie

**Mobile-first**. Tout se design d'abord en 375px (iPhone SE), puis on ajoute des règles `md:` pour le desktop.

Le swipe d'onboarding **n'a pas de version desktop dédiée** — sur desktop, c'est le même UI mobile centré dans la fenêtre, max-width 400px.

## ⚠️ Pour Claude Code

- **Aucune valeur hex** dans les composants. Tout passe par les classes Tailwind ou les variables CSS.
- Si tu as besoin d'une couleur qui n'est pas dans la palette, tu **demandes à l'utilisateur** avant d'en ajouter une.
- Les noms de classes en anglais (Tailwind), les commentaires utilisateur en français.
- Si tu modifies une couleur, mets à jour ce doc et `tailwind.config.ts` dans le même commit.
