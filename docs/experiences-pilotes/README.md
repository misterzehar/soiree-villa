# 📁 Dossier `experiences-pilotes/` — Les 5-7 expériences MVP

> Ce sous-dossier contient les **expériences pilotes** que J va organiser concrètement pour le MVP. Chacune est issue de la combinaison d'un **thème** (`../themes-soirees/`), d'un **lieu** (`../opportunites/`), de **jeux/mécaniques** (`../inspiration-jeux/`) et de **profils-cibles** (`../13_PROFILS.md`).

---

## 📂 Les fichiers du dossier

| Fichier | Rôle |
|---------|------|
| **`01_BANQUE_EXPERIENCES.md`** | Les 5-7 expériences pilotes — chacune sous forme de **fiche complète** prête à saisir en base Supabase. |

---

## 🗂️ Format d'une fiche expérience

Chaque fiche correspond à **une ligne de la table `experiences`** définie dans `../04_DATA_MODEL.md`. Les champs sont en français ici (lisibilité) mais correspondent aux champs SQL.

```markdown
### 🎭 [Emoji] [Titre de l'expérience]

**Thème** : référence à un des 6 thèmes (`../themes-soirees/`).
**Pitch** : 1-2 phrases pour la card catalogue.
**Description complète** : 4-6 lignes pour la page détail.
**Date** : YYYY-MM-DD HH:MM.
**Durée** : minutes (ex : 180).
**Lieu** : nom + ambiance courte. Lien vers `../opportunites/`.
**Capacité** : min - max participants.

#### 🍽️ Menu social (3 actes)
- **Entrée — Comprendre** : nom + description + durée
- **Plat — Vivre** : nom + description + durée
- **Dessert — Oser** : nom + description + durée

#### 💰 Tarification (3 paliers)
- **Early bird** : N places à X €
- **Standard** : N places à Y €
- **Last chance** : N places à Z €

#### 🎯 Profils sociaux compatibles
Liste des IDs profils (cf. `../13_PROFILS.md`) — ex : `[explorer_festif, connecteur_social]`.

#### 🎤 Organisateur·rice
Nom + bio courte (à compléter par J).

#### 🔗 Jeux & mécaniques utilisés
Liens vers `../inspiration-jeux/01_BANQUE_IDEES_JEUX.md`.
```

---

## 🔄 Workflow : ajouter une expérience

1. **Choisir un thème** dans `../themes-soirees/01_BANQUE_THEMES.md`.
2. **Choisir un lieu** dans `../opportunites/03_CLASSIFICATION_SITES.md` (priorité Côte d'Azur).
3. **Choisir 1-3 mécaniques de jeu** dans `../inspiration-jeux/01_BANQUE_IDEES_JEUX.md`.
4. **Définir profils compatibles** dans `../13_PROFILS.md`.
5. **Composer le menu social** (Entrée / Plat / Dessert) en cohérence avec le thème et les mécaniques.
6. **Définir prix paliers** selon `../09_PRICING.md`.
7. **Valider contre les 4 principes** de `../inspiration-jeux/00_PRINCIPES_EXPERIENCE.md` (zéro exclusion, obsession semaine, joie contagieuse, rôles secrets).
8. **Ajouter la fiche** dans `01_BANQUE_EXPERIENCES.md`.

---

## ⚠️ Règles

- **5 à 7 expériences MAX en MVP.** Au-delà = hors scope.
- Les fiches doivent être **prêtes à saisir en BDD** sans aucune ambiguïté.
- Les **prix sont indicatifs** — à valider via sondages (cf. réponse J à l'audit).
- L'**organisateur·rice de la 1ère expérience** est à confirmer par J (lui-même ? un pote ? un pro engagé ?).
