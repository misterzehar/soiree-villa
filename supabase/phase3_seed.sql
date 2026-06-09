-- ─── Phase 3 — Seed : Lieux et Fournisseurs ─────────────────────────────────
-- Exécuter dans Supabase > SQL Editor après phase3_schema (ou schema.sql complet)
-- Tous les lieux/fournisseurs ci-dessous sont is_approved=true, claimed_by_user_id=null

-- ─── Lieux (segment 3 + quelques segment 4) ──────────────────────────────────

INSERT INTO lieux (name, slug, address, city, capacity, ambiance, lieu_type, photo_url, axes_scores, website_url, is_approved) VALUES

-- Bars & rooftops
('Le Bar des Oiseaux',         'le-bar-des-oiseaux',         '5 place Charles-Félix, Nice',          'Nice', 40,  'Bar jazz historique au pied du vieux-Nice, chaleureux et intimiste',              'bar',       null, '{"energy": -1, "structure": -1, "depth": 1, "sociality": -1}', 'https://lebardsoiseaux.fr',    true),
('Rooftop Boscolo',            'rooftop-boscolo',             '107 promenade des Anglais, Nice',      'Nice', 60,  'Rooftop hôtel 5★, vue panoramique mer, ambiance lounge',                           'rooftop',   null, '{"energy": 1,  "structure": -1, "depth": -1, "sociality": 1}', null,                           true),
('Hank Bar',                   'hank-bar',                    '12 rue de la Préfecture, Nice',        'Nice', 50,  'Bar à cocktails tendance, musique indie, clientèle 25-40 ans',                     'bar',       null, '{"energy": 1,  "structure": -1, "depth": -1, "sociality": 1}', null,                           true),
('The Snug Irish Pub',         'the-snug-irish-pub',          '22 rue Alphonse Karr, Nice',           'Nice', 70,  'Pub irlandais authentique, ambiance festive et conviviale',                        'bar',       null, '{"energy": 1,  "structure": -1, "depth": -1, "sociality": 1}', null,                           true),

-- Restaurants avec espaces privatisables
('Boccaccio',                  'boccaccio',                   '7 rue Masséna, Nice',                  'Nice', 80,  'Brasserie emblématique Nice, terrasse et salle rétro chic',                        'restaurant', null, '{"energy": -1, "structure": 1,  "depth": -1, "sociality": 1}', 'https://leboccaccio.fr',      true),
('La Petite Maison',           'la-petite-maison',            '11 rue Saint-François-de-Paule, Nice', 'Nice', 120, 'Institution niçoise, cuisine méditerranéenne, cadre élégant',                      'restaurant', null, '{"energy": -1, "structure": 1,  "depth": 1,  "sociality": 1}', 'https://lapetitemaison.fr',   true),

