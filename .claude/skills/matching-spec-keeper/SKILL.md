---
name: matching-spec-keeper
description: Garde la cohérence entre la logique de matching dans le code, les profils et axes de scoring. À déclencher AVANT toute modification touchant aux profils, aux axes de scoring, aux questions d'onboarding, ou à la fonction `computeProfile`. Force la mise à jour synchrone de `docs/04_DATA_MODEL.md`, `docs/05_MATCHING.md` et du code.
---

# Matching Spec Keeper

## Rôle
La logique de matching est la **grammaire du produit**. Elle est définie dans 3 endroits :
1. `docs/04_DATA_MODEL.md` (les 6 profils, les 4 axes)
2. `docs/05_MATCHING.md` (la formule, le pseudo-code)
3. Le code (`PROFILES`, `QUESTIONS`, `computeProfile()`, `getCompatibleExperiences()`)

Tu empêches que ces 3 sources divergent.

## Quand t'activer
Avant toute modification de :
- La constante `PROFILES`
- La constante `QUESTIONS`
- La fonction `computeProfile()`
- La fonction `getCompatibleExperiences()`
- Les axes de scoring (ajout, suppression, renommage)
- Le tagging `compatible_profiles` d'une expérience

## Règles strictes

### Règle 1 — Pas de changement unilatéral
Si tu modifies l'un des 3 (docs ou code), tu modifies **les 2 autres** dans le même commit.

### Règle 2 — Le MVP a 4 axes, pas 6
- ✅ MVP : Énergie, Structure, Profondeur, Socialité
- ❌ MVP : Cérébral, Collaboration (ces axes sont V1)

Si l'utilisateur demande à ajouter un axe pour le MVP → c'est probablement de la dérive scope. Vérifier avec `mvp-scope-guard`.

### Règle 3 — Le MVP a 6 profils, pas 20
- ✅ MVP : explorer_festif, connecteur_social, cerebrale_curieux, empathique_calme, creatif_libre, observateur_profond
- ❌ MVP : les 14 autres profils du concept complet

### Règle 4 — Les profils MVP couvrent 6 des 16 combinaisons possibles (2^4 axes)
Le fallback "profil le plus proche par distance Hamming" gère les 10 autres combinaisons. Pas besoin d'ajouter de profils.

### Règle 5 — Le matching MVP est binaire (filtre par tag), pas continu
Pas de score de compatibilité 0-100. Pas de pondération d'axe. Juste un filtre `profil ∈ compatible_profiles`.

## Checklist avant commit

- [ ] Si j'ai modifié les profils, est-ce que `04_DATA_MODEL.md` est à jour ?
- [ ] Si j'ai modifié les axes, est-ce que `04_DATA_MODEL.md` ET `05_MATCHING.md` sont à jour ?
- [ ] Si j'ai modifié `computeProfile()`, est-ce que le pseudo-code dans `05_MATCHING.md` est à jour ?
- [ ] Les questions d'onboarding réfèrent-elles toujours à des axes valides ?
- [ ] Chaque profil a-t-il bien ses 4 axes définis (energy, structure, depth, sociality) ?
- [ ] Existe-t-il au moins 2 questions par axe dans la banque de questions ?

## Format de modification

Si l'utilisateur demande "modifie le profil X" :
1. Annonce ce qui va être modifié dans le code et dans les docs
2. Modifie les 3 endroits dans la même opération
3. Termine par : *"Spécification de matching mise à jour dans le code, `04_DATA_MODEL.md` et `05_MATCHING.md`."*

## Exemple de refus

Utilisateur : "Ajoute un 7e profil 'Le Stratège'"

Réponse :
```
🟡 Modification de la spec de matching détectée.

Avant d'exécuter, je vérifie :
1. Les 4 axes du profil "Stratège" → ?
2. Mise à jour de `04_DATA_MODEL.md` (table des profils + types)
3. Mise à jour de `05_MATCHING.md` si la logique de fallback change
4. Mise à jour du code (`PROFILES` constante)
5. Re-tagging de chaque expérience existante (est-ce que ce profil match certaines ?)

Confirme les 4 axes du profil "Stratège" et je fais les 4 changements en une fois.
```

## Important
Ce skill ne bloque pas les modifications, il les force à être **cohérentes**. La vraie question scope (faut-il modifier la spec ?) est gérée par `mvp-scope-guard`.
