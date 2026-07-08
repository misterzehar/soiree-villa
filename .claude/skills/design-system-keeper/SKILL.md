---
name: design-system-keeper
description: Force l'utilisation systématique du design system. À déclencher AVANT toute écriture de JSX/CSS/Tailwind. Vérifie qu'aucune valeur hex, taille, ou ombre n'est en dur, et que tout passe par les tokens définis dans `docs/06_DESIGN_SYSTEM.md`.
---

# Design System Keeper

## Rôle
Empêcher l'incohérence visuelle en forçant tout le code UI à passer par les tokens du design system. Pas de couleur magique, pas de `padding: 13px` random, pas de shadow custom.

## Quand t'activer
Avant tout :
- Composant qui contient du JSX/TSX avec des classes Tailwind ou du style
- Modification d'une page
- Création d'un composant UI
- Utilisation d'une couleur, taille, ombre, font, border-radius

## Règles à appliquer

### 1. Couleurs
- ✅ `bg-primary`, `text-text-muted`, `border-border` (classes Tailwind mappées sur les tokens)
- ❌ `bg-[#4A6CF7]`, `style={{ color: '#1A1A2E' }}`, classes Tailwind par défaut comme `bg-blue-500`

### 2. Typographie
- ✅ Utiliser `font-display` pour les titres, `font-body` pour le reste
- ✅ Utiliser l'échelle officielle (`text-xs` à `text-5xl`)
- ❌ Tailles arbitraires comme `text-[17px]` ou `text-[2.3rem]`

### 3. Espacement
- ✅ Multiples de 4 (`p-4`, `gap-6`, `space-y-8`)
- ❌ `p-[13px]`, `mt-[27px]`

### 4. Border radius
- ✅ Les tokens définis : `rounded-md`, `rounded-2xl`, `rounded-full`
- ❌ `rounded-[10px]`

### 5. Ombres
- ✅ `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- ❌ `shadow-[0_2px_8px_rgba(0,0,0,0.1)]`

### 6. Composants UI
- ✅ Utiliser le composant `<Button variant="primary" />` du design system
- ❌ Recoder un bouton "à la main" avec ses styles

## Process de vérification

Avant de commit un fichier UI :

1. Recherche `bg-[`, `text-[`, `rounded-[`, `shadow-[` dans le code → si trouvé, signaler et corriger
2. Recherche `style={{` → si trouvé pour des valeurs design, déplacer vers Tailwind/tokens
3. Recherche `#[0-9a-f]{6}` → si trouvé hors `tailwind.config.ts`, signaler

## Si une valeur manque dans le design system

Tu ne **crées pas** de nouveau token sans demander.

Format de demande à l'utilisateur :
```
Pour [écran/composant], j'ai besoin d'une [couleur/taille/...] qui n'est pas dans `06_DESIGN_SYSTEM.md`.

Proposition : [valeur] — usage : [contexte].

Tu veux :
1. Ajouter ce token au design system (je mets à jour le doc + tailwind.config.ts)
2. Réutiliser un token existant (lequel ?)
```

## Exemples

### ❌ Mauvais
```tsx
<div style={{ backgroundColor: '#4A6CF7', padding: 13, borderRadius: 10 }}>
  <h2 style={{ fontSize: 22, fontWeight: 600 }}>Titre</h2>
</div>
```

### ✅ Bon
```tsx
<div className="bg-primary p-3 rounded-lg">
  <h2 className="text-xl font-semibold font-display">Titre</h2>
</div>
```

## Important
Ce skill ne s'applique pas à `tailwind.config.ts`, `globals.css`, ni aux composants shadcn/ui qui peuvent contenir des valeurs initialement. Il s'applique au code applicatif (composants métier, pages).
