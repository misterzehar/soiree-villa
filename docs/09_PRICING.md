# 09 — Stratégie tarifaire (paliers Shotgun)

## Principe

Pour créer un effet d'**urgence** et **récompenser ceux qui s'inscrivent tôt**, chaque expérience est vendue en **3 paliers de prix**, comme Shotgun ou Dice :

| Palier | Quand il s'active | Quantité | Idée |
|--------|-------------------|----------|------|
| **Early bird** | Dès la mise en ligne | 30-40 % des places | -20 % par rapport au standard |
| **Standard** | Quand l'early est sold out | 40-50 % des places | Prix de référence |
| **Last chance** | Quand le standard est sold out | 10-20 % des places | +20 % par rapport au standard |

Le passage d'un palier à l'autre est **automatique**, basé sur le nombre d'inscriptions payées.

## Exemple concret

**Soirée "Blind test rooftop", capacité 12 places, prix de référence 35 €** :

| Palier | Places | Prix | Recettes potentielles |
|--------|--------|------|----------------------|
| Early bird | 4 | 28 € | 112 € |
| Standard | 6 | 35 € | 210 € |
| Last chance | 2 | 42 € | 84 € |
| **Total** | **12** | — | **406 €** |

À comparer avec un prix unique à 35 € → 420 €. On perd 14 € en théorie, mais on **vend plus vite** (ce qui sécurise l'évènement) et on **crée du FOMO** (ce qui aide la com).

## Règles de fonctionnement

### Calcul du palier en cours (côté serveur)

```ts
function getCurrentTier(experience: Experience): PricingTier {
  const sold = experience.capacity_current
  let cumulative = 0
  for (const tier of experience.pricing_tiers) {
    cumulative += tier.quantity
    if (sold < cumulative) return tier
  }
  // Tous les paliers sont vendus → expérience sold out
  return null
}
```

### Affichage côté utilisateur

- Sur la **card catalogue** : affiche le prix du palier en cours + le compteur du palier (ex : *"28 € — 2 places early bird restantes"*)
- Sur la **page détail** : affiche le palier en cours **en gros**, et indique discrètement le palier suivant (*"Bientôt en standard à 35 €"*)
- Sur la **page paiement** : affiche **uniquement** le palier en cours, pas de choix manuel (le palier est imposé par le serveur)

### Sécurité serveur

Le prix appliqué à Stripe est **toujours recalculé côté serveur** au moment de créer la session Checkout, pas pris depuis le client. Sinon un user malin pourrait modifier le prix dans le navigateur.

```
Client clique "Payer" →
  Server: SELECT * FROM experiences WHERE id = X →
  Server: tier = getCurrentTier(experience) →
  Server: stripe.checkout.sessions.create({ price: tier.price_cents }) →
  Redirect Stripe
```

## Communication marketing

Phrases à utiliser pour pousser l'urgence :

- *"Plus que 2 places early bird à 28 € — ensuite passage à 35 €."*
- *"Last chance : il reste 1 place à 42 €."*
- *"Profite du tarif early bird, on est partis."*

Ces phrases doivent **vivre dans l'UI**, pas seulement dans la com Insta.

## Cas limites

- **Annulation par un participant** : sa place revient en stock dans le **palier où il l'a achetée** (sinon on biaise les paliers)
- **Capacité augmentée** par l'admin : les nouvelles places vont dans le palier **last chance** (pour ne pas léser ceux qui ont payé standard)
- **Expérience reportée** : on garde les paliers tels quels, on change juste la date

## Données stockées

Voir `04_DATA_MODEL.md`. Champ `pricing_tiers` (jsonb) sur la table `experiences`. Champ `tier_id` à enregistrer sur chaque `Registration` (pour pouvoir restaurer le bon palier en cas d'annulation).

## Métriques à tracker (admin)

Pour chaque expérience :
- Combien de places vendues par palier
- Vitesse moyenne d'écoulement de chaque palier
- % de revenus venant de chaque palier

Ces métriques nous diront si la stratégie marche, et si on doit ajuster les ratios (peut-être passer à 50/30/20 si on voit que le standard part plus vite que prévu).

## Hors MVP — pour V1+

- Tarifs **dynamiques** (ajustés en temps réel par algo) → V1+
- **Codes promo** → V1+
- **Tarifs membres** (abonnement annuel avec -20 % sur tout) → V1+
- **Pack 2-pour-1** ou **groupe de 4** → V1+
- **Tarifs partenaires** (entreprises, comités) → V1+

## ⚠️ Pour Claude Code

- Le palier est **toujours calculé côté serveur** au moment du paiement
- Le client **n'envoie jamais le prix** — il envoie juste l'`experience_id`
- Si tu modifies cette logique, mets à jour `04_DATA_MODEL.md` et `stitch-briefs/05` et `06` dans le **même commit**
- Si tu vois une demande de tarif unique qui contourne les paliers, **refuse** (c'est un anti-pattern de notre stratégie de pricing)
