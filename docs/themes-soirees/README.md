# 📁 Dossier `themes-soirees/` — Banque des thèmes de soirée

> Ce sous-dossier regroupe **tous les thèmes de soirée Soirée Villa** : l'identité, l'ambiance et le cadre scénarisé d'une expérience.
>
> 🎯 **Idée centrale** : *"Ce que Soirée Villa vend, ce n'est pas une soirée — c'est une expérience scénarisée selon un thème."* Le thème détermine qui vient, comment c'est décoré, ce qu'on porte, ce qu'on joue.
>
> 🔗 **Liens** : un thème se construit avec des **lieux** (`../opportunites/`), des **jeux/mécaniques** (`../inspiration-jeux/`), il s'incarne dans le **menu social Comprendre/Vivre/Oser** (`../01_CONCEPT.md`) et il cible des **profils sociaux** (`../13_PROFILS.md`).

---

## 📂 Les fichiers du dossier

| Fichier | Rôle |
|---------|------|
| **`01_BANQUE_THEMES.md`** | Les **6 thèmes officiels** Soirée Villa + les thèmes créés par les organisateurs, chacun en **fiche standardisée**. |

---

## 🗂️ Format d'une fiche thème

Chaque thème suit **toujours la même structure**. Tant qu'un champ n'est pas rempli, mettre **"à compléter"** (jamais inventer).

```markdown
### [Emoji] Nom du thème

**Pitch / ambiance** : une phrase qui capture l'esprit.

**Sous-catégories** : déclinaisons du thème (ex : "façon enquête meurtre", "façon BDSM"…).

**Statut** : 🏛️ Officiel Soirée Villa / ✅ Organisateur validé / ⏳ Organisateur en attente de validation.

**Niveau de sensibilité** : Tout public / Adulte / Sensible (→ cadre de consentement renforcé, cf. `../11_CHARTES.md`).

---
#### Implémentation détaillée

- **Lieux adaptés** : types de lieux + références dans `../opportunites/`.
- **Objets / accessoires** : ce qu'il faut prévoir.
- **Tenues / dress code** : ce que portent les participants.
- **Acteurs / rôles** : rôles tenus par l'organisateur ou des comédiens.
- **Invités / cible** : profils sociaux visés (cf. `../13_PROFILS.md`) + type de public.
- **Décor** : ambiance visuelle, lumière, scénographie.
- **Programme** : déroulé selon le menu social — Entrée (Comprendre) / Plat (Vivre) / Dessert (Oser).
- **Prix indicatif** : fourchette de prix par participant (lien `../09_PRICING.md`).
- **Bénéfice / marge** : estimation de rentabilité (à affiner).
- **Partenaires** : marques, prestataires, lieux partenaires possibles.
- **Aide / ressources** : matériel, compétences, prestataires nécessaires.

---
**Jeux & mécaniques compatibles** : renvoi vers `../inspiration-jeux/01_BANQUE_IDEES_JEUX.md`.
```

---

## 🌳 Système de catégories et sous-catégories

- Les **6 thèmes officiels** sont les **catégories racines**.
- Chaque thème peut avoir des **sous-catégories** (ex : "Mystérieuse et classe" → "façon enquête meurtre", "façon BDSM élégant").
- Les thèmes servent aussi de **modèles** : un organisateur peut partir d'un thème officiel et le décliner.

---

## 🔄 Workflow : ajouter ou compléter un thème

### Ajouter un nouveau thème
1. Vérifier qu'il n'est pas une simple sous-catégorie d'un thème existant.
2. Le structurer au format de fiche ci-dessus.
3. Définir son **statut** (officiel / organisateur validé / en attente) et son **niveau de sensibilité**.
4. L'ajouter dans `01_BANQUE_THEMES.md`.
5. Mettre à jour le compteur en haut du fichier banque.

### Compléter un thème existant
- Remplir les champs "à compléter" au fur et à mesure (lieux, acteurs, prix, etc.).
- Chaque ajout doit être **vérifié** : fiabilité de l'info, utilité réelle.

### Thèmes créés par les organisateurs (V1+)
- En **MVP** : seuls les 6 thèmes officiels existent, ils cadrent les 5-7 expériences pilotes saisies en BDD par l'admin.
- En **V1+** : les organisateurs pourront soumettre leurs propres thèmes → passage par une **validation** (statut ⏳ → ✅ ou rejet). Critères de validation : cohérence avec les principes Soirée Villa, faisabilité, respect de la charte.

---

## ⚠️ Règles

- **Garder le format de fiche identique** pour tous les thèmes.
- **Ne jamais inventer** un détail d'implémentation : si J n'a pas précisé, mettre "à compléter".
- Les thèmes **sensibles** (BDSM, sensuel poussé) doivent **obligatoirement** référencer la charte (`../11_CHARTES.md`) et un cadre de consentement renforcé.
- Tout ajout d'un contributeur (organisateur en V1+) doit être **validé et vérifié** avant publication.
- Si un thème devient trop riche, ses sous-catégories peuvent être éclatées en fiches séparées.

---

## 📊 État actuel

| Indicateur | Valeur |
|------------|--------|
| Thèmes officiels | 6 |
| Thèmes organisateurs | 0 (V1+) |
| Niveau de complétude moyen | Pitch défini, implémentation à compléter |
| Dernière mise à jour | 2026-05-06 |
| Source initiale | Doc J "🎭 Les 6 thèmes Soirée Villa" |
