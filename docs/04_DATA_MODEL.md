# 04 — Modèle de données (MVP)

## Vue d'ensemble

Pour le MVP, **3 entités principales** :

1. `Experience` — une soirée organisée
2. `Profile` — les 6 profils sociaux MVP
3. `Registration` — l'inscription d'un participant à une expérience

Pas d'utilisateur persistant. Pas de comptes. La session de l'utilisateur stocke son profil temporairement.

---

## Entités

### `Profile` (data statique, en code)

Les 6 profils sociaux MVP (version simplifiée des 20 du concept complet). Stockés en dur dans le code (constante TypeScript).

```ts
type Profile = {
  id: 'explorer_festif' | 'connecteur_social' | 'cerebrale_curieux'
     | 'empathique_calme' | 'creatif_libre' | 'observateur_profond'
  name: string                  // "L'Explorateur Festif"
  emoji: string                 // "🎉"
  tagline: string               // "Tu aimes les ambiances vivantes..."
  traits: string[]              // ["Extraverti", "Spontané", "Fun"]
  axes: {
    energy: 'extra' | 'intro'
    structure: 'spontaneous' | 'structured'
    depth: 'light' | 'deep'
    sociality: 'small' | 'large'
  }
}
```

#### Les 6 profils

| ID | Nom | Énergie | Structure | Profondeur | Socialité |
|----|-----|---------|-----------|------------|-----------|
| `explorer_festif` | L'Explorateur Festif | extra | spontaneous | light | large |
| `connecteur_social` | Le Connecteur Social | extra | structured | deep | large |
| `cerebrale_curieux` | Le Cérébral Curieux | intro | structured | deep | small |
| `empathique_calme` | L'Empathique Calme | intro | spontaneous | deep | small |
| `creatif_libre` | Le Créatif Libre | extra | spontaneous | deep | small |
| `observateur_profond` | L'Observateur Profond | intro | structured | deep | small |

### `Experience` (table BDD)

```sql
create table experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,           -- Markdown supporté
  menu_social jsonb not null,          -- voir format ci-dessous (3 actes : Comprendre/Vivre/Oser)
  venue_name text not null,
  venue_ambiance text not null,
  date timestamptz not null,
  duration_minutes integer not null,
  -- Tarification en paliers (Shotgun-style) — voir 09_PRICING.md
  pricing_tiers jsonb not null,        -- [{ id: 'early', label: 'Early bird', quantity: 4, price_cents: 2800 }, ...]
  capacity_max integer not null,        -- doit égaler la somme des quantités des paliers
  capacity_current integer default 0,   -- nombre total de places vendues, tous paliers confondus
  cover_image_url text,
  -- Le matching MVP : tableau d'IDs de profils compatibles
  compatible_profiles text[] not null, -- ex: ['explorer_festif', 'connecteur_social']
  organizer_name text not null,
  organizer_bio text,
  status text default 'published',     -- 'draft' | 'published' | 'sold_out' | 'past'
  created_at timestamptz default now()
);
```

**Format du champ `menu_social`** (3 actes psychologiques — voir `01_CONCEPT.md`) :

```json
{
  "entree": {
    "phase": "Comprendre",
    "label": "Brise-glace",
    "description": "Présentation rapide en duo : qu'est-ce qui t'a fait accepter cette soirée ?",
    "duration_minutes": 20
  },
  "plat": {
    "phase": "Vivre",
    "label": "Blind test musical",
    "description": "5 manches en équipes de 3, le DJ provoque les débats.",
    "duration_minutes": 90
  },
  "dessert": {
    "phase": "Oser",
    "label": "Cercle final",
    "description": "Verre offert, photo souvenir, on se livre avant de se quitter.",
    "duration_minutes": 30
  }
}
```

> ⚠️ **Rappel sémantique** : `entree`, `plat`, `dessert` ne sont **pas** des aliments. Ce sont des phases sociales (Comprendre / Vivre / Oser). L'UI doit refléter ces verbes, pas des références culinaires.

