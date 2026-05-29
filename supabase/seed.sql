-- ─── Soirée Villa — Seed expériences pilotes ─────────────────────────────────
-- Exécuter APRÈS schema.sql dans Supabase > SQL Editor
-- Dates fictives mai-juillet 2026 — à modifier avant publication

insert into experiences (
  title, description, menu_social,
  venue_name, venue_ambiance,
  date, duration_minutes,
  pricing_tiers, capacity_max, capacity_current,
  cover_image_url,
  compatible_profiles,
  organizer_name, organizer_bio,
  status
) values

-- ─── 1. Le Mystère de l'Observatoire ─────────────────────────────────────────
(
  'Le Mystère de l''Observatoire',
  'Une nuit. Un lieu unique : l''Observatoire de Nice. Un mystère à résoudre en équipe, mais avec une règle : chacun de vous a un rôle secret, attribué la veille par email. Acteurs, indices cachés, scénographie cinéma. À la fin, le mystère se résout — et vous repartez avec un souvenir qui mettra des semaines à se ranger dans votre tête. Tenue chic exigée.',
  '{
    "entree": {
      "phase": "Comprendre",
      "label": "Le briefing du Détective",
      "description": "Accueil champagne, distribution des rôles secrets, tour de table énigmatique.",
      "duration_minutes": 30
    },
    "plat": {
      "phase": "Vivre",
      "label": "L''enquête grandeur nature",
      "description": "Fouilles, interrogatoires d''acteurs, alliances à former, traîtres à débusquer.",
      "duration_minutes": 120
    },
    "dessert": {
      "phase": "Oser",
      "label": "La révélation",
      "description": "Les masques tombent, débrief autour d''un dernier verre.",
      "duration_minutes": 30
    }
  }',
  'Observatoire de Nice — via L''Événement Clef',
  'Lieu unique, nuit étoilée, ambiance mystérieuse et classe. Tenue chic exigée.',
  '2026-06-14 20:00:00+02',
  180,
  '[
    {"id": "early",    "label": "Early bird",  "quantity": 4, "price_cents": 6500},
    {"id": "standard", "label": "Standard",    "quantity": 6, "price_cents": 8000},
    {"id": "last",     "label": "Last chance", "quantity": 2, "price_cents": 9500}
  ]',
  12, 0,
  null,
  array['cerebrale_curieux', 'observateur_profond', 'connecteur_social'],
  'Soirée Villa',
  'J, hôte et maître de cérémonie, accompagné de 2 comédiens professionnels.',
  'published'
),

-- ─── 2. Blind Test au Sommet ──────────────────────────────────────────────────
(
  'Blind Test au Sommet',
  'Une soirée musicale comme tu n''en as jamais fait. Blind test orchestré par un DJ pro, 5 manches d''intensité croissante, des défis bonus entre les manches, et le bar à bières en libre-service. Tu repars avec des morceaux à réécouter, des nouveaux amis dans le téléphone, et la voix cassée.',
  '{
    "entree": {
      "phase": "Comprendre",
      "label": "Le warm-up vocal",
      "description": "Accueil avec premier verre, formation des 3 équipes par tirage — et non par affinité.",
      "duration_minutes": 25
    },
    "plat": {
      "phase": "Vivre",
      "label": "Les 5 manches",
      "description": "Années 80, 90, 2000, 2010, 2020. Buzzers, déguisements, défis de groupe entre les manches.",
      "duration_minutes": 95
    },
    "dessert": {
      "phase": "Oser",
      "label": "L''after silence-disco",
      "description": "Casques sans-fil, la team gagnante choisit la playlist finale.",
      "duration_minutes": 30
    }
  }',
  'Hominum Games Nice',
  'Bar + arène jeux, ambiance festive et lumières tamisées.',
  '2026-05-31 20:30:00+02',
  150,
  '[
    {"id": "early",    "label": "Early bird",  "quantity": 5, "price_cents": 3000},
    {"id": "standard", "label": "Standard",    "quantity": 7, "price_cents": 3800},
    {"id": "last",     "label": "Last chance", "quantity": 3, "price_cents": 4500}
  ]',
  15, 0,
  null,
  array['explorer_festif', 'connecteur_social', 'creatif_libre'],
  'Soirée Villa',
  'J en host + 1 DJ pro local. Ambiance garantie ou remboursé.',
  'published'
),

