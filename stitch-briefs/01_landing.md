# Brief Stitch — 01 Landing page

## Route
`/`

## Intent unique
Convaincre le visiteur en 5 secondes et le faire cliquer sur **"Découvre ton style"**.

## Audience
Visiteur qui découvre l'app pour la première fois (depuis Insta, bouche-à-oreille, partage). Pas de compte.

## Structure (mobile-first, scroll vertical)

1. **Hero plein écran**
   - Logo en haut à gauche (petit)
   - **Eyebrow** (text-sm, font-medium, color-primary, uppercase, tracking-widest) : *"COMPRENDRE · VIVRE · OSER"*
   - Headline (text-5xl, font-display) : *"Des soirées pensées pour ton style social."*
   - Sous-titre (text-lg, color-text-muted) : *"On te matche avec des expériences animées qui te ressemblent. Plus de soirées subies."*
   - CTA primary : **"Découvre ton style"** (bouton arrondi, bg-primary)
   - Photo de fond : un groupe de 4-5 personnes qui rient autour d'une table, lumière chaude, pas de cliché "stock"

2. **Section "Comment ça marche" (3 étapes)**
   - 3 cards horizontales (mobile : empilées) : *"1. Tu réponds à 15 mini-questions"* / *"2. On te révèle ton profil social"* / *"3. On te propose des soirées qui matchent"*
   - Icônes lucide-react (sparkles, user, calendar)

3. **Section "Notre signature : un parcours en 3 actes"**
   - Bandeau qui présente le slogan avec 3 colonnes (mobile empilées) :
     - **Comprendre** — *"Tu observes, tu te mets en confiance."*
     - **Vivre** — *"Tu agis, tu partages quelque chose de concret."*
     - **Oser** — *"Tu te livres, tu crées du vrai lien."*
   - Sous-titre : *"Chaque expérience suit ce rythme naturel — on ne te jette pas à l'eau, on t'accompagne."*

4. **Section "Ce qu'on organise"**
   - 3 visuels d'expériences (blind test rooftop, atelier dégustation, soirée jeux) — placeholders pour MVP
   - Sous-titre : *"Du blind test au cercle de parole — toujours animé, toujours connecté."*

5. **Section "Pour qui"**
   - Bandeau court : *"Pour celles et ceux qui veulent rencontrer du monde sans subir la soirée."*
   - Pas de témoignages (on n'a pas encore d'utilisateurs)

6. **CTA final**
   - Reprise du bouton primary **"Découvre ton style"**
   - En dessous, petit form *"Pas envie de faire le quiz ? Laisse ton email pour la prochaine soirée."* (collecte waitlist)

7. **Footer minimal**
   - Mentions légales, contact, Insta

## Données affichées
Aucune donnée dynamique en MVP. Tout est statique.

## Actions
- CTA principal → `/onboarding`
- Form email → table `waitlist` Supabase

## Style
- Palette : primary + accent en touches
- Typo display pour H1/H2, body pour le reste
- Photos > illustrations (chaleur humaine)
- Pas de carrousel auto, pas de pop-up, pas de cookie banner intrusif

## États
- Loading : aucun (statique)
- Form email : success (✓ vert) / error (rouge inline)

## ⚠️ Pour Stitch
- Génère **une seule page**, mobile + desktop
- Garde les formes arrondies (rounded-2xl ou plus)
- Pas de mode sombre
- Pas de dashboard, pas de menu nav