-- Salles et ateliers
('Dock Loft',                  'dock-loft',                   '23 avenue de la Gare, Nice',           'Nice', 100, 'Loft industriel modulable, plafonds 5m, lumière naturelle',                        'salle',     null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', null,                           true),
('Espace Magnan',              'espace-magnan',               '31 rue Louis de Coppet, Nice',         'Nice', 200, 'Salle polyvalente municipale, grande capacité, tout équipé',                       'salle',     null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', null,                           true),
('Villa Thiole — Salle Acropolis', 'villa-thiole-salle-acropolis', '20 bd Carabacel, Nice',           'Nice', 50,  'Salle historique dans parc verdoyant, idéale ateliers et séminaires',              'salle',     null, '{"energy": -1, "structure": 1,  "depth": 1,  "sociality": -1}', null,                           true),
('Atelier Wabi',               'atelier-wabi',                '17 rue Paganini, Nice',                'Nice', 20,  'Atelier poterie/créa, ambiance zen, groupes intimistes uniquement',                'atelier',   null, '{"energy": -1, "structure": 1,  "depth": 1,  "sociality": -1}', null,                           true),
('Coworking La Corderie',      'coworking-la-corderie',       'Nice',                                 'Nice', 30,  'Espace coworking reconverti, esprit startup, lumière naturelle',                   'salle',     null, '{"energy": 1,  "structure": -1, "depth": -1, "sociality": 1}', null,                           true),

-- Rooftop / plein air
('Terrasse du Negresco',       'terrasse-du-negresco',        '37 promenade des Anglais, Nice',       'Nice', 80,  'Terrasse iconique palace hôtel Negresco, vue mer exceptionnelle',                  'rooftop',   null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', 'https://lenegresco.com',      true),
('Jardins de Cimiez',          'jardins-de-cimiez',           'Avenue des Arènes, Nice',              'Nice', 150, 'Jardins historiques sur colline, vue Nice, idéal pique-nique & plein air',          'plein_air', null, '{"energy": -1, "structure": -1, "depth": -1, "sociality": 1}', null,                           true),
('Promenade du Paillon',       'promenade-du-paillon',        'Nice',                                 'Nice', 200, 'Parc urbain moderne au cœur de Nice, grande pelouse, idéal events extérieurs',     'plein_air', null, '{"energy": 1,  "structure": -1, "depth": -1, "sociality": 1}', null,                           true),
('Vieux-Port de Nice',         'vieux-port-de-nice',          'Quai des Docks, Nice',                 'Nice', 100, 'Quai animé face aux bateaux, ambiance méditerranéenne authentique',                'plein_air', null, '{"energy": 1,  "structure": -1, "depth": -1, "sociality": 1}', null,                           true)

ON CONFLICT (slug) DO NOTHING;


-- ─── Fournisseurs animation (agences événementielles) ──────────────────────────
-- Segment 4 — is_approved=true, claimed_by_user_id=null

INSERT INTO fournisseurs (name, slug, category, city, description, photo_url, axes_scores, price_range, website_url, is_approved) VALUES

('L''Évènement Clef',         'l-evenement-clef',         'animation', 'Nice', 'Agence événementielle niçoise spécialisée dans la création de soirées sur-mesure : team-building, afterworks, anniversaires entreprises.',               null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '800–2500 € / événement',  'https://levenementclef.com',   true),
('Madyoui Événements',        'madyoui-evenements',       'animation', 'Nice', 'Agence Nice-Côte d''Azur spécialisée séminaires, incentives et soirées festives. Forte expérience hôtellerie de luxe.',                                   null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', '1000–3000 € / événement', 'https://madyoui.fr',           true),
('Nice Events Riviera',       'nice-events-riviera',      'animation', 'Nice', 'Agence locale créations d''événements sur la Côte d''Azur. Spécialité : soirées thématiques, quiz interactifs, activités brise-glace.',                   null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '500–1500 € / événement',  null,                           true),
('Azur Team Building',        'azur-team-building',       'animation', 'Nice', 'Expert team-building et cohésion d''équipe sur la Riviera. Activités outdoor, jeux de piste, escape games urbains à Nice.',                             null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '400–1200 € / groupe',     null,                           true),
('Éclat Events',              'eclat-events',             'animation', 'Nice', 'Production événementielle haut de gamme : lancement de produit, soirée de gala, événements corporate sur la Côte d''Azur.',                             null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', '1500–5000 € / événement', null,                           true),
('Fiesta Latina Nice',        'fiesta-latina-nice',       'animation', 'Nice', 'Animation soirées latines : cours de salsa, bachata, merengue. Ambiance festive garantie, tous niveaux acceptés.',                                      null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '200–600 € / soirée',      null,                           true),
('Comedy & Co',               'comedy-and-co',            'animation', 'Nice', 'Spectacle d''improvisation et stand-up intégré à vos événements. Format participatif, idéal brise-glace et cohésion.',                                   null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', '300–800 € / spectacle',   null,                           true),
('Quiz Factory',              'quiz-factory',             'animation', 'Nice', 'Organisation de quiz et blind tests thématiques pour soirées privées, événements d''entreprise, afterworks. Format clé en main.',                         null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '250–700 € / événement',   null,                           true),
('Game Night Riviera',        'game-night-riviera',       'animation', 'Nice', 'Soirées jeux de société animées pour adultes : murder party, jeux d''évasion en salle, quiz géants. Spécialiste groupes 10–40 pers.',                    null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', '300–900 € / soirée',      null,                           true),
('Côte d''Azur Impro',        'cote-d-azur-impro',        'animation', 'Nice', 'Troupe d''improvisation niçoise proposant des formats sur mesure : spectacle d''impro, ateliers participatifs, team-building créatif.',                  null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', '400–1000 € / prestation', null,                           true),
('Escape & Play',             'escape-and-play',          'animation', 'Nice', 'Conception et animation d''escape games privatifs et jeux de piste urbains à Nice et alentours. Adapté groupes de 10 à 50 pers.',                        null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '350–900 € / groupe',      null,                           true),
('So Events',                 'so-events',                'animation', 'Nice', 'Agence événementielle créative : concept soirées originaux, animations participatives, expériences immersives sur la Côte d''Azur.',                      null, '{"energy": 1,  "structure": 1,  "depth": 1,  "sociality": 1}', '600–2000 € / événement',  null,                           true),
('Nice Party Planners',       'nice-party-planners',      'animation', 'Nice', 'Organisation complète de soirées privées et d''entreprise : thème, décoration, animation, traiteur. Tout inclus clé en main.',                           null, '{"energy": 1,  "structure": 1,  "depth": -1, "sociality": 1}', '800–2500 € / événement',  null,                           true)

ON CONFLICT (slug) DO NOTHING;
