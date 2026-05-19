# 10 — Modules V1 (organisateur, prestataires, marketplace)

> ⚠️ **AUCUN MODULE DE CE DOCUMENT N'EST DANS LE MVP.**
> Ce doc existe pour que Claude Code **sache que ces modules existeront un jour** et puisse refuser **à bon escient** quand on lui demande une feature qui en relève. Tant que les KPIs MVP (`02_MVP_SCOPE.md`) ne sont pas validés, **rien de ce qui est ici ne doit être implémenté**.

---

## Vision générale

Une fois le MVP validé (50 onboardings, 20 inscriptions, 1 expérience IRL, NPS ≥ 7), la plateforme s'enrichira d'un **back-office complet pour les organisateurs**. Cinq modules couvrent l'orchestration de bout en bout d'une expérience.

L'ordre de construction recommandé :

1. **Module A** — Messagerie intelligente (cœur de la relation organisateur ↔ prestataires)
2. **Module B** — Appels d'offres (moteur économique)
3. **Module C** — Devis intelligents (valeur ajoutée premium)
4. **Module D** — Back-office organisateur structuré par OPRAH (sécurité, conformité, accompagnement)
5. **Module E** — Marketplace prestataires (croissance, prospection)

---

## Module A — Messagerie intelligente

**Idée** : un système de communication interne, type Discord/Slack, qui permet à l'organisateur de discuter avec les autres acteurs de l'écosystème.

**Fonctions** :
- Channels privés créés à la volée (par expérience, par prestataire, par sujet)
- Catégories automatiques classées par IA : fournisseurs / lieux / talents / partenaires
- Niveau de familiarité : connu / inconnu
- Types de messages : texte, audio, vidéo
- Mode "spontané personnalisé" : un prestataire qui contacte un organisateur en argumentant sa valeur ajoutée

**Données à modéliser (V1)** : `channels`, `messages`, `channel_members`, index de classement IA.

**Précédents équivalents** : Discord channels, Slack DMs, Linear Triage. **Avec classement IA et familiarité en plus.**

---

## Module B — Appels d'offres

**Idée** : l'organisateur publie un besoin, les prestataires répondent.

**Fonctions** :
- L'organisateur publie un besoin structuré (type d'événement, budget, date, lieu, mots-clés)
- Les prestataires répondent (manuellement ou auto-IA)
- Comparateur : prix / qualité / avis / distance
- Négociation intégrée : appels audio / vidéo / texto **avec temps limité**
- Sélection finale, contrat généré, paiement préfinancé

**Données** : `tenders`, `tender_offers`, `negotiations`.

**Précédents** : Malt, BidVoy, Upwork. **Avec négociation chronométrée intégrée.**

---

## Module C — Devis intelligents (combinatoire)

**Idée** : composer son menu social comme on compose un menu au McDo.

**Fonctions** :
- Pour chaque acte (Entrée / Plat / Dessert) → choisir parmi un catalogue
- Combiner / retirer / remplacer
- Suggestions IA selon profil-cible et budget
- Estimation de marge en temps réel
- Comparateur intégré (Google Images / Alibaba style)
- Moteur de recherche intelligent (Algolia)
- Inspiration : import de vidéos Insta

**Données** : `menu_components`, `experience_drafts`, `inspiration_videos`.

**Précédents** : McDonald's borne, Notion templates, Algolia. **Avec calcul de marge en direct.**

---

## Module D — Back-office organisateur

**Idée** : tout ce qui transforme la plateforme d'un site catalogue en outil métier complet.

### Framework de structuration : la méthode OPRAH