-- ─── 3. Cercle des Audacieux ──────────────────────────────────────────────────
(
  'Cercle des Audacieux',
  '8 personnes, un salon avec cheminée, 3 heures. On joue à des jeux qui forcent à se révéler — mais en douceur. Aucune compétition, beaucoup de fou rire. Tu repars avec l''impression rare d''avoir été vraiment écouté. Soirée animée par un facilitateur formé à l''écoute active.',
  '{
    "entree": {
      "phase": "Comprendre",
      "label": "Le tour de la pièce",
      "description": "Apéro lent, une question à tour de rôle : la dernière fois que tu as été surpris par toi-même.",
      "duration_minutes": 40
    },
    "plat": {
      "phase": "Vivre",
      "label": "Le jeu des photos partagées",
      "description": "Chacun reçoit une photo, doit trouver son binôme sans parler. Puis échanges en duo de 10 min sur ses souvenirs.",
      "duration_minutes": 90
    },
    "dessert": {
      "phase": "Oser",
      "label": "La lettre à un inconnu",
      "description": "Chacun écrit anonymement à l''un des autres. Lecture collective à voix haute. Verre offert.",
      "duration_minutes": 50
    }
  }',
  'Salon privé — Tiers-lieu cosy à Nice',
  'Salon avec cheminée, éclairage chaleureux, intimiste et bienveillant.',
  '2026-06-07 19:30:00+02',
  180,
  '[
    {"id": "early",    "label": "Early bird",  "quantity": 3, "price_cents": 3500},
    {"id": "standard", "label": "Standard",    "quantity": 4, "price_cents": 4500},
    {"id": "last",     "label": "Last chance", "quantity": 1, "price_cents": 5500}
  ]',
  8, 0,
  null,
  array['empathique_calme', 'observateur_profond', 'creatif_libre'],
  'Soirée Villa',
  'Facilitateur formé à la communication non-violente (CNV). Espace sûr garanti.',
  'published'
),

-- ─── 4. La Nuit Fort Boyard ───────────────────────────────────────────────────
(
  'La Nuit Fort Boyard',
  'Le complexe Juma à Mougins. 3 300 m² rien que pour vous. Action game type Fort Boyard sur 500 m² avec 20 rooms. Puis bowling, fléchettes, simulateurs voiture, karaoké. Restau + bar à l''anglaise sur place — vous ne quittez pas le lieu de la soirée.',
  '{
    "entree": {
      "phase": "Comprendre",
      "label": "Le briefing capitaines",
      "description": "Accueil au bar à l''anglaise, formation de 4 équipes, choix des capitaines, dégustation cocktails maison.",
      "duration_minutes": 45
    },
    "plat": {
      "phase": "Vivre",
      "label": "Les 20 rooms",
      "description": "3 min par room, défis physiques, logiques et d''adresse. Score en direct, classement actualisé entre chaque round.",
      "duration_minutes": 120
    },
    "dessert": {
      "phase": "Oser",
      "label": "Karaoké et débrief",
      "description": "L''équipe gagnante choisit le 1er morceau. Dîner servi en salle, on rejoue les 20 rooms en mode rires.",
      "duration_minutes": 75
    }
  }',
  'Juma — Mougins (Côte d''Azur)',
  '3 300 m² dédiés à l''action : arène Fort Boyard, bowling, simulateurs, karaoké, restau.',
  '2026-06-21 19:00:00+02',
  240,
  '[
    {"id": "early",    "label": "Early bird",  "quantity": 6,  "price_cents": 5500},
    {"id": "standard", "label": "Standard",    "quantity": 10, "price_cents": 7000},
    {"id": "last",     "label": "Last chance", "quantity": 4,  "price_cents": 8500}
  ]',
  20, 0,
  null,
  array['explorer_festif', 'connecteur_social', 'creatif_libre', 'cerebrale_curieux'],
  'Soirée Villa',
  'J en host + staff Juma. Soirée idéale pour groupes qui veulent enfin sortir d''un dîner banal.',
  'published'
),

-- ─── 5. Sens-Sation : l'Expérience Aveugle ───────────────────────────────────
(
  'Sens-Sation : l''Expérience Aveugle',
  'Sensas Nice — parcours sensoriel dans le noir presque total. Vos 5 sens en alerte, hors la vue. Défis sensoriels en équipe, alliés et sceptiques se révèlent, fous rires garantis. À la fin, vous récoltez des amulettes converties en dons à une association caritative locale choisie collectivement.',
  '{
    "entree": {
      "phase": "Comprendre",
      "label": "Le rituel d''entrée",
      "description": "Explication des règles, vote à main levée sur l''association bénéficiaire des dons parmi 3 choix présentés.",
      "duration_minutes": 25
    },
    "plat": {
      "phase": "Vivre",
      "label": "Le parcours",
      "description": "Défis sensoriels — toucher, sentir, écouter, goûter — en équipe. Amulettes à collecter, missions secrètes individuelles distribuées en début de parcours.",
      "duration_minutes": 90
    },
    "dessert": {
      "phase": "Oser",
      "label": "La remise des amulettes",
      "description": "Bilan, partage de ressentis dans un cercle final, transformation des amulettes en dons à l''association choisie. Verre offert.",
      "duration_minutes": 35
    }
  }',
  'Sensas Nice',
  'Parcours sensoriel immersif dans le noir. Lieu atypique, émotion garantie.',
  '2026-07-05 18:30:00+02',
  150,
  '[
    {"id": "early",    "label": "Early bird",  "quantity": 4, "price_cents": 4000},
    {"id": "standard", "label": "Standard",    "quantity": 7, "price_cents": 5000},
    {"id": "last",     "label": "Last chance", "quantity": 3, "price_cents": 6000}
  ]',
  14, 0,
  null,
  array['empathique_calme', 'cerebrale_curieux', 'observateur_profond', 'creatif_libre'],
  'Soirée Villa',
  'Staff Sensas + J en facilitateur du cercle final. Don caritatif collectif en clôture.',
  'published'
);