**Format du champ `pricing_tiers`** :

```json
[
  { "id": "early",    "label": "Early bird",  "quantity": 4, "price_cents": 2800 },
  { "id": "standard", "label": "Standard",    "quantity": 6, "price_cents": 3500 },
  { "id": "last",     "label": "Last chance", "quantity": 2, "price_cents": 4200 }
]
```

L'ordre du tableau **fait foi** pour la séquence d'activation. La somme des `quantity` doit égaler `capacity_max`. Voir `09_PRICING.md` pour la logique complète.

### `Registration` (table BDD)

```sql
create table registrations (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id),
  participant_first_name text not null,
  participant_last_name text not null,
  participant_email text not null,
  participant_profile_id text not null,  -- l'un des 6 profils
  tier_id text not null,                 -- 'early' | 'standard' | 'last' — palier au moment de l'achat (sert pour annulations / restock)
  charter_accepted_at timestamptz not null, -- preuve d'acceptation de la charte participant (cf. 11_CHARTES.md)
  stripe_session_id text,
  payment_status text default 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  amount_paid_cents integer,
  created_at timestamptz default now()
);

create index on registrations(experience_id);
create index on registrations(participant_email);
```

### `OnboardingResponse` (table BDD — optionnelle pour analytics)

```sql
create table onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,             -- cookie ID
  answers jsonb not null,               -- [{ q: 1, choice: 'A' }, ...]
  computed_profile text not null,
  axes_scores jsonb not null,           -- { energy: +3, structure: -1, ... }
  created_at timestamptz default now()
);
```

---

## Les axes de scoring (MVP — 4 axes)

Version simplifiée. Les 6 axes complets sont pour V1.

| Axe | Plage | Description |
|-----|-------|-------------|
| **Énergie** (`energy`) | -3 à +3 | Introverti ↔ Extraverti |
| **Structure** (`structure`) | -3 à +3 | Spontané ↔ Structuré |
| **Profondeur** (`depth`) | -3 à +3 | Léger ↔ Profond |
| **Socialité** (`sociality`) | -3 à +3 | Petit groupe ↔ Grand groupe |

### Règle de scoring

Chaque question modifie **un seul axe** de **+1 ou -1** selon la réponse. Avec 15 questions, chaque axe reçoit en moyenne ~3-4 questions.

### Attribution du profil

À la fin du quiz, on regarde le **signe** de chaque score :

```
profile = profilesById.find(p =>
  p.axes.energy     === (energy   >= 0 ? 'extra'        : 'intro') &&
  p.axes.structure  === (structure>= 0 ? 'structured'   : 'spontaneous') &&
  p.axes.depth      === (depth    >= 0 ? 'deep'         : 'light') &&
  p.axes.sociality  === (sociality>= 0 ? 'large'        : 'small')
)
```

Si aucun profil ne match exactement (rare), on prend le plus proche par distance euclidienne. **Voir `05_MATCHING.md` pour les détails.**

---

## Les 15 questions de l'onboarding

Stockées en constante TypeScript. Format :

```ts
type OnboardingQuestion = {
  id: number
  axis: 'energy' | 'structure' | 'depth' | 'sociality'
  optionA: { label: string; value: -1 | +1 }
  optionB: { label: string; value: -1 | +1 }
}
```

La banque de questions doit être tirée du document `03_Matching_et_algorithme/05 - Liste 'Tu préfères ?'.docx` du dossier source. Demander à l'utilisateur de fournir les 15 questions précises avant l'implémentation, ou utiliser un échantillon issu de ce doc.

---

## ⚠️ Pour Claude Code

- **N'invente pas** de profils, de questions ou d'axes. Tout est ici.
- Les 6 profils du MVP sont **fixes**. Pas 7, pas 5. Pas "et si on en ajoutait un".
- Les 4 axes du MVP sont **fixes**. Les 6 axes (Cérébral, Collaboration en plus) sont pour V1.
- Si tu modifies ce fichier, **mets aussi à jour `05_MATCHING.md`** dans le même commit.
