# 08 — Roadmap V1 complète (révisée le 2026-06-09)

> ⚠️ Cette roadmap remplace la roadmap MVP 4 semaines. L'ancienne (Semaines 1 à 4) est **considérée comme terminée** — le MVP est en ligne sur soireevilla.fr depuis le 2026-06-09.
> Nouveau cap : construire la V1 complète (12 phases) avant de figer le design et les textes.

## Principe

12 phases ordonnées. On ne saute pas, sauf si une phase est explicitement marquée comme indépendante. À chaque fin de phase, **checkpoint avec J** : démo de ce qui marche, ce qui reste, blocages éventuels.

L'ordre suit une logique : on construit les **fondations** (auth + comptes) avant les acteurs, les **acteurs** (organisateur, lieu, fournisseur) avant les modules transactionnels qui les relient, les **modules** avant le matching automatique qui s'appuie dessus, et le **design final en dernier** une fois la vision d'ensemble en place.

---

## Phase 0 — Point de départ (déjà livré)

Le MVP est en ligne sur soireevilla.fr avec :
- Landing page
- Onboarding 15 questions "Tu préfères ?" → 6 profils sur 4 axes
- Catalogue d'expériences filtré par profil (cookie `sv_profile`)
- Page détail expérience + menu social Comprendre/Vivre/Oser
- Inscription + paiement Stripe Checkout (3 paliers, recalcul serveur)
- Webhook Stripe → BDD + email de confirmation Resend + atomic increment capacité
- Charte participant + page `/charte`
- Back-office admin `/admin` token-protected
- 5 expériences pilotes seedées

---

## Phase 1 — Auth + comptes utilisateurs persistants

### 🎯 Objectif
Tout le monde a un compte. Les inscriptions existantes sont rattachées si l'email correspond à un nouveau compte.

### Livrables
- [ ] Choix Auth : Supabase Auth (gratuit, intégré) ou Clerk (plus complet, payant au-delà du gratuit)
- [ ] Table `users` avec rôle (`participant`, `organisateur`, `lieu`, `fournisseur`) et `profile_id` pour les participants
- [ ] Login / signup par magic link (pas de mot de passe pour démarrer)
- [ ] Page `/compte` (espace perso participant) : profil social, historique soirées, prochaines réservations
- [ ] Middleware Next.js qui vérifie l'auth sur les routes protégées
- [ ] Migration BDD : `registrations.user_id` (nullable au début), backfill quand l'email correspond
- [ ] Mise à jour du parcours d'inscription à une soirée : si l'utilisateur a un compte, pré-remplir le form

### Checkpoint
Tester en bout-en-bout : nouveau compte → onboarding → catalogue → réservation → retrouver la réservation dans `/compte`.

---

## Phase 2 — Espace organisateur

### 🎯 Objectif
Un organisateur (J ou un tiers) peut créer et piloter ses soirées sans intervenir en BDD.

### Livrables
- [ ] Inscription "organisateur" (rôle dédié, onboarding spécifique avec scoring des axes)
- [ ] Profil organisateur public (bio, photo, axes, soirées passées, avis)
- [ ] Page `/organisateur` (dashboard) : soirées en cours / à venir / passées
- [ ] Page `/organisateur/nouvelle-soiree` : formulaire complet (titre, pitch, description, date, durée, lieu, capacité, paliers tarifaires, menu social 3 actes, profils-cibles, photos)
- [ ] Page `/organisateur/soirees/[id]` : gestion d'une soirée (liste inscrits, contact, check-in, stats)
- [ ] Statistiques par soirée : taux remplissage, revenus, NPS post-soirée, palier moyen
- [ ] Workflow validation J : nouvelle soirée d'un organisateur tiers passe en "draft" → J valide → publication catalogue
- [ ] Commission plateforme appliquée lors du paiement (à définir : 10% ? 15% ?)

### Checkpoint
Créer un organisateur test, qu'il crée une soirée, qu'elle passe en validation, qu'elle apparaisse au catalogue, qu'un participant s'y inscrive, qu'il voit l'inscription dans son dashboard.

---

## Phase 3 — Lieux et fournisseurs exposés

