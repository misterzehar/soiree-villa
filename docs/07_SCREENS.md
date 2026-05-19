# 07 — Liste des écrans (MVP)

## Vue d'ensemble

**7 écrans MVP**, dans l'ordre du parcours utilisateur :

| # | Écran | Route | Brief Stitch |
|---|-------|-------|--------------|
| 1 | Landing page | `/` | `stitch-briefs/01_landing.md` |
| 2 | Onboarding "Tu préfères ?" | `/onboarding` | `stitch-briefs/02_onboarding.md` |
| 3 | Résultat profil | `/onboarding/result` | `stitch-briefs/03_profile_result.md` |
| 4 | Catalogue d'expériences | `/experiences` | `stitch-briefs/04_catalog.md` |
| 5 | Détail d'une expérience | `/experiences/[id]` | `stitch-briefs/05_experience_detail.md` |
| 6 | Inscription + paiement | `/experiences/[id]/register` | `stitch-briefs/06_register.md` |
| 7 | Confirmation | `/experiences/[id]/confirmation` | (template simple, pas de brief Stitch) |

Plus une page admin minimale (`/admin?token=...`) qui ne nécessite pas de brief Stitch (juste un tableau).

## Intent global

Chaque écran a **un seul objectif** :

| # | Écran | Intent unique |
|---|-------|---------------|
| 1 | Landing | Faire cliquer "Découvre ton style" |
| 2 | Onboarding | Capturer 15 réponses sans frustration |
| 3 | Résultat | Donner un "wow" sans surpromettre |
| 4 | Catalogue | Faire cliquer sur une expérience |
| 5 | Détail | Faire cliquer "Je participe" |
| 6 | Inscription | Capturer email + paiement |
| 7 | Confirmation | Rassurer + préparer pour l'expérience |

## Règles d'or pour tous les écrans

1. **Un seul CTA principal par écran** (les autres actions sont secondaires/discrètes)
2. **Mobile-first** (375px width testé en priorité)
3. **Texte court** (chaque sentence < 20 mots, chaque paragraphe < 4 lignes)
4. **Pas de menu de navigation persistant** sur le MVP (sauf un logo qui ramène à `/`)
5. **Loading states** pour toute action async (skeleton ou spinner)
6. **Empty states** prévus partout

## ⚠️ Pour Claude Code

- N'ajoute pas d'écrans non listés ici. Si tu penses qu'il en faut un, demande à l'utilisateur.
- Les briefs Stitch correspondants sont dans `stitch-briefs/`. **Lis le brief avant de générer ou implémenter l'écran.**
