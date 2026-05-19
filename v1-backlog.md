# V1+ Backlog — idées validées mais reportées après MVP

> Ce fichier liste tout ce qui **n'est PAS dans le MVP** mais qui a été identifié comme intéressant.
> **Aucune feature de ce backlog ne doit être implémentée tant que les KPIs MVP ne sont pas validés** (cf. `02_MVP_SCOPE.md`).
> Quand une idée est promue en MVP, on la déplace ici vers les vrais docs et on la retire du backlog.

> 📌 **Pour les gros modules V1 (messagerie organisateur, appels d'offres, devis intelligents, back-office, marketplace prestataires) → voir le doc dédié `docs/10_V1_MODULES.md`.** Ce backlog ne contient que la version courte ; le doc 10 contient le détail technique et l'ordre de construction.

---

## 🏗️ Acteurs / Écosystème — Marketplace prestataires

**Voir `docs/10_V1_MODULES.md` → Module E** pour le détail complet.

Résumé : ajouter un 4ème acteur — **les fournisseurs** (salles, sono, vaisselle, mobilier, animation, traiteur, photographe, DJ, mixologue…). Ils s'inscrivent en auto-service, ont un profil social sur les 6 axes, et sont matchés à l'expérience comme les organisateurs et les lieux.

**Pourquoi reporté en V1** : pour le MVP, l'organisateur gère son matos comme il veut (Excel, mail, contacts perso). Construire un système de fournisseurs maintenant = plusieurs semaines de dev pour un truc que l'utilisateur final ne voit même pas.

**Quand promouvoir en MVP** : jamais. Ça reste V1 minimum, voire V2.

---

## 🏢 Outils organisateur (V1) — voir `docs/10_V1_MODULES.md`

Cinq modules majeurs sont prévus pour transformer la plateforme en **outil métier complet** pour l'organisateur. Détails dans le doc dédié.

- **Module A — Messagerie intelligente** : channels privés type Discord, classement IA par catégories (fournisseurs / lieux / talents / partenaires), familiarité (connu / inconnu), messages texte/audio/vidéo
- **Module B — Appels d'offres** : organisateur publie un besoin → prestataires répondent (auto IA ou manuel) → comparateur (prix, qualité, avis, distance) → négociation chronométrée intégrée
- **Module C — Devis intelligents (combinatoire)** : composer son menu social comme au McDo (entrée/plat/dessert), suggestions IA, estimation marge en direct, comparateur type Google Images / Algolia
- **Module D — Back-office organisateur** : checklist légale (alcool, licences, contrats), assistant IA, accompagnateur humain optionnel (partenariat possible 60-40), gestion paiements/assurances, abonnements (free/pro/premium)
- **Module E — Marketplace prestataires** (= section ci-dessus) : inscription auto, API paiement, profils enrichis, matching social

**Ordre de construction recommandé** : A → B → C → D → E (cf. `docs/10_V1_MODULES.md`).

---

## 🎬 Inspiration et contenu (V1+)

- Import de vidéos Insta / TikTok / YouTube pour inspirer les organisateurs (jeux, défis, prank, références cultes, musique, séries)
- Collections curatées par thème
- Suggestions IA selon le profil-cible de l'expérience
- Bibliothèque communautaire d'idées d'animations

---

## 🧩 Outils transversaux (V1+)

### Tier List custom (style Tiermaker, version interne)

**Idée** : un composant **Tier List** intégré, modifiable en drag-and-drop, utilisable par tous les acteurs pour ranger / ordonner / prioriser.

**Cas d'usage** :
- Le **participant** range ses préférences (lieux préférés, types de soirées, profils de groupe…)
- L'**organisateur** classe ses idées d'activités, ses prestataires habituels, ses lieux préférés
- Le **fournisseur** classe ses prestations (par marge, par fréquence, par satisfaction client)
- Le **propriétaire de lieu** classe ses créneaux, ses configurations, ses tarifs

**Pourquoi V1+** : ce n'est pas un MVP-essentiel. Le composant lui-même est lourd à construire proprement (drag-and-drop responsive, sauvegarde, partage, export).

**Format technique envisagé** : composant React custom (pas d'embed Tiermaker — on garde la donnée interne). Sauvegarde en JSON dans la BDD utilisateur.

**À placer où** : ce composant est **transverse**, il sera utilisé dans plusieurs modules V1 :
- Onboarding avancé (Module participant V1+)
- Module C — Devis intelligents (composer un menu social)
- Module E — Marketplace prestataires (classer ses prestataires habituels)
- Back-office Module D — section O / Opportunité (classer les opportunités)

---

## 🧠 Méthodologies internes (utiles dès maintenant pour J)

### Méthode OPRAH
**Voir `docs/10_V1_MODULES.md` → Module D**.
Framework de structuration des événements en 5 lettres (Opportunité / Pratique / Réfléchir / Agir / Hauteur). À utiliser **dès le MVP** comme grille mentale (pas comme feature codée) pour préparer les 5-7 expériences pilotes.

---

## 💰 Pricing avancé (V1+)

- Tarifs **dynamiques** ajustés par algo (vitesse de remplissage, météo, jour de la semaine)
- **Codes promo** (lancement, parrainage, partenaires)
- **Tarifs membres** (abonnement annuel avec -20 %)
- **Pack 2-pour-1** ou **groupe**
- **Tarifs partenaires** (entreprises, comités, BDE)
- Possibilité de **payer en plusieurs fois** (Klarna / Alma)

---

## 🧠 Matching avancé (V1+)

- 6 axes au lieu de 4 (ajouter Cérébral, Collaboration)
- Score de compatibilité **continu** (pas binaire)
- Matching **croisé** : participant ↔ organisateur ↔ lieu ↔ fournisseur
- Optimisation du **groupe entier** (homogénéité des profils, équilibre énergie)
- 20 profils au lieu de 6 (cf. doc source)

---

## 👤 Comptes et profils (V1+)

- Comptes utilisateurs persistants (login email + mot de passe ou magic link)
- Carte d'identité sociale visuelle (avatar généré, traits, talents, projets)
- Espace perso : historique, badges, profils sauvegardés
- Profils détaillés (talents, projets, intentions du moment)

---

## 🎨 UX / Onboarding (V1+)

- Mode sombre
- Multi-langue (FR / EN minimum)
- PWA installable
- Application mobile native (iOS + Android)
- Onboarding gamifié (badges, niveaux, micro-récompenses)

---

## 📣 Marketing et croissance (V1+)

- Système de parrainage (1 ami parrainé = -10 €)
- Liste d'attente par expérience (et notification quand place dispo)
- Contenu éditorial (blog, podcast, série Insta)
- SEO avancé (pages catégories, lieux, profils)
- Multi-villes (à partir de Lyon, Marseille, Bordeaux)

---

## 🛠️ Outils internes (V1+)

- Dashboard organisateur (créer ses expériences, voir ses inscriptions, voir ses revenus)
- Système de notation post-expérience (NPS in-app, pas en physique)
- Chat / messagerie entre participants d'une même soirée (J-3 → J+3)
- Notifications email transactionnelles avancées (relance abandon panier, J-1 reminder)
- Système de feedback structuré aux organisateurs

---

## 🔐 Sécurité et compliance (V1+)

- Vérification d'identité légère (selfie + ID pour éviter les bots)
- RGPD complet (export données, droit à l'oubli automatisé)
- Conditions générales de vente détaillées + politique d'annulation par expérience
- Assurance responsabilité civile pour les organisateurs

---

## 🎯 Comment promouvoir une idée du backlog vers MVP / V1

1. L'idée doit **résoudre un problème concret** identifié sur le terrain (pas une intuition)
2. Vérifier qu'elle ne casse pas la simplicité actuelle
3. Estimer le coût (jours de dev) vs gain attendu
4. Faire valider par J avant tout début d'implémentation
5. Si OK : créer/modifier les docs concernés, **retirer l'idée de ce backlog** dans le même commit

---

## ⚠️ Pour Claude Code

Si J te demande une feature de ce backlog **avant** la validation des KPIs MVP, tu **refuses** et tu cites ce document. Tu dis : *"Cette feature est en V1+. Selon `02_MVP_SCOPE.md`, on ne l'implémente pas tant que les 4 KPIs MVP ne sont pas atteints."*