### 🎯 Objectif
Les 2 acteurs absents du MVP existent en BDD avec leurs espaces et fiches publiques.

### Livrables
- [ ] Table `lieux` (nom, adresse, ville, capacité, ambiance, photos, profil scoré sur 6 axes, type)
- [ ] Table `fournisseurs` (nom, catégorie [traiteur/DJ/déco/animation/matos/autre], ville, descriptif, photos, profil scoré, gamme tarifaire)
- [ ] Migration : remplacer le champ texte `experience.lieu` par une FK vers `lieux.id`
- [ ] Page publique `/lieux/[slug]` (fiche détail)
- [ ] Page publique `/fournisseurs/[slug]` (fiche détail)
- [ ] Inscription "lieu" et "fournisseur" (rôles dédiés, onboarding scoring axes)
- [ ] Espace `/lieu` : agenda, demandes reçues (placeholder, branchera en Phase 5)
- [ ] Espace `/fournisseur` : profil, demandes reçues (placeholder)
- [ ] Validation J avant publication d'un nouveau lieu/fournisseur
- [ ] Seed BDD : importer les sites de `opportunites/03_CLASSIFICATION_SITES.md` comme lieux

### Checkpoint
Un lieu et un fournisseur peuvent s'inscrire, créer leur fiche, voir leur espace vide. Les expériences existantes du catalogue sont rattachées à un lieu en BDD (plus en texte libre).

---

## Phase 4 — Module A Messagerie organisateur ↔ participants

### 🎯 Objectif
Chaque soirée a son chat de groupe. Organisateur peut briefer avant et débriefer après.

### Livrables
- [ ] Table `conversations` (par soirée) et `messages`
- [ ] Realtime via Supabase Realtime
- [ ] UI chat dans `/organisateur/soirees/[id]/chat` (côté orga) et `/compte/soirees/[id]/chat` (côté participant)
- [ ] Notifications : nouveau message → email + indicateur in-app
- [ ] Upload de photos dans le chat (Supabase Storage)
- [ ] Modération basique : organisateur peut supprimer un message, signaler un participant
- [ ] Archivage automatique 30 jours après la soirée

### Checkpoint
Créer une soirée test, 3 participants, 1 organisateur. Chacun envoie un message, voit les autres en realtime, reçoit la notif email.

---

## Phase 5 — Module B Appels d'offres organisateur ↔ lieux/fournisseurs

### 🎯 Objectif
Un organisateur poste un brief, les lieux/fournisseurs répondent, l'organisateur sélectionne.

### Livrables
- [ ] Table `briefs` (organisateur, type [lieu/fournisseur/mix], date, ville, capacité, budget, descriptif)
- [ ] Table `offres` (brief_id, répondant_id, prix, conditions, message)
- [ ] Page `/organisateur/briefs/nouveau` : formulaire
- [ ] Page `/organisateur/briefs/[id]` : suivi des offres reçues, sélection
- [ ] Côté lieu : `/lieu/demandes` reçoit les briefs matchant son profil/ville
- [ ] Côté fournisseur : `/fournisseur/demandes` idem
- [ ] Notifications : nouveau brief reçu, nouvelle offre, brief sélectionné/rejeté
- [ ] Commission plateforme sur l'offre acceptée

### Checkpoint
Un organisateur poste un brief, 2 lieux répondent, l'orga en choisit un, le lieu rejeté reçoit la notif, la commission est calculée.

---

## Phase 6 — Module C Devis combinatoires intelligents

### 🎯 Objectif
L'organisateur compose un devis multi-prestataires en un seul écran, validation client unique.

### Livrables
- [ ] Architecture devis (à concevoir avant de coder) : composition lieu + traiteur + DJ + déco + autres prestataires
- [ ] Table `devis` (organisateur, soirée, lignes, total, statut)
- [ ] Vérification dispos croisées (lieu disponible ET traiteur disponible ET DJ disponible à la date)
- [ ] Calcul auto du total + détail par ligne
- [ ] Génération PDF du devis (skill `pdf` du build-kit)
- [ ] Envoi du devis au client final (le participant qui réserve une soirée privatisée, ou un organisateur tiers)
- [ ] Validation unique côté client → tous les prestataires sont confirmés en cascade
- [ ] Annulation / modification en cascade gérée

