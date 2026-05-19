# 02 — Périmètre MVP (FIGÉ)

> **Ce document fait foi.** Toute feature non listée ici est **hors scope** et doit être refusée.
> Les ajouts vont dans `docs/v1-backlog.md` (à créer si besoin).

## 🎯 Objectif unique du MVP

**Valider une seule chose** : *"Est-ce que des gens veulent participer à des expériences sociales où ils sont matchés selon leur style ?"*

Tout le reste est secondaire.

## 📍 Cadre de lancement

- **Marque** : **Soirée Villa**
- **Ville pilote** : **Nice** (1 ville pour le test, multi-villes en V1+)
- **Statut juridique de J** : Auto-entrepreneur (Kbis disponible)
- **Acquisition initiale** : bouche-à-oreille + présence physique de J dans des événements speed-dating / sorties (pas de pub payante en MVP)

## ✅ DANS le MVP — 3 fonctions, pas plus

### 1. Onboarding "Tu préfères ?"
- 15 questions au format swipe (carte gauche / carte droite)
- 4 axes de scoring : **Énergie, Structure, Profondeur, Socialité** (version simplifiée des 6 axes)
- Calcul de score à la fin
- Attribution d'**1 profil parmi 6** (version simplifiée des 20 profils)
- Affichage du profil avec une phrase de description

### 2. Catalogue d'expériences (manuel)
- 5 à 10 expériences pré-saisies en BDD par l'admin
- Pour chaque expérience : titre, description, lieu, date, prix, profil-cible recommandé
- Affichage du catalogue **filtré par profil compatible** (matching manuel : chaque expérience est taggée avec les profils compatibles à la main)
- Page détail expérience avec les infos + bouton "Je participe"

### 3. Inscription + paiement (avec paliers tarifaires + charte)
- Formulaire simple : prénom, nom, email, profil social
- **Tarification en 3 paliers** (early bird / standard / last chance) — passage automatique d'un palier à l'autre selon le nombre de places vendues. Voir `09_PRICING.md`.
- **Acceptation de la charte participant** obligatoire (checkbox séparée des CGU). Voir `11_CHARTES.md`.
- Paiement via **Stripe Checkout** (mode hosted, pas de form custom)
- Le prix appliqué est **toujours recalculé côté serveur** (jamais envoyé par le client)
- Email de confirmation
- Liste des participants visible côté admin (avec le palier auquel ils ont acheté)
- Page publique `/charte` lisible par tous

### 4. Charte sociale (version MVP — participant uniquement)
- Texte de la charte participant accessible sur `/charte` (5 règles + version courte)
- Acceptation explicite à l'inscription (BDD : `charter_accepted_at`)
- **Modération manuelle** par J (blacklist email à la main si signalement)

## ❌ HORS du MVP — refuser explicitement

### Features à NE PAS construire

- ❌ Comptes utilisateurs persistants (pas de login pour le MVP, juste form + email)
- ❌ Mot de passe / OAuth / SSO
- ❌ Matching automatique algorithmique (le matching est manuel via tags admin)
- ❌ Dashboard organisateur
- ❌ Création d'expérience par les organisateurs
- ❌ Système de notation / feedback
- ❌ Chat ou messagerie interne
- ❌ Notifications push / email transactionnels avancés
- ❌ Profils détaillés avec talents, projets personnels, intentions
- ❌ Carte d'identité sociale visuelle
- ❌ Espace lieu / partenariats lieux
- ❌ **Système de fournisseurs / marketplace prestataires** (Module E) — l'organisateur gère ça en dehors de la plateforme pour le MVP. Voir `docs/10_V1_MODULES.md`.
- ❌ **Messagerie organisateur ↔ prestataires** (Module A) — pas de channels Discord-like en MVP. Voir `docs/10_V1_MODULES.md`.
- ❌ **Appels d'offres** (Module B) — pas de publication de besoins, pas de négociation in-app. Voir `docs/10_V1_MODULES.md`.
- ❌ **Devis intelligents combinatoires** (Module C) — pas de composition de menu type McDo, pas de calcul de marge en direct, pas d'Algolia. Voir `docs/10_V1_MODULES.md`.
- ❌ **Back-office organisateur** (Module D) — pas de checklist légale, pas d'accompagnement humain, pas d'abonnements pro/premium. Voir `docs/10_V1_MODULES.md`.
- ❌ **Import de vidéos Insta / TikTok** pour inspiration — V1+. Voir `v1-backlog.md`.
- ❌ **Chartes organisateur / lieu / fournisseur** — pas de charte automatisée pour ces acteurs en MVP (ils ne s'inscrivent pas eux-mêmes). Voir `11_CHARTES.md`.
- ❌ **Système de score automatisé** (réputation visible, agrégation respect/fiabilité/ambiance) — V1+
- ❌ **Sanctions automatiques** (avertissement / suspension / ban automatisés, mécanique d'appel) — V1+. Modération MVP = manuelle par J.
- ❌ **Accès "élite" / événements premium** réservés aux profils à score élevé — V1+
- ❌ **Tier List custom** (composant drag-and-drop) — V1+
- ❌ Tarifs dynamiques, codes promo, abonnements (les 3 paliers fixes suffisent pour le MVP)
- ❌ Multi-langue
- ❌ Application mobile native (PWA suffit si demandé)
- ❌ IA (tout est règles + tags)
- ❌ Recommandations personnalisées avancées
- ❌ Badges, gamification, niveaux
- ❌ Système d'invitation, parrainage
- ❌ Blog, contenus marketing, SEO avancé
- ❌ Multi-villes (1 ville pour le test)

## 📐 Critères de succès du MVP

Le MVP est validé si :

1. **Au moins 50 personnes** complètent l'onboarding
2. **Au moins 20 personnes** s'inscrivent à une expérience
3. **Au moins 1 expérience pilote** est organisée IRL avec ≥ 6 participants
4. **NPS ≥ 7/10** sur l'expérience vécue (feedback recueilli en physique, pas dans l'app)
5. **CAC < 30 €** sur le paid (Insta + LinkedIn)

## 🚧 Périmètre technique strict

- **1 seul écran d'onboarding** (avec progression interne)
- **1 seule page catalogue**
- **1 seule page détail expérience**
- **1 page profil de résultat** (après l'onboarding)
- **1 page paiement** (déléguée à Stripe)
- **1 landing page** (avant onboarding)
- **1 page admin minimaliste** (juste lister les inscriptions, pas de CRUD complexe)

= **7 écrans max au total**.

## ⏱️ Timeline cible

**4 semaines** du bootstrap à la mise en ligne. Voir `08_ROADMAP.md`.

## ⚠️ Pour Claude Code

À chaque demande de feature, vérifie d'abord ici :
- Si c'est dans la liste ✅ DANS — exécute.
- Si c'est dans la liste ❌ HORS — refuse en citant ce document.
- Si ce n'est ni l'un ni l'autre — demande à l'utilisateur où classer ça (ajout MVP ou backlog V1).
