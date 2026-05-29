# CLAUDE.md — Document maître du projet

> **Tu lis ce fichier en premier.** Il contient le contexte du projet, les règles strictes à suivre, et les pointeurs vers les autres documents. Lis ensuite `docs/01` à `docs/11` dans l'ordre, puis `v1-backlog.md`, **avant** de commencer à coder.

## 🏷️ Identité de la marque

- **Nom officiel** : **Soirée Villa** ✅ *(validé par J)*
- **Domaines** : `soireevilla.com` + `soireevilla.fr` (achetés par J) ✅
- **Ville de lancement (MVP)** : **Nice** ✅
- **Statut juridique** : **Auto-entrepreneur** (J dispose déjà de son Kbis) ✅

---

## 🎯 Le projet en une phrase

Une plateforme web qui matche les utilisateurs avec des **expériences sociales animées** (soirées structurées avec un hôte, un programme et un lieu) en fonction de leur **style social**, révélé par un onboarding ludique "Tu préfères ?".

## 🌟 La promesse

> *"Pas une soirée au hasard. Une expérience où tu te sens à ta place."*

## 🗣️ Le slogan officiel

> *"Comprendre, Vivre, Oser."*

C'est la **grammaire narrative** des expériences. Ces 3 verbes correspondent aux 3 actes du menu social (Entrée / Plat / Dessert). Ils doivent transparaître dans l'UI, les copies, le pitch.

## 🧭 Les 3 piliers du concept

1. **Le matching social** : un onboarding "Tu préfères ?" génère un profil sur 6 axes (Énergie, Structure, Cérébral, Collaboration, Profondeur, Créativité). On utilise ce profil pour matcher participants ↔ organisateurs ↔ lieux ↔ expériences.

2. **L'organisateur-hôte** : pas un simple "créateur de sortie", mais un **maître de cérémonie social** qui anime, structure, brise la glace. Deux niveaux : amateur (style Airbnb Experiences) et pro (vrai métier événementiel).

3. **Le menu social — Comprendre / Vivre / Oser** : chaque expérience est structurée en 3 actes psychologiques :
   - **Entrée = Comprendre** (brise-glace, mise en confiance)
   - **Plat = Vivre** (activité principale, on agit ensemble)
   - **Dessert = Oser** (moment final, on se livre, on crée du lien)

> ⚠️ **Sémantique critique** : Entrée / Plat / Dessert ne désignent **PAS** de la nourriture. Ce sont des **phases sociales**. Ne génère ni interface culinaire, ni assiettes, ni menus de restaurant. Voir `docs/01_CONCEPT.md` pour le détail.

---

## 🚦 RÈGLES STRICTES — anti-dérive

Ces règles sont **immutables**. Si l'utilisateur demande quelque chose qui les viole, refuse poliment et explique pourquoi.

