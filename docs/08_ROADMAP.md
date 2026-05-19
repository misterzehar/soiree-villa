# 08 — Roadmap de construction (4 semaines)

## Principe

On construit **dans l'ordre** ci-dessous, **sans sauter d'étape**. À chaque fin d'étape, **checkpoint avec l'utilisateur**.

---

## Semaine 1 — Bootstrap + Landing + Design System

### 🎯 Objectif
Avoir une landing page en ligne, brandée, cliquable.

### Livrables
- [ ] Repo GitHub initialisé
- [ ] Next.js 14 + TypeScript + Tailwind + shadcn/ui setup
- [ ] Tokens du design system intégrés dans `tailwind.config.ts`
- [ ] Landing page (`/`) implémentée d'après `stitch-briefs/01_landing.md`
- [ ] Déploiement Vercel + domaine custom (optionnel)
- [ ] Form "rejoindre la liste d'attente" (collecte email seulement) — table `waitlist` Supabase

### Checkpoint
✅ L'utilisateur peut visiter le site, lire le pitch, laisser son email.

---

## Semaine 2 — Onboarding "Tu préfères ?" + Résultat

### 🎯 Objectif
Avoir l'onboarding complet fonctionnel, qui calcule et affiche le profil.

### Livrables
- [ ] Setup des constantes : `PROFILES` (6 profils) et `QUESTIONS` (15 questions)
- [ ] Page `/onboarding` avec swipe cards (Framer Motion)
- [ ] Logique de scoring (`computeProfile()` selon `05_MATCHING.md`)
- [ ] Page `/onboarding/result` qui affiche le profil
- [ ] Stockage de la réponse en cookie/session pour l'utiliser sur le catalogue
- [ ] Stockage en BDD `onboarding_responses` (pour analytics)
- [ ] Animations conformes à `06_DESIGN_SYSTEM.md`

### Checkpoint
✅ L'utilisateur peut faire le quiz et obtenir un profil. Tester avec 5 personnes IRL pour valider que c'est ludique et rapide.

---

## Semaine 3 — Catalogue + Détail + BDD expériences

### 🎯 Objectif
Afficher des expériences pré-saisies, filtrées par profil.

### Livrables
- [ ] Tables Supabase `experiences` et `registrations` créées (schéma `04_DATA_MODEL.md`)
- [ ] Saisie manuelle de 5-7 expériences pilotes en BDD (avec compatible_profiles taggés)
- [ ] Page `/experiences` (catalogue filtré par profil de la session)
- [ ] Page `/experiences/[id]` (détail)
- [ ] Empty state si aucune expérience matche
- [ ] Page admin minimaliste `/admin?token=XYZ` (lister les inscriptions)

### Checkpoint
✅ Un participant arrive depuis la landing, fait l'onboarding, et voit des expériences pertinentes.

---

## Semaine 4 — Inscription + Stripe + Email + Tests

### 🎯 Objectif
Boucler la boucle paiement et lancer le 1er test IRL.

### Livrables
- [ ] Page `/experiences/[id]/register` (form prénom/nom/email)
- [ ] **Logique de paliers tarifaires** : fonction `getCurrentTier()` côté serveur (cf. `09_PRICING.md`)
- [ ] Affichage du palier en cours sur card catalogue + page détail (prix + places restantes au palier)
- [ ] Intégration Stripe Checkout (mode hosted) — prix recalculé côté serveur, jamais envoyé par le client
- [ ] Webhook Stripe → création `Registration` en BDD avec `payment_status='paid'` ET `tier_id` (le palier au moment de l'achat)
- [ ] Incrément de `capacity_current` après paiement validé (et NON à la création de session, pour éviter les places fantômes)
- [ ] Email de confirmation (Resend ou Postmark) — mentionne le palier acheté
- [ ] Page `/experiences/[id]/confirmation` (post-paiement)
- [ ] Tests bout-en-bout du parcours complet (vérifier le passage automatique d'un palier à l'autre)
- [ ] **Organisation du 1er test IRL** avec 6-10 participants

### Checkpoint
✅ Le MVP est en ligne et fonctionnel. 1 expérience réelle est organisée et vécue.

---

## Au-delà de la semaine 4

**STOP. Pas de feature creep.** Recueille les retours du test IRL, valide les KPIs définis dans `02_MVP_SCOPE.md` (50 onboardings, 20 inscriptions, 1 expérience, NPS ≥ 7), et **seulement après**, ouvre la discussion V1.

---

## Comment Claude Code doit suivre cette roadmap

1. **À chaque démarrage de semaine** : déclarer "On attaque la semaine X" et lister les livrables.
2. **À chaque commit** : indiquer le livrable concerné et son statut.
3. **À chaque checkpoint** : produire un récap factuel (fait / pas fait / bloquant), demander validation à l'utilisateur avant de passer à la semaine suivante.
4. **Si un livrable prend plus de 2 jours** : alerter l'utilisateur, ne pas continuer en silence.

## ⚠️ Anti-dérive

- Ne pas commencer la semaine 2 si la semaine 1 n'est pas validée par l'utilisateur.
- Ne pas implémenter d'écran qui n'a pas son brief dans `stitch-briefs/`.
- Si l'utilisateur demande une feature en cours de route, vérifier `02_MVP_SCOPE.md`. Si hors scope → ajouter à `v1-backlog.md` (à créer si besoin), pas implémenter.
