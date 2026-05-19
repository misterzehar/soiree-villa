# 15 — Arbre décisionnel pour classer les sites

> 🎯 **Arbre fourni par J** — copié fidèlement, avec les sous-types affinés (version Gemini retenue).

---

## 🌳 L'arbre

```text
[ DÉPART : Analyser le contenu du site ]
              |
              v
1. Est-ce lié au divertissement ou aux loisirs ?
        /                              \
      NON                              OUI
       |                                |
[ SEGMENT : SERVICES &     2. Faut-il se déplacer physiquement ?
   BIEN-ÊTRE ]                  /                        \
(Non-Loisirs)                  NON                       OUI
                                |                          |
                                v                          v
                       [ SEGMENT : DIGITAL &    3. Est-ce de l'Action / Sport ?
                          À DOMICILE ]                /              \
                       (Loisirs sans déplacement)   OUI               NON
                                                    |                 |
                                                    v                 v
                                              [ SEGMENT :      [ SEGMENT :
                                               IMMERSIF        SORTIES, EVENT
                                               & ACTION ]      & TOURISME ]
                                              (Lieux           (Lieux physiques
                                               physiques        passifs / accueil)
                                               actifs)
```

---

## 📋 Les 4 segments

| Segment | Définition | Q1 | Q2 | Q3 |
|---------|------------|----|----|----|
| 🛠️ **SERVICES & BIEN-ÊTRE** | Outils de travail, services pro, produits de soin. **Non-Loisirs.** | NON | — | — |
| 💻 **DIGITAL & À DOMICILE** | Services smartphone ou produits livrés. **Loisirs sans déplacement.** | OUI | NON | — |
| 🎯 **IMMERSIF & ACTION** | Expériences où vous êtes l'acteur (sport, réflexion, adrénaline). **Lieux physiques actifs.** | OUI | OUI | OUI |
| 🎪 **SORTIES, EVENT & TOURISME** | Plateformes réservation, lieux de vie, agences événementielles. **Lieux passifs / accueil.** | OUI | OUI | NON |

---

## 🎯 Sous-types par segment (version Gemini retenue)

### SERVICES & BIEN-ÊTRE → 3 sous-types
- **Soin & Cosmétique**
- **IA & Data**
- **Services Photo / Pro**

### DIGITAL & À DOMICILE → 3 sous-types
- **Rencontres & Social**
- **Jeux & Fun à la maison**
- **Produits Physiques (Jeux / Souvenirs)**

### IMMERSIF & ACTION → 2 sous-types
- **Action Games & Escape Games**
- **Sport & Danse**

### SORTIES, EVENT & TOURISME → 3 sous-types
- **Billetterie & Médias**
- **Hébergement & Sorties Nuit**
- **Agences Event & Concept B2B**

---

## 📜 Détail des questions

### Q1 — Est-ce lié au divertissement ou aux loisirs ?
- **NON** → SEGMENT SERVICES & BIEN-ÊTRE
- **OUI** → continue Q2

### Q2 — Faut-il se déplacer physiquement ?
- **NON** → SEGMENT DIGITAL & À DOMICILE
- **OUI** → continue Q3

### Q3 — Est-ce de l'Action / Sport ?
- **OUI** → SEGMENT IMMERSIF & ACTION
- **NON** → SEGMENT SORTIES, EVENT & TOURISME

---

## 🔗 Application aux 58 sites

Voir `03_CLASSIFICATION_SITES.md` pour la classification complète.

---

## ⚠️ Pour Claude Code

- **Toujours visiter le site** avant de répondre aux questions.
- Ne jamais deviner depuis le nom de domaine.
- Si un site est ambigu → demander à J avant de trancher.
- **Ne pas modifier les sous-types** sans validation explicite par J.
