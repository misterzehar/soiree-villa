> **🟢 Ce document fait foi à partir du 2026-06-09.** Il remplace `02_MVP_SCOPE.md` (archivé). Décision : J construit la **V1 complète** avant de figer le design final.

# 02 — Périmètre V1 complète

## 🎯 Objectif

Construire **l'intégralité du produit Soirée Villa** (les 4 acteurs, les 5 modules, le matching automatique, les comptes persistants) sur la base du MVP existant déjà déployé sur soireevilla.fr. Le design final et la passe sur les textes interviennent **en dernier** une fois toutes les fonctionnalités en place.

## 📍 Cadre

- **Marque** : Soirée Villa
- **Domaines** : soireevilla.fr (principal) + soireevilla.com
- **Ville pilote** : Nice (multi-villes prévu en Phase 11)
- **Statut juridique de J** : Auto-entrepreneur
- **Point de départ** : site MVP déployé en production avec onboarding, catalogue, inscription+paiement Stripe, charte participant, 5 expériences pilotes seedées, back-office admin token-protected

## ✅ DANS le périmètre V1

### A — Les 4 acteurs exposés

1. **Participant** — déjà partiellement exposé en MVP, à enrichir avec compte persistant + espace perso + historique + avis
2. **Organisateur** — espace dédié, profil scoré, création de soirée, gestion des inscrits, dashboard, statistiques. Ouvert à d'autres organisateurs amateurs/pros
3. **Lieu** — fiches publiques, espace lieu, agenda, demandes reçues
4. **Fournisseur** — annuaire marketplace, fiches, devis

### B — Les 5 modules V1

- **Module A** — Messagerie organisateur ↔ participants (chat de groupe par soirée, realtime Supabase, notifications)
- **Module B** — Appels d'offres organisateur ↔ lieux/fournisseurs (brief, réponses, sélection, commission)
- **Module C** — Devis combinatoires intelligents (lieu + traiteur + DJ + déco, calcul auto, dispos croisées, validation client unique)
- **Module D** — Back-office structuré OPRAH (outil interne pour J, remplace /admin actuel)
- **Module E** — Marketplace prestataires publique (annuaire avec avis, profils scorés, recherche)

### C — Évolutions du modèle social

- Passer de **6 à 20 profils** sociaux
- Passer de **4 à 6 axes** (ajout des axes Cérébral et Créativité)
- **Matching automatique** algorithmique participant ↔ expérience ↔ organisateur ↔ lieu basé sur les axes scorés (le matching manuel par tags devient un fallback)
- Recommandations personnalisées dans le catalogue

### D — Comptes et persistance

- Auth (Supabase Auth ou Clerk) pour les 4 acteurs avec rôles distincts
- Comptes utilisateurs persistants (login, espace perso, historique, prochaines soirées)
- Migration douce des inscriptions MVP existantes (rattachement à un user_id quand l'email correspond à un nouveau compte)

### E — Engagement et confiance

- Notifications email + in-app (rappels J-7, J-1, J-0 d'une soirée ; nouveau message ; nouvelle soirée matchée)
- Avis post-soirée avec NPS
- Gamification (badges, "obsession de la semaine", récompenses, rôles secrets)
- **Chartes pour les 4 acteurs** (participant, organisateur, lieu, fournisseur) au lieu de la seule charte participant
- Système de modération (signalements, scores réputation, sanctions)

### F — Multi-ville et Tier List

- Extension multi-ville (Marseille, Lyon, Paris en plus de Nice) : champ ville sur soirées et lieux, sélecteur sur la landing
- Tier List des expériences (système de notation + classement public)

### G — Design final (en DERNIER)

- Une fois A à F livrés, passe complète de design via Stitch sur tous les écrans
- Réécriture des textes UI
- Évolution du design system si besoin
- Photos et illustrations
- Animations Framer Motion poussées

## ❌ HORS périmètre V1 (vraiment plus tard)

- App mobile native (PWA solide suffit pour le moment)
- IA générative (recommandations restent algorithmiques sur les axes ; pas de génération de contenu)
- Multi-langue (français uniquement)
- Système d'invitation / parrainage (peut arriver en V1.5 selon traction)
- Blog / contenus marketing / SEO avancé (V1.5)
- Tarifs dynamiques / codes promo / abonnements pro (V1.5 — les 3 paliers fixes restent la base)

## 📐 Critères de réussite V1

La V1 est considérée comme livrée lorsque :

1. Les **4 acteurs** peuvent s'inscrire, créer un profil, et utiliser leur espace dédié
2. Un **organisateur tiers** peut créer une soirée de bout en bout sans intervention de J
3. Un **lieu** peut répondre à un appel d'offres depuis son espace
4. Un **fournisseur** peut être trouvé via la marketplace et contacté
5. Un **participant** reçoit ses recommandations via le matching automatique
6. Les **5 modules** sont fonctionnels et reliés (messagerie ↔ appels d'offres ↔ devis ↔ back-office ↔ marketplace)
7. La **passe design + textes** est faite sur les 7 écrans existants + tous les nouveaux

## 🚧 Périmètre technique

Pas de plafond de nombre d'écrans. On en ajoute autant que nécessaire pour couvrir A à G. Les briefs Stitch existants (`stitch-briefs/`) sont à compléter par les nouveaux briefs des écrans V1 (espace organisateur, fiche lieu, fiche fournisseur, espaces de messagerie, devis, etc.).

## 📅 Ordre de construction

Voir `08_ROADMAP.md` — réécrite en **12 phases** (Phase 1 = Auth, Phase 12 = Design final).

## ⚠️ Pour Claude Code

À chaque demande de feature :

- Si elle relève de A à G → exécute.
- Si elle relève des trois ❌ HORS V1 listés → propose-la pour V1.5 et garde-la dans `v1-backlog.md`.
- Si elle n'est ni l'un ni l'autre → demande à J où la classer.

La **Règle 1 de `CLAUDE.md`** (anti-dérive MVP) est désormais **caduque**. Elle est remplacée par : "ne pas refuser une feature qui relève de A à G ci-dessus ; refuser explicitement les 3 features marquées V1+ V1.5 listées dans la section ❌ HORS V1".