### Checkpoint
Composer un devis test (1 lieu + 1 traiteur + 1 DJ), vérifier les dispos, générer le PDF, simuler une validation, vérifier que les 3 prestataires reçoivent leur confirmation.

---

## Phase 7 — Matching automatique + 20 profils + 6 axes

### 🎯 Objectif
Le matching n'est plus manuel par tags. L'algo recommande des soirées personnalisées.

### Livrables
- [ ] Passer de 4 à 6 axes : ajout `cerebrale` et `creativite` dans `04_DATA_MODEL.md`
- [ ] Réviser les 15 questions onboarding pour scorer les 6 axes (ou en ajouter 5 pour atteindre 20 questions)
- [ ] Passer de 6 à 20 profils sociaux (extension de `13_PROFILS.md`)
- [ ] Algo de matching : distance entre profil participant et profil-cible expérience (Hamming pondéré ou cosinus)
- [ ] Recommandations sur `/experiences` : tri par score de matching descendant
- [ ] Recommandations cross-acteurs : participant ↔ organisateur, organisateur ↔ lieu, organisateur ↔ fournisseur
- [ ] Section "Soirées pour toi" sur `/compte`
- [ ] Le matching manuel par tags devient un override (J peut forcer)
- [ ] Migration des données existantes (les 6 profils MVP correspondent à 6 des 20 nouveaux)

### Checkpoint
Un participant qui a son profil voit en premier les soirées les plus proches. Un organisateur voit les lieux les plus compatibles avec son profil. Tester avec 3 profils différents.

---

## Phase 8 — Module E Marketplace prestataires publique

### 🎯 Objectif
N'importe qui (pas seulement les organisateurs internes) peut chercher un prestataire et le contacter.

### Livrables
- [ ] Page publique `/marketplace` : annuaire de tous les lieux + fournisseurs validés
- [ ] Filtres : type, ville, capacité, gamme tarifaire, profil social
- [ ] Recherche full-text
- [ ] Système d'avis publics sur les fiches
- [ ] Demande de contact direct depuis la fiche (avec formulaire)
- [ ] Option booking direct via la plateforme (pour les prestataires qui le proposent) avec commission

### Checkpoint
Un visiteur non-connecté trouve un traiteur à Nice pour 20 pers via la recherche, lit les avis, envoie une demande, le fournisseur reçoit l'email.

---

## Phase 9 — Module D Back-office structuré OPRAH

### 🎯 Objectif
Remplacer le `/admin` actuel par un outil interne sérieux pour piloter Soirée Villa.

### Livrables
- [ ] Architecture OPRAH (Opportunité, Pratique, Réfléchir, Agir, Hauteur)
- [ ] Tableau de bord par phase OPRAH
- [ ] Indicateurs business : MRR, taux conversion onboarding → réservation, taux remplissage moyen, NPS global, CAC par canal
- [ ] CRUD complet sur tous les objets (users, soirées, lieux, fournisseurs, briefs, devis)
- [ ] Modération centralisée : signalements, sanctions, historique
- [ ] Export comptable (factures, commissions) pour ton statut auto-entrepreneur
- [ ] Auth admin renforcée (TOTP en plus du token)

### Checkpoint
J peut piloter la boîte depuis ce back-office sans toucher à la BDD Supabase directement.

---

## Phase 10 — Notifications, avis, NPS, gamification

### 🎯 Objectif
Les utilisateurs reviennent, recommandent, et fidélisent.

