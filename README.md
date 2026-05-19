# Soirée Villa — Plateforme d'expériences sociales animées

Ce dossier est **le seul que Claude Code doit lire** pour construire l'app. Tout le reste (les 50 docx du dossier source `app_organisé/`) est de la matière première — la synthèse opérationnelle est ici.

## 📁 Structure

```
build-kit/
├── README.md                    ← Tu es ici
├── CLAUDE.md                    ← Master file (lu en premier par Claude Code)
├── v1-backlog.md                ← Ce qui n'est PAS dans le MVP (fournisseurs, etc.)
├── docs/
│   ├── 01_CONCEPT.md            ← Pourquoi on fait ça (4 acteurs de l'écosystème)
│   ├── 02_MVP_SCOPE.md          ← Ce qu'on fait / ce qu'on NE fait PAS
│   ├── 03_USER_FLOWS.md         ← Parcours utilisateur
│   ├── 04_DATA_MODEL.md         ← Entités, profils, axes, paliers tarifaires
│   ├── 05_MATCHING.md           ← Logique de matching MVP
│   ├── 06_DESIGN_SYSTEM.md      ← Tokens design (couleurs, typo, etc.)
│   ├── 07_SCREENS.md            ← Liste des 7 écrans MVP
│   ├── 08_ROADMAP.md            ← Plan de construction 4 semaines
│   ├── 09_PRICING.md            ← Stratégie 3 paliers (early / standard / last)
│   ├── 10_V1_MODULES.md         ← 5 modules V1 (messagerie, appels d'offres, devis, back-office structuré par OPRAH, marketplace) — pour mémoire
│   ├── 11_CHARTES.md            ← Chartes par acteur + système de modération (MVP = charte participant uniquement)
│   ├── 12_QUESTIONS_ONBOARDING.md ← Les 15 questions "Tu préfères ?" prêtes à coder
│   ├── 13_PROFILS.md            ← Les 6 profils sociaux complets (nom, emoji, tagline, axes…)
│   ├── opportunites/            ← 📁 Banque de sites + arbre + classification
│   │   ├── README.md                    ← Workflow d'ajout de nouveaux sites
│   │   ├── 01_BANQUE_OPPORTUNITES.md   ← La banque enrichie (ville, statut, attributs)
│   │   ├── 02_ARBRE_DECISIONNEL.md     ← Méthode pour classer (3 questions oui/non)
│   │   └── 03_CLASSIFICATION_SITES.md  ← Tous les sites classés en 4 segments + sous-types
│   ├── inspiration-jeux/        ← 📁 Banque d'idées de jeux & soirées (section P d'OPRAH)
│   │   ├── README.md                    ← Format de fiche + workflow d'ajout d'idées
│   │   ├── 00_PRINCIPES_EXPERIENCE.md  ← Les 4 principes de conception (à lire en 1er)
│   │   └── 01_BANQUE_IDEES_JEUX.md     ← Les idées de jeux/soirées en fiches standardisées
│   ├── themes-soirees/          ← 📁 Banque des 6 thèmes de soirée
│   │   ├── README.md                    ← Format de fiche thème + workflow
│   │   └── 01_BANQUE_THEMES.md         ← Les 6 thèmes officiels en fiches standardisées
│   └── experiences-pilotes/     ← 📁 Les 5-7 expériences pilotes MVP (prêtes à saisir en BDD)
│       ├── README.md                    ← Format de fiche expérience + workflow
│       └── 01_BANQUE_EXPERIENCES.md    ← 5 expériences combinant thème+lieu+jeux+profils
├── stitch-briefs/
│   ├── 01_landing.md
│   ├── 02_onboarding.md
│   ├── 03_profile_result.md
│   ├── 04_catalog.md
│   ├── 05_experience_detail.md
│   └── 06_register.md
└── .claude/
    └── skills/
        ├── mvp-scope-guard/SKILL.md
        ├── design-system-keeper/SKILL.md
        └── matching-spec-keeper/SKILL.md
```

## 🚀 Comment l'utiliser

### Avec Claude Code (terminal)
1. Place ce dossier `build-kit/` à la racine de ton repo (ou pointe Claude Code dessus)
2. Lance Claude Code dans le dossier
3. Première commande : *"Lis CLAUDE.md, puis dis-moi ce que tu vas faire en semaine 1."*
4. Suis la `08_ROADMAP.md`, semaine par semaine, sans sauter d'étape

### Avec Stitch (Google) ou Claude Design
1. Pour chaque écran, copie le brief correspondant dans `stitch-briefs/`
2. Colle-le dans Stitch / Claude Design comme prompt
3. Le brief contient déjà : intent, structure, données, style, états

## 🛡️ Anti-dérive

Trois skills sont là pour empêcher Claude Code de partir hors scope :
- **mvp-scope-guard** : refuse toute feature pas dans `02_MVP_SCOPE.md`
- **design-system-keeper** : refuse toute couleur/style hors tokens
- **matching-spec-keeper** : force la cohérence entre code, data model et matching

## 📝 Convention

- **Anglais** dans le code (variables, fonctions, classes)
- **Français** dans la doc, les commentaires utilisateur, les copies UI
- **Mobile-first** toujours
- **Un seul CTA principal** par écran

## ⏭️ V1+

Tout ce qui est marqué *V1+* dans les docs est **pour plus tard**. Le MVP doit valider 4 KPIs avant tout ajout :
- 50 onboardings complétés
- 20 inscriptions payantes
- 1 expérience IRL organisée et vécue
- NPS ≥ 7

Source brute des idées V1+ : `app_organisé/` (50 docx organisés en 8 thèmes).
