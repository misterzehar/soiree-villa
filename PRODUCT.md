# Product

## Register

brand

## Users

Adultes de 20 à 40 ans basés à Nice, socialement curieux mais lassés des soirées génériques et des plateformes événementielles impersonnelles. Ils cherchent des connexions réelles dans un cadre structuré, sans la pression du « networking ». Contexte d'usage : mobile, souvent en soirée (18h-23h), décision d'achat impulsive ou préméditée sur 2-3 jours. Trois profils d'utilisateurs :
- **Participant** : cherche une expérience, veut être guidé, pas organisateur.
- **Organisateur-hôte** : maître de cérémonie social, crée et anime les soirées.
- **Lieu / Prestataire** : partenaire business B2B, surface product distincte.

## Product Purpose

Soirée Villa matche les participants à des expériences sociales animées (soirées structurées avec un hôte, un programme et un lieu) en fonction de leur **style social**, révélé par un onboarding quiz "Tu préfères ?". Le succès se mesure à la qualité de la rencontre humaine produite — pas au volume de billets vendus. Le quiz n'est pas un gimmick : c'est l'algorithme de différenciation. Sans lui, le produit est Eventbrite.

## Brand Personality

**Intime · Cinématique · Éditorial**

Ton : confident sans être arrogant, chaleureux sans être familier. La plateforme parle comme un hôtel boutique de 12 chambres qui sait exactement ce qu'il est. Références visuelles confirmées : Aman Resorts (espace blanc, retenue), Belmond (éditorial, photographie), Resy (sombre, raffiné, mobile-first). Slogan : *"Comprendre, Vivre, Oser."*

## Anti-references

- **Eventbrite** : transactionnel, générique, catalogue de masse. Le contraire de la curation.
- **Meetup** : communautaire, bruyant, UX forum. Soirée Villa n'est pas une association.
- **Facebook Events** : bruit des réseaux sociaux, pas de mise en scène.
- **Fever / Shotgun** : FOMO par design, manipulation algorithmique visible. Nous ne vendons pas de l'anxiété.
- **Esthétique neon/fluo** : dégradés électriques, emojis en titres, cards à bordure épaisse violette. Interdit.
- **SaaS cream landing** : fond beige/sable chaud, "modern" générique, serif Fraunces + kicker small-caps sur chaque section. La monoculture IA 2026 — exactement ce que nous ne sommes pas.

## Design Principles

1. **La soirée est le produit** — chaque écran doit donner le sentiment d'entrer dans une soirée, pas de remplir un formulaire. L'UX est une mise en scène, pas une interface.
2. **La retenue signale la qualité** — le luxe parle doucement. Ajouter un élément de design est toujours suspect ; retirer est presque toujours juste.
3. **Mobile-first intimité** — conçu pour la main à 20h, pas pour le desktop à 14h. Chaque décision de taille, d'espacement et de lisibilité se valide d'abord sur 390px.
4. **Comprendre · Vivre · Oser comme grammaire UX** — la structure en 3 actes n'est pas qu'un slogan : elle ordonne l'onboarding (comprendre mon profil), le catalogue (vivre l'expérience) et la soirée elle-même (oser le lien). L'UI doit refléter ce rythme.
5. **L'image comme preuve** — Soirée Villa vend une atmosphère. Les placeholders CSS là où devraient être des photos d'ambiance sont un mensonge de marque. Dès qu'une photo réelle existe, elle remplace le block de couleur.

## Accessibility & Inclusion

- **WCAG AA** : contraste corps ≥ 4.5:1, grandes typographies ≥ 3:1.
- Navigation clavier complète sur tous les flows interactifs (quiz, réservation, tier-list DnD).
- `prefers-reduced-motion` : toutes les animations Framer Motion respectent la media query ; le contenu est visible sans animation.
- Labels et ARIA sur tous les formulaires. Alt text descriptif et dans le ton de la marque ("Rooftop niçois à la tombée du jour" plutôt que "photo").
- Pas de dépendance à la couleur seule pour transmettre une information (tiers S/A/B/C/D ont labels texte en plus des couleurs).