### Livrables
- [ ] Notifications email + in-app : rappel J-7, J-1, J-0 d'une soirée, nouveau message chat, nouvelle soirée matchée, brief reçu, offre reçue, etc.
- [ ] Système d'avis post-soirée (J+1, email + lien direct) avec NPS et commentaire
- [ ] Page publique avis par soirée + par lieu + par organisateur
- [ ] Système de badges (premier participant, 3 soirées vécues, 10 soirées, organisateur prolifique, lieu favori, etc.)
- [ ] "Obsession de la semaine" : une soirée mise en avant chaque semaine
- [ ] Récompenses (réduction sur la prochaine soirée, accès anticipé)
- [ ] Rôles secrets dans certaines soirées (cf. principes `inspiration-jeux/00_PRINCIPES_EXPERIENCE.md`)
- [ ] Chartes pour les 3 acteurs manquants (organisateur, lieu, fournisseur) avec acceptation à l'inscription
- [ ] Système de modération automatisé : signalements → score réputation → sanction (avertissement, suspension, ban)

### Checkpoint
Tester le cycle complet : inscription → soirée → notif J-1 → soirée vécue → email NPS J+1 → avis publié → badge attribué → réduction proposée pour la suivante.

---

## Phase 11 — Multi-ville et Tier List

### 🎯 Objectif
Sortir de Nice + classement public des meilleures expériences.

### Livrables
- [ ] Champ `ville` sur soirées, lieux, fournisseurs, organisateurs
- [ ] Sélecteur de ville sur la landing + persistance cookie
- [ ] Filtres par ville sur le catalogue et la marketplace
- [ ] Ouverture Marseille, Lyon, Paris (3 villes test après Nice)
- [ ] Page `/tier-list` : classement public des expériences (composant drag-and-drop pour ranking communautaire ou ranking algorithmique sur NPS + remplissage)
- [ ] Mise en avant des soirées Tier S sur la landing

### Checkpoint
Un Parisien qui arrive sur le site voit Paris par défaut (géolocalisation) ou Nice. Il filtre les soirées de sa ville, voit la Tier List du moment.

---

## Phase 12 — Design final et textes (passe globale)

### 🎯 Objectif
Toutes les fonctionnalités sont en place. On polit l'expérience visuelle et le copywriting.

### Livrables
- [ ] Mise à jour des briefs Stitch dans `stitch-briefs/` pour couvrir tous les écrans V1 (ajout : espace organisateur, fiche lieu, fiche fournisseur, espaces messagerie, devis, marketplace, tier list, etc.)
- [ ] Passage de chaque écran dans Stitch / Claude Design pour upgrade visuel
- [ ] Évolution éventuelle du design system (`06_DESIGN_SYSTEM.md`) : nouveaux tokens couleur si besoin, typo, ombres, motion tokens
- [ ] Identité visuelle par thème de soirée : palette dérivée pour les 6 thèmes
- [ ] Photos pro / illustrations IA cohérentes sur landing, fiches, cards
- [ ] Animations Framer Motion poussées (transitions, micro-interactions, écran résultat profil cinématographique)
- [ ] Réécriture des textes UI : tone of voice unifié, copywriting "Comprendre/Vivre/Oser" partout
- [ ] Réécriture de la landing pour vendre la V1 complète
- [ ] SEO de base : meta tags, OG images, sitemap, robots.txt

### Checkpoint final
Tout le site est en cohérence visuelle et éditoriale. Prêt pour le passage en Stripe live + Resend domaine vérifié + RC pro + premiers vrais utilisateurs.

---

## Comment Claude Code doit suivre cette roadmap

1. **Au démarrage de chaque phase** : déclarer "On attaque la Phase X" et lister les livrables.
2. **À chaque commit** : indiquer le livrable concerné et son statut. Respecter Règle 6 (auto commit+push).
3. **À chaque fin de phase** : produire un récap factuel (fait / pas fait / bloquant), demander validation à J avant de passer à la phase suivante.
4. **Si un livrable prend plus de 3 jours** : alerter J, ne pas continuer en silence.

## ⚠️ Anti-dérive

- **Phase 12 (design) ne démarre pas tant que les phases 1 à 11 ne sont pas closes.** C'est la demande explicite de J : avoir la vision d'ensemble avant de polir.
- Si J demande une feature qui n'est dans aucune phase, vérifier `02_SCOPE.md`. Si dans le scope V1 → ajouter à la phase appropriée. Si hors V1 → `v1-backlog.md` pour V1.5.
- Toujours travailler sur la base du site existant (soireevilla.fr / repo `soiree-villa/`), pas de redémarrage from scratch.
