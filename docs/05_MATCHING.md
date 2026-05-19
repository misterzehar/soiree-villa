# 05 — Logique de matching (MVP)

## Principe MVP

Le matching MVP est **manuel** : chaque expérience est taggée à la main par l'admin avec la liste des profils compatibles. Pas d'algorithme runtime.

```
Participant → onboarding → profil_id
Expérience → admin tag → [profil_id_1, profil_id_2, ...]
Catalogue affiché = expériences où participant.profil_id ∈ experience.compatible_profiles
```

C'est tout. On ne fait pas plus pour le MVP.

## Pseudo-code

```ts
function getCompatibleExperiences(
  participantProfile: ProfileId,
  experiences: Experience[]
): Experience[] {
  return experiences
    .filter(exp => exp.status === 'published')
    .filter(exp => exp.compatible_profiles.includes(participantProfile))
    .filter(exp => new Date(exp.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
```

## Calcul du profil à partir des réponses d'onboarding

```ts
function computeProfile(answers: AnswersMap): {
  profile: Profile
  axesScores: AxesScores
} {
  // Étape 1 : sommer les +1/-1 par axe
  const scores = {
    energy: 0, structure: 0, depth: 0, sociality: 0
  }
  for (const [questionId, choice] of Object.entries(answers)) {
    const q = QUESTIONS.find(x => x.id === Number(questionId))!
    const value = choice === 'A' ? q.optionA.value : q.optionB.value
    scores[q.axis] += value
  }

  // Étape 2 : trouver le profil qui correspond aux 4 signes
  const target = {
    energy:    scores.energy    >= 0 ? 'extra'        : 'intro',
    structure: scores.structure >= 0 ? 'structured'   : 'spontaneous',
    depth:     scores.depth     >= 0 ? 'deep'         : 'light',
    sociality: scores.sociality >= 0 ? 'large'        : 'small',
  }

  const exact = PROFILES.find(p =>
    p.axes.energy === target.energy &&
    p.axes.structure === target.structure &&
    p.axes.depth === target.depth &&
    p.axes.sociality === target.sociality
  )

  if (exact) return { profile: exact, axesScores: scores }

  // Étape 3 : fallback — profil le plus proche par distance Hamming
  const closest = PROFILES
    .map(p => ({
      profile: p,
      distance: countDifferences(p.axes, target)
    }))
    .sort((a, b) => a.distance - b.distance)[0]

  return { profile: closest.profile, axesScores: scores }
}

function countDifferences(a: AxesSigns, b: AxesSigns): number {
  return Object.keys(a).filter(k => a[k] !== b[k]).length
}
```

## Tagging des expériences (manuel, fait en BDD)

Quand un admin crée une expérience, il choisit dans une liste fermée parmi les 6 profils ceux qui sont compatibles.

**Recommandation** : tagger en moyenne **2-3 profils par expérience** pour avoir un matching ni trop strict (sinon catalogue vide), ni trop large (sinon plus de matching).

### Exemple

| Expérience | Profils compatibles |
|------------|---------------------|
| Blind test rooftop | `explorer_festif`, `connecteur_social` |
| Atelier dégustation vin | `cerebrale_curieux`, `creatif_libre` |
| Cercle de parole | `empathique_calme`, `observateur_profond` |
| Soirée jeux d'impro | `explorer_festif`, `creatif_libre` |
| Dîner en petit comité | `connecteur_social`, `empathique_calme`, `observateur_profond` |

## Cas où le catalogue est vide

Si après filtrage, l'utilisateur voit 0 expérience :
- Afficher un message : *"On n'a pas encore d'expérience pour ton profil. Laisse-nous ton email, on te contacte dès qu'on en organise une."*
- Form simple email → enregistrement en table `waitlist` (table à créer)

---

## V1+ (PAS POUR LE MVP — pour mémoire)

Pour V1, le matching deviendra algorithmique avec :

- 6 axes au lieu de 4
- Score de compatibilité **continu** (pas binaire)
- Matching croisé : participant ↔ organisateur, participant ↔ lieu, organisateur ↔ lieu ↔ expérience
- Optimisation du **groupe** (pas que de l'expérience individuelle)

Mais **rien de tout ça en MVP**. Voir le doc source `03_Matching_et_algorithme/01 - Algorithme complet de matching.docx` quand on attaquera V1.

---

## ⚠️ Pour Claude Code

- Le matching MVP est **un filtre simple**, pas un algo. Si tu commences à écrire des fonctions de "scoring de compatibilité" continu, tu es hors scope.
- Les 6 profils sont les **seules** clés de matching. Pas d'ajout de critères (âge, ville, etc.) avant V1.
- Si tu modifies ce fichier, **mets aussi à jour `04_DATA_MODEL.md`** dans le même commit.
