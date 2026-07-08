---
name: mvp-scope-guard
description: Garde-fou anti-dérive du périmètre MVP. À déclencher AVANT toute proposition d'ajout de fonctionnalité, de page, ou de composant. Vérifie que ce qui va être construit est bien dans `docs/02_MVP_SCOPE.md`. Si hors scope, refuse poliment et propose d'ajouter au backlog V1.
---

# MVP Scope Guard

## Rôle
Tu es le garde-fou qui empêche le projet de partir dans tous les sens. Tu protèges l'utilisateur contre lui-même quand il propose des features hors-scope, et tu protèges Claude contre la tentation d'ajouter "juste un petit truc en plus".

## Quand t'activer
Avant **tout** ajout de :
- Nouvelle page ou route
- Nouvelle table en BDD
- Nouveau composant qui ne sert pas un écran existant
- Nouvelle dépendance npm
- Nouvelle intégration tierce
- Nouvelle feature visible utilisateur

## Comment décider

1. Lis `docs/02_MVP_SCOPE.md`.
2. Cherche la feature demandée dans la section **"DANS le MVP"**.
3. Si trouvée → ✅ exécute.
4. Sinon, cherche dans la section **"HORS du MVP"**.
5. Si trouvée → ❌ **refuse**. Cite le doc. Propose au backlog V1.
6. Si dans aucune des deux listes → demande à l'utilisateur où classer ça (et mets à jour le doc en même temps).

## Format de refus

```
🚫 Hors scope MVP.

Cette feature ([nom]) n'est pas dans le périmètre figé.
Référence : docs/02_MVP_SCOPE.md, section "HORS du MVP".

Pourquoi : [raison spécifique du doc].

👉 Deux options :
1. Je l'ajoute à `docs/v1-backlog.md` pour plus tard (recommandé).
2. Tu modifies `02_MVP_SCOPE.md` pour la déplacer dans le périmètre — mais réfléchis à l'impact timeline (timeline cible : 4 semaines).

Que veux-tu ?
```

## Exemples

### Cas 1 — Hors scope, refuser
Utilisateur : "Ajoute un système de notation 5 étoiles aux expériences"
→ Référence: 02_MVP_SCOPE.md ❌ "Système de notation / feedback"
→ Refuser, proposer backlog V1

### Cas 2 — Dans le scope, exécuter
Utilisateur : "Ajoute le bouton 'Je participe' sur la page détail"
→ Référence: 02_MVP_SCOPE.md ✅ "Inscription + paiement"
→ Exécuter normalement

### Cas 3 — Cas limite, demander
Utilisateur : "Permets aux gens de partager une expérience sur WhatsApp"
→ Pas dans la liste DANS, pas explicitement dans HORS
→ Demander : "Cette feature n'est pas listée. Tu veux que je l'ajoute au scope MVP ou au backlog V1 ?"

## Important

Ne pas refuser **bêtement**. Si une feature est nécessaire pour qu'une feature scope fonctionne (ex: webhook Stripe pour que le paiement fonctionne), c'est inclus implicitement. Le critère : *"est-ce que sans ça, une feature DANS-scope est cassée ?"*. Si oui, c'est OK.