Le back-office est organisé selon **5 sections** qui suivent la méthode **OPRAH** (= ossature mentale de l'organisateur). Chaque lettre = une zone de l'interface :

| Lettre | Section | Contenu |
|--------|---------|---------|
| **O — Opportunité** | Idéation | Banque de lieux, idées, ressources, occasions saisonnières, inspirations |
| **P — Pratique** | Préparation | Bibliothèque d'exercices, jeux, activités, kits matériel par type d'expérience |
| **R — Réfléchir** | Cadrage | Contraintes (prix plafond, statut juridique, réglementation, logistique), objectifs, contraintes lieu/date |
| **A — Agir** | Exécution | Plan d'action, étapes, deadlines, budget chiffré, planning prestataires, paiements |
| **H — Hauteur** | Pilotage | Recul post-événement : feedback participants, scores, KPI, comparatifs entre expériences, benchmarks |

> **OPRAH n'est pas une feature** mais une **grille de rangement** : toutes les fonctions du Module D doivent se ranger dans l'une des 5 lettres.

> 💡 **Bonus pour J** : tu peux **toi-même utiliser OPRAH dès maintenant**, sans rien coder, comme grille mentale pour préparer tes 5-7 expériences pilotes du MVP.

### Fonctions
- **O / Opportunité** : banque de lieux, banque d'idées d'expériences, occasions saisonnières — **source primaire de données : `docs/14_OPPORTUNITES.md`** (alimentation manuelle en MVP, ingestion automatique en V1+ via crawlers / API)
- **P / Pratique** : bibliothèque d'exercices, kits matériel, templates d'activités — **source primaire de données : `docs/inspiration-jeux/`** (banque d'idées de jeux & soirées, alimentée manuellement par J en MVP)
- **R / Réfléchir** : checklist légale par expérience, assistant IA, gestion des chartes (cf. `11_CHARTES.md`)
- **A / Agir** : plan d'action chiffré, deadlines, paiements/assurances/contrats, accompagnateur humain optionnel (partenariat possible 60-40)
- **H / Hauteur** : feedback post-expérience, scores acteurs, KPI, comparatifs

**Données** : `compliance_checklists`, `mentors`, `partnerships`, `subscriptions`, tables score & sanctions (cf. `11_CHARTES.md`).

**Précédents** : Stripe Atlas, Lemonway, Lemcal. **Le tout intégré, structuré par OPRAH.**

---

## Module E — Marketplace prestataires

**Idée** : faire venir les prestataires d'eux-mêmes et les intégrer techniquement (paiements, vidéos, profils).

**Fonctions** :
- Inscription auto-service par les prestataires (entreprise ou indépendant)
- API de paiement intégrée (Stripe Connect-like)
- Profils enrichis : galerie photo/vidéo, avis, certifications, profil social sur les 6 axes
- Intégration manuelle d'entreprises ciblées (prospection)
- Offres promo / tests pour amorcer
- Catégories : salle, sono, lumière, projecteur, vaisselle, mobilier, déco, animation, photographe, traiteur, foodtruck, DJ, mixologue, magicien…

**Données** : `suppliers`, `supplier_assets`, `supplier_subscriptions`, `experience_supplier`.

**Précédents** : Malt + Stripe Connect + Eventbrite Pros. **Avec matching social en plus.**

---

## Comment promouvoir un module en MVP / V1 actif

1. **KPIs MVP validés** (cf. `02_MVP_SCOPE.md`)
2. **Demande utilisateur explicite** sur le besoin réel (pas une intuition)
3. **Estimation effort vs gain** documentée
4. **Validation par J** avant tout début d'implémentation
5. Si OK : créer le doc dédié au module, retirer la section correspondante de ce fichier, **mettre à jour `02_MVP_SCOPE.md`** dans le même commit.

---

## ⚠️ Pour Claude Code

Si J te demande une feature qui relève de l'un de ces 5 modules **avant** validation des KPIs MVP, tu **refuses poliment** en citant ce document et `02_MVP_SCOPE.md`.

Réponse type :

> *"Cette feature relève du Module [X — nom] documenté dans `docs/10_V1_MODULES.md`. Selon `02_MVP_SCOPE.md`, on ne l'implémente pas tant que les 4 KPIs MVP ne sont pas atteints. Veux-tu qu'on en discute pour la planifier en V1, ou est-ce qu'il y a un raccourci MVP qui répond à ton besoin ?"*
