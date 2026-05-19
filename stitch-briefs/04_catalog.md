# Brief Stitch — 04 Catalogue d'expériences

## Route
`/experiences`

## Intent unique
Faire cliquer sur **une expérience qui matche** le profil de l'utilisateur.

## Audience
Utilisateur qui vient de découvrir son profil ou qui revient depuis un email/lien. A peut-être déjà un profil en session.

## Structure (mobile-first)

### En-tête
- Logo en haut à gauche
- Sous-titre dynamique : *"Pour toi, [Nom du profil] 🎉"* (badge profil cliquable → `/onboarding/result`)
- Petit texte : *"3 expériences animées qui matchent ton style"*

### Liste d'expériences (cards)

Chaque card (rounded-2xl, shadow-sm, p-4) :

```
┌────────────────────────────────────┐
│ [Image cover, ratio 16:9]          │
│                                    │
│  Blind test rooftop  🎉            │
│  Vendredi 12 mai • 20h             │
│                                    │
│  📍 Le Perchoir, Paris 11ème       │
│                                    │
│  [tag: extra] [tag: festif]        │
│                                    │
│  28€ early bird • 2 places restantes│
│  (puis 35€ standard)                │
└────────────────────────────────────┘
```

Le prix affiché est **toujours celui du palier en cours** (calculé via `getCurrentTier()`, cf. `09_PRICING.md`). Sous le prix, en plus petit (text-xs, color-text-muted) : *"puis 35 € standard"* pour créer l'urgence.

Si le palier en cours est **last chance**, ajouter un badge rouge discret : *"Last chance"*.

- Image cover en haut (cover_image_url, fallback gradient si null)
- Titre (font-display, text-xl)
- Date + heure (text-sm, color-text-muted)
- Lieu (icône MapPin lucide + nom)
- Tags des profils compatibles (rounded-full, bg-primary/10)
- Prix + capacité restante (text-base, font-medium)

Espacement entre cards : `gap-4`

### Empty state (si 0 expérience)
- Illustration ou emoji (ex: 🦗)
- Titre : *"On n'a pas encore d'expérience pour ton style."*
- Texte : *"Laisse-nous ton email, on te prévient dès qu'on en organise une."*
- Form email simple (1 input + 1 bouton primary "Me prévenir")
- Lien : *"Refaire le quiz"* → `/onboarding`

### Footer minimal
- Logo + lien Insta + mentions légales

## Données affichées
- Liste d'`Experience` filtrées par `compatible_profiles.includes(participantProfile)` (cf. `05_MATCHING.md`)
- Triées par date croissante
- Filtrées sur `status === 'published'` et `date > now()`

## Actions
- Tap sur une card → `/experiences/[id]`
- Tap sur le badge profil → `/onboarding/result`
- Tap "Refaire le quiz" → `/onboarding`
- Submit form email (empty state) → table `waitlist`

## Style
- Fond color-bg
- Cards avec hover scale 1.01 (desktop)
- Pas de filtres avancés (date, prix) sur le MVP — la liste est courte de toute façon

## États
- Loading : 3 skeletons de cards
- Empty : voir ci-dessus
- Erreur réseau : message inline + bouton "Réessayer"

## Animations
- Apparition cards en stagger (50ms entre chaque) au load
- Reduce motion : pas de stagger, juste fade global

## ⚠️ Pour Stitch
- Pas de barre de filtres en haut, pas de tri par dropdown
- Pas de carte (map) géographique
- Pas de pagination — on suppose < 10 expériences en MVP
- Cards verticales sur mobile, possible 2 colonnes en desktop large
