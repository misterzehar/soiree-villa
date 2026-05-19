# 01 — Le concept

## Le problème

Les sorties sociales aujourd'hui sont **majoritairement décevantes** :
- Les groupes sont mal équilibrés (énergies, profils, attentes incompatibles)
- Les ambiances ne correspondent pas (lieu trop bruyant, trop calme, trop chic, trop random)
- Les expériences sont génériques (pas adaptées à la personnalité)
- Les organisateurs n'ont aucun outil pour créer des moments humains réussis
- **80 % des soirées sociales sont moyennes**

> *"Le problème, ce n'est jamais l'activité. C'est le groupe."*

## La solution

Une plateforme d'**expériences sociales animées** qui :
1. **Comprend** le style social de l'utilisateur via un onboarding ludique ("Tu préfères ?")
2. **Génère** un profil social précis (parmi 20 profils humains identifiables)
3. **Match** automatiquement avec l'expérience, l'organisateur, le lieu et le groupe compatibles
4. **Orchestre** une soirée structurée comme un menu (entrée → plat → dessert)

## Le positionnement

**On n'est PAS** :
- ❌ Un site de rencontre amoureuse
- ❌ Un événementiel classique (Eventbrite, Fever)
- ❌ Un catalogue d'activités (Airbnb Experiences)
- ❌ Une plateforme de soirées random (Meetup)

**On EST** :
- ✅ La première plateforme d'**expériences sociales personnalisées** par matching humain

## Le marché cible (MVP)

- **Âge** : 22–38 ans
- **Profil** : urbains, sociables mais sélectifs
- **Frustration** : marre des soirées génériques, veulent du qualitatif
- **Capacité de payer** : disposés à mettre 25-60 € pour une expérience qui leur correspond

## Les thèmes de soirée

Ce que Soirée Villa vend, ce n'est pas une soirée — c'est une **expérience scénarisée selon un thème**. Il existe **6 thèmes officiels** (Mystérieuse et classe, Sensuelle et élégante, Performances et invités surprises, Humaine gênante et drôle, Comme dans une téléréalité, Libre et hors-norme). Le thème détermine l'ambiance, le décor, le dress code, les rôles et le type de public attiré — il évite la "soirée mélange incohérent". Détail complet dans `docs/themes-soirees/`.

## Le concept du "menu social"

Chaque expérience suit une **structure narrative en 3 actes** qui correspond au parcours psychologique social naturel :

| Moment | Phase psychologique | Rôle |
|--------|---------------------|------|
| **Entrée** | **Comprendre** | Brise-glace, observation, mise en confiance, prise de température |
| **Plat** | **Vivre** | Activité principale (jeu, atelier, discussion guidée) — on agit, on partage, on s'engage |
| **Dessert** | **Oser** | Moment final dans un lieu privatisé, ambiance descendue — on se livre, on crée du vrai lien |
| **Digestif** *(optionnel)* | (after libre) | Prolongation hors orchestration |

### Le slogan officiel

> *"Comprendre, Vivre, Oser."*

Ces 3 verbes correspondent **exactement** aux 3 actes du menu social. C'est la grammaire narrative de chaque expérience, et elle doit transparaître dans l'UI, le copywriting et le pitch.

Ce n'est pas une "sortie". C'est une **expérience scénarisée** par un hôte.

### ⚠️ Avertissement sémantique critique (pour Claude Code et tous les outils)

Les termes **"Entrée / Plat / Dessert"** dans ce projet ne désignent **PAS** des plats culinaires.

Ce sont les **3 phases d'un parcours social structuré** :
- **Entrée = Comprendre** (introduction, mise en confiance)
- **Plat = Vivre** (activité principale, action)
- **Dessert = Oser** (détente, connexion émotionnelle)

Quand tu vois `menu_social`, `entree`, `plat`, `dessert` dans le code ou les docs, c'est de **structure d'expérience sociale**, jamais de la nourriture. Ne génère ni interface culinaire, ni icône d'assiette, ni libellé de carte de restaurant. Utilise plutôt les icônes de progression, les chiffres "1 / 2 / 3", ou les verbes "Comprendre / Vivre / Oser".

### Rôles précis à chaque acte

Chaque acte a une **chorégraphie** distincte entre l'organisateur (qui orchestre) et le participant (qui s'inscrit dans le scénario).

| Acte | Rôle de l'organisateur | Rôle du participant |
|------|------------------------|---------------------|
| **Entrée — Comprendre** | Tapis rouge : présenter les participants, installer l'ambiance, expliquer le concept, donner le ton, rassurer | Se laisser porter, suivre le déroulé, adhérer sans pression |
| **Plat — Vivre** | S'efface volontairement, observe, commente, encourage, aide ceux qui ont du mal à entrer dans l'ambiance, donne un coup de pouce ponctuel | Devient l'acteur principal, le jeu prend toute la place, s'engage dans l'action |
| **Dessert — Oser** | Crée une ambiance magique, facilite **sans jamais forcer**, propose des pistes / questions / mini-activités, fait que le souvenir ressemble à une scène de film, s'appuie sur sa connaissance des participants pour ajuster | Se dévoile davantage, dans sa bulle, entouré des personnes qu'il préfère ; ce n'est plus "le jeu", c'est l'envie naturelle |

#### Référence d'inspiration

L'effet recherché au **Dessert** est celui d'une scène culte de **GTO** (Onizuka aide une élève à se rapprocher de son crush en créant un contexte de tension et de complicité avec d'autres élèves — résultat : tout le groupe se rapproche, s'amuse, vit un moment marquant). C'est exactement le type de dynamique que le Dessert peut permettre : un cadre orchestré qui rend l'audace **autorisée et naturelle**.

## Les 4 acteurs de l'écosystème

1. **Le participant** — vient pour vivre une expérience qui lui ressemble
2. **L'organisateur** — conçoit et anime l'expérience (amateur ou pro)
3. **Le lieu** — fournit l'environnement (bar, rooftop, atelier, tiers-lieu, etc.)
4. **Le fournisseur** — loue ou prête le matériel nécessaire (salle, sono, projecteur, vaisselle, déco, animation, traiteur…) — *V1+, pas dans le MVP, voir `v1-backlog.md`*

Chacun a (en cible V1) un **profil social** scoré sur les mêmes 6 axes, ce qui permet le matching croisé.

> ⚠️ **MVP** : seuls les acteurs 1 (participant) et 2 (organisateur) sont exposés dans l'app. Le lieu est saisi en texte libre par l'admin. Le fournisseur n'existe pas encore en BDD — l'organisateur gère son matos en dehors de la plateforme.

## Pourquoi maintenant

- Post-Covid, les gens valorisent la **qualité** des interactions sociales > la quantité
- Saturation des plateformes "swipe = match" (Tinder, Bumble) sans satisfaction
- Montée du marché de l'expérience (vs consommation de produits)
- Outils tech (matching, design IA, no-code) permettent enfin de construire ça
