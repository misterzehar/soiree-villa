# 03 — Parcours utilisateurs (MVP)

## Parcours principal — Le participant

```
[Landing page]
     │
     ▼
[CTA "Découvre ton style social"]
     │
     ▼
[Onboarding "Tu préfères ?" — 15 questions]
     │  (~45 sec)
     ▼
[Écran "Voici ton profil" — résultat]
     │
     ▼
[CTA "Voir les expériences pour toi"]
     │
     ▼
[Catalogue filtré par profil]
     │
     ▼
[Détail d'une expérience]
     │
     ▼
[CTA "Je participe"]
     │
     ▼
[Formulaire (nom, email)]
     │
     ▼
[Stripe Checkout]
     │
     ▼
[Page de confirmation + email]
```

## Détail étape par étape

### Étape 1 — Landing page
- L'utilisateur arrive (depuis Insta, LinkedIn, bouche-à-oreille)
- Il voit en 3 secondes ce que c'est
- 1 seul CTA : **"Découvre ton style social"**
- Pas de menu, pas d'about, pas de footer chargé. Une page longue avec hero, problème, solution, social proof minimale, CTA.

### Étape 2 — Onboarding
- 15 questions au format **swipe carte A vs carte B**
- Progression visible (3/15, 4/15...)
- Chaque réponse = +1 sur un axe
- Pas d'explication, pas de nuance, pas de "skip"
- Animations fluides (voir Design System)

### Étape 3 — Résultat profil
- Affichage du profil dominant (ex : "Explorateur Festif")
- Une phrase de description ("Tu aimes les ambiances dynamiques, les groupes vivants...")
- 3 traits clés en bullet
- 1 CTA : **"Voir les expériences pour toi"**

### Étape 4 — Catalogue filtré
- Liste de 5-10 expériences taggées avec le profil de l'utilisateur
- Chaque carte expérience montre : photo, titre, lieu, date, prix, ambiance
- Pas de filtre, pas de tri, pas de recherche (manque de scope MVP)
- Scroll vertical infini si > 10 expériences (peu probable pour le MVP)

### Étape 5 — Détail expérience
- Photo grande
- Titre + description longue
- Le "menu social" : entrée / plat / dessert
- Lieu (nom + ambiance)
- Date + heure
- Prix
- Capacité (X/Y participants déjà inscrits)
- 1 CTA : **"Je participe"**

### Étape 6 — Inscription
- Form ultra simple : prénom, nom, email
- Pas de mot de passe (le profil est en cookie / session)
- Bouton **"Procéder au paiement"**

### Étape 7 — Paiement
- Redirection Stripe Checkout (hosted)
- Retour sur la page de confirmation après paiement

### Étape 8 — Confirmation
- Message de remerciement
- Récap : expérience, lieu, date, comment se préparer
- Email de confirmation envoyé en parallèle

## Parcours admin (minimal)

```
[/admin (auth basique par token URL)]
     │
     ▼
[Liste des expériences + nb d'inscrits par expérience]
     │
     ▼
[Détail d'une expérience → liste des inscrits avec leur profil + email]
```

Pas plus. Pas de création/modif d'expérience via UI : ça se fait directement en BDD pour le MVP.

## Parcours organisateur (HORS MVP)

⛔ **Pas dans le MVP.** Les organisateurs sont gérés par toi en direct (Whatsapp / téléphone). Aucune interface dédiée.
