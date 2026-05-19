# Brief Stitch — 06 Inscription + paiement

## Route
`/experiences/[id]/register`

## Intent unique
Capturer **prénom / nom / email** puis rediriger vers **Stripe Checkout**.

## Audience
Utilisateur convaincu qui veut payer sa place.

## Structure (mobile-first)

### En-tête
- Bouton retour (←) en haut à gauche → détail expérience
- Titre : *"Tu réserves ta place pour"*
- Sous-titre : nom de l'expérience + date (text-base, color-text-muted)

### Récap commande (card sticky en haut)
- Image thumbnail (rounded-xl, 80x80)
- Titre expérience + date
- **Prix du palier en cours** à droite (text-xl, font-bold)
- Badge palier sous le prix (text-xs, rounded-full) — ex : *"Early bird"*
- Si le palier en cours est en train de finir, petit texte rassurant : *"Tu profites du tarif early bird — il reste 2 places à ce prix."*

### Form (rounded-2xl, bg-surface, p-4)

3 champs uniquement :

1. **Prénom** — input text, required, autocapitalize words
2. **Nom** — input text, required
3. **Email** — input email, required, type="email"

Sous le form, **2 checkboxes séparées** (les 2 doivent être cochées pour pouvoir payer) :

1. ☐ *"J'accepte les conditions générales et la politique d'annulation"* (lien vers `/legal`)
2. ☐ *"J'ai lu et j'accepte la charte de Soirée Villa"* (lien vers `/charte`) — formulation courte sous la checkbox : *"Tu es là pour vivre l'expérience, pas la subir ni la casser."*

Sous les checkboxes, texte petit : *"Tu recevras un email de confirmation après paiement. Annulation possible jusqu'à 48h avant."*

> ⚠️ La checkbox charte est **obligatoire** — son absence est un bug bloquant. La date d'acceptation est stockée en BDD (`registrations.charter_accepted_at`) pour preuve juridique. Voir `docs/11_CHARTES.md`.

### CTA
- Bouton primary plein largeur : **"Payer 28€"** (le prix affiché = palier en cours, icône cadenas Lock à gauche)
- Loading state : spinner + texte *"Redirection vers le paiement…"*
- Logos de paiement en dessous (Visa, Mastercard, CB) — petits, color-text-muted

> ⚠️ **Le prix sur ce bouton est purement cosmétique.** Le prix réel envoyé à Stripe est **recalculé côté serveur** au clic, en lisant le palier en cours. Si quelqu'un change le HTML, ça n'a aucun effet sur le montant débité. Voir `09_PRICING.md`.

## Données affichées
- `Experience` (titre, date, prix, image) chargée depuis Supabase
- Form state local (React Hook Form ou state simple)
- Profil de l'utilisateur (depuis cookie) → envoyé à la création de la `Registration`

## Actions
- Submit form valide :
  1. Créer une `Registration` en BDD avec `payment_status='pending'`
  2. Créer une session Stripe Checkout (mode hosted)
  3. Rediriger vers l'URL Stripe (window.location)
  4. Stripe webhook → met à jour `payment_status='paid'` + envoie email Resend/Postmark
  5. Stripe `success_url` → `/experiences/[id]/confirmation`
  6. Stripe `cancel_url` → revient sur cette page

## Style
- Form clean, espacé (`space-y-4` entre champs)
- Labels au-dessus des inputs (text-sm, font-medium)
- Erreurs de validation : texte rouge (color-error) sous chaque input
- Bouton primary toujours visible (sticky bottom sur mobile)

## États
- Loading initial : skeleton du récap + form
- Validation : erreur inline par champ
- Submit en cours : bouton disabled + spinner
- Erreur Stripe : toast rouge *"Une erreur est survenue, réessaie"*
- Sold out (race condition) : message + bouton retour catalogue

## Validation
- Prénom / nom : min 2 caractères, max 50, lettres + espaces + tirets
- Email : regex standard
- CGU : checkbox required

## ⚠️ Pour Stitch
- **Pas** de champ téléphone (pas demandé en MVP)
- **Pas** de champ adresse postale (paiement online, pas de livraison)
- **Pas** de saisie de carte directement — on délègue à Stripe Checkout (hosted)
- **Pas** d'inscription invité multiple en MVP (1 personne par inscription)
- Le bouton "Payer" doit afficher **le montant** pour rassurer
