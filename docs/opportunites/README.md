# 📁 Dossier `opportunites/` — Banque de sites & classification

> Ce sous-dossier regroupe **tous les documents liés à la banque de sites / lieux / prestataires** que les organisateurs Soirée Villa peuvent utiliser comme matière première.

---

## 📂 Les 3 fichiers du dossier

| Fichier | Rôle |
|---------|------|
| **`01_BANQUE_OPPORTUNITES.md`** | La banque complète : tous les sites + leurs attributs (ville, statut MVP, description, idées d'activation, sources d'ingestion future). C'est le fichier le plus riche. |
| **`02_ARBRE_DECISIONNEL.md`** | La **méthode** : arbre à 3 questions oui/non pour classer un site dans un des 4 segments. **À utiliser à chaque nouveau site ajouté.** |
| **`03_CLASSIFICATION_SITES.md`** | Le **résultat** : tous les sites classés via l'arbre, regroupés par segment + sous-type. |

---

## 🔄 Workflow : ajouter de nouveaux sites

À chaque fois que J donne **un ou plusieurs nouveaux sites** à intégrer, suivre ces 6 étapes **dans l'ordre** :

### 1. Visiter chaque site

- Utiliser **WebFetch** ou **WebSearch** pour récupérer la description réelle.
- **JAMAIS deviner depuis le nom de domaine.** C'est l'erreur classique.
- Si l'info est introuvable malgré la recherche → marquer le site comme **"À vérifier"** et demander à J en 1 ligne ce que c'est.

### 2. Passer chaque site dans l'arbre décisionnel

Aller dans `02_ARBRE_DECISIONNEL.md` et répondre :

- **Q1** — Est-ce lié au divertissement ou aux loisirs ?
  - NON → **SERVICES & BIEN-ÊTRE**
  - OUI → Q2
- **Q2** — Faut-il se déplacer physiquement ?
  - NON → **DIGITAL & À DOMICILE**
  - OUI → Q3
- **Q3** — Est-ce de l'Action / Sport ?
  - OUI → **IMMERSIF & ACTION**
  - NON → **SORTIES, EVENT & TOURISME**

Puis identifier le **sous-type** (cf. doc 02 pour la liste des sous-types par segment).

### 3. Ajouter le site à `03_CLASSIFICATION_SITES.md`

- L'ajouter dans le **bon segment + bon sous-type** sous forme de bullet `- [Nom](URL)`.
- Mettre à jour le **compteur** en haut du doc (nb sites par segment + total).

### 4. Ajouter le site à `01_BANQUE_OPPORTUNITES.md`

- L'ajouter dans la table correspondante avec ses attributs : **nom, URL, description courte, ville/zone, statut MVP (priorité CdA ou non), source (manuel J ou crawler)**.
- Mettre à jour le **compteur** en haut du doc (total sites, sites CdA, sites à vérifier).

### 5. Sites borderline → demander à J

Si un site est à cheval entre 2 segments / sous-types (ex : produit qui peut être loué OU acheté, lieu mixte action/passif), **noter "borderline"** et **demander à J** avant de trancher. Ne pas inventer.

### 6. Synchronisation finale

- Si J modifie l'arbre (ajoute une question, change un sous-type) → mettre à jour **les 3 fichiers dans le même commit**.
- Toute modification du doc 02 doit déclencher un **re-test** sur les sites déjà classés (test de régression).

---

## 📊 État actuel des compteurs

| Indicateur | Valeur |
|------------|--------|
| Total sites référencés | 58 |
| Sites Côte d'Azur (priorité MVP) | 11 |
| Sites "À vérifier" | 0 (intégrés dans la classification Gemini) |
| Dernière mise à jour | 2026-05-06 |

---

## ⚠️ Règles importantes

- **Aucun doublon d'URL.** Vérifier avant ajout.
- **Ne pas modifier l'arbre** (doc 02) sans validation explicite de J.
- **Ne pas inventer un nouveau segment ou sous-type** sans validation explicite de J.
- **Toujours visiter le site** avant catégorisation.
- **Toujours mettre à jour les compteurs** en haut des 3 docs après chaque ajout/suppression.

---

## 🤖 Pour Claude Code (V1+ — ingestion automatique)

Le workflow ci-dessus sera **automatisé en V1+** dans le **Module D / section O — Opportunité** du back-office organisateur (cf. `../10_V1_MODULES.md`) :

- **Crawler** sur sources connues (Eventbrite Nice, Fever, Insta hashtags, Nice Secret, etc.)
- **API tierces** : Google Places, OpenStreetMap, Yelp pour enrichir adresse / photos / capacité
- **Bouton "Suggérer un lieu"** côté participant (avec validation manuelle avant publi)
- **Import lot** depuis Google Sheet ou CSV

L'arbre décisionnel sera implémenté comme une fonction TypeScript qui prend en entrée le contenu scrapé d'une URL et retourne `(segment, sous_type)`.