### Règle 1 — Périmètre MVP figé
Tu ne construis que ce qui est listé dans `docs/02_MVP_SCOPE.md`. Toute autre feature est **hors scope** et doit aller dans `docs/v1-backlog.md` (à créer si l'utilisateur insiste).

**MVP = 3 fonctions seulement** :
- Onboarding "Tu préfères ?" (15 questions, 4 axes, attribution d'1 profil parmi 6)
- Catalogue d'expériences (manuel, géré par l'admin)
- Inscription + paiement Stripe Checkout (avec **3 paliers tarifaires** early/standard/last — voir `docs/09_PRICING.md`)

**Pas dans le MVP** : matching automatique, dashboard organisateur, IA, recommandations, chat, badges, gamification, multi-langue, mobile native. **Aucun des 5 modules V1** (messagerie organisateur, appels d'offres, devis combinatoires, back-office, marketplace prestataires) — détails dans `docs/10_V1_MODULES.md`. Aussi : pas d'import de vidéos Insta/TikTok pour le MVP.

### Règle 2 — Pas de couleur en dur
Toutes les couleurs viennent du **Design System** (`docs/06_DESIGN_SYSTEM.md`). Aucune valeur hex en dur dans le code (sauf dans le fichier de tokens).

### Règle 3 — Pas de modification du scoring sans mise à jour des docs
Les 6 axes (`docs/04_DATA_MODEL.md`) et la formule de matching (`docs/05_MATCHING.md`) sont la **grammaire du produit**. Si tu touches au scoring, tu mets à jour les docs **en même temps**, dans le même commit.

### Règle 4 — Mobile-first
Tous les écrans sont conçus pour le mobile en priorité (vertical, swipe-first). Le desktop est une adaptation, pas une cible primaire.

### Règle 5 — Style français pour le contenu, anglais pour le code
- Variables, fonctions, fichiers, composants : **anglais** (`UserProfile`, `getUserMatch()`, `experience-card.tsx`)
- Strings affichés à l'utilisateur, docs, commentaires utilisateur : **français**
- Commentaires techniques internes : indifférent, mais privilégie l'anglais pour la cohérence

### Règle 6 — Commit + push automatique à chaque fin d'étape

À chaque fois que tu termines un **livrable de la roadmap** (cf. docs/08_ROADMAP.md) ou une **étape majeure** (nouvelle page, nouvelle table BDD, nouvelle feature), tu fais automatiquement :

1. `git add` des fichiers modifiés
2. `git commit` avec un message clair au format :
   - `feat: [Semaine X] — [titre du livrable]` pour les nouvelles features
   - `fix: [problème résolu]` pour les correctifs
   - `docs: [docs modifiées]` pour les changements de docs
3. `git push origin main` immédiatement

Tu ne demandes PAS de validation préalable — c'est le comportement attendu. Si le code n'est pas prêt à être poussé (cassé, tests qui plantent), tu corriges AVANT le commit, pas après.

---

## 📚 Plan de lecture obligatoire

Lis dans cet ordre **avant** d'écrire la moindre ligne de code :

| # | Fichier | Pourquoi |
|---|---------|----------|
| 1 | `docs/01_CONCEPT.md` | Comprendre le quoi et le pourquoi |
| 2 | `docs/02_MVP_SCOPE.md` | Savoir ce que tu as le droit (et pas le droit) de construire |
| 3 | `docs/03_USER_FLOWS.md` | Le parcours utilisateur, écran par écran |
| 4 | `docs/04_DATA_MODEL.md` | Les entités, les axes de scoring, les profils |
| 5 | `docs/05_MATCHING.md` | La logique de matching (même si MVP = manuel, à connaître) |
| 6 | `docs/06_DESIGN_SYSTEM.md` | Couleurs, typo, composants |
| 7 | `docs/07_SCREENS.md` | La liste des 7 écrans MVP avec intent |
| 8 | `docs/08_ROADMAP.md` | L'ordre de construction, semaine par semaine |
| 9 | `docs/09_PRICING.md` | Stratégie de tarification en 3 paliers (early / standard / last chance) |
| 10 | `docs/10_V1_MODULES.md` | Les 5 modules V1 (messagerie, appels d'offres, devis, back-office structuré par OPRAH, marketplace) — **rien à coder, mais à connaître pour refuser à bon escient** |
| 11 | `docs/11_CHARTES.md` | Chartes sociales par acteur + système de modération. **Charte participant = MVP**, le reste est V1+ |
| 12 | `docs/12_QUESTIONS_ONBOARDING.md` | Les **15 questions "Tu préfères ?"** prêtes à coder (constante TypeScript incluse) |
| 13 | `docs/13_PROFILS.md` | Les **6 profils sociaux MVP** complets (nom, emoji, tagline, traits, description, axes, matchesWith) |
| 14 | **`docs/opportunites/`** *(sous-dossier dédié)* | **Banque de sites + arbre + classification.** Lire `README.md` du sous-dossier en premier — il décrit le **workflow d'ajout** de nouveaux sites. Contient : `01_BANQUE_OPPORTUNITES.md`, `02_ARBRE_DECISIONNEL.md`, `03_CLASSIFICATION_SITES.md` |
| 15 | **`docs/inspiration-jeux/`** *(sous-dossier dédié)* | **Banque d'idées de jeux & soirées** (section P — Pratique d'OPRAH). Lire `README.md` du sous-dossier — il décrit le **format de fiche**, les **4 principes de conception** et le **workflow d'ajout**. Contient : `00_PRINCIPES_EXPERIENCE.md`, `01_BANQUE_IDEES_JEUX.md` |
| 16 | **`docs/themes-soirees/`** *(sous-dossier dédié)* | **Banque des 6 thèmes de soirée** (l'identité scénarisée d'une expérience). Lire `README.md` du sous-dossier — format de fiche thème + workflow. Contient : `01_BANQUE_THEMES.md` |
| 17 | **`docs/experiences-pilotes/`** *(sous-dossier dédié)* | **Les 5-7 expériences pilotes MVP** prêtes à saisir en BDD (combinaison thème + lieu + jeux + profils). Contient : `01_BANQUE_EXPERIENCES.md` |
| 18 | `v1-backlog.md` | Index général du backlog V1+ (Tier List, méthodes, etc.) |

---

## 🛠️ Stack technique recommandée (à valider avec l'utilisateur)

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind
- **UI** : shadcn/ui + Framer Motion (pour les animations swipe)
- **Auth** : Clerk ou Supabase Auth
- **DB** : Supabase (Postgres + Row Level Security)
- **Paiement** : Stripe Checkout (mode hosted, pas custom)
- **Déploiement** : Vercel
- **Analytics** : PostHog

> ⚠️ Si l'utilisateur a une autre préférence, demande avant de bootstrap.

---

## 🎨 Outils design (Stitch / Claude Design)

Pour générer les écrans, utilise les briefs prêts à copier-coller dans `stitch-briefs/`. Chaque brief décrit **un seul écran** avec son intent, sa structure, ses interactions et son style.

---

## ✅ Workflow attendu

1. Lis tous les docs.
2. Confirme avec l'utilisateur que tu as bien compris le scope MVP.
3. Bootstrap le projet (Next.js + Tailwind + shadcn).
4. Pour chaque écran du MVP, dans l'ordre du `docs/08_ROADMAP.md` :
   a. Génère un draft via Stitch en utilisant le brief correspondant
   b. Implémente le composant
   c. Connecte les data
   d. Test manuel
   e. Checkpoint avec l'utilisateur avant de passer au suivant
5. À chaque checkpoint, **liste explicitement** ce qui a été fait et ce qui reste.

---

## 🚨 Si tu ne sais pas

**Demande**, ne devine pas. Cite la règle ou le doc concerné. N'invente pas de feature, de couleur, ou de logique métier.
