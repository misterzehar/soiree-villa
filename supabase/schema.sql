-- ─── Soirée Villa — Schéma Supabase ──────────────────────────────────────────
-- Exécuter dans Supabase > SQL Editor
-- Semaine 1 : table waitlist
-- Semaine 2 : table onboarding_responses
-- Semaine 3 : tables experiences + registrations (voir docs/04_DATA_MODEL.md)

-- ─── Waitlist ────────────────────────────────────────────────────────────────

create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now()
);

-- Index sur l'email pour les lookups rapides
create index if not exists waitlist_email_idx on waitlist(email);

-- RLS (Row Level Security)
alter table waitlist enable row level security;

-- Personne ne peut lire la waitlist (sauf service_role utilisé côté serveur)
-- INSERT autorisé en anon pour le form public
create policy "waitlist_insert_anon"
  on waitlist for insert
  to anon
  with check (true);

-- ─── Onboarding Responses ────────────────────────────────────────────────────

create table if not exists onboarding_responses (
  id               uuid primary key default gen_random_uuid(),
  session_id       text not null,
  answers          jsonb not null,          -- [{ q: 1, choice: 'A' }, ...]
  computed_profile text not null,           -- l'un des 6 profils
  axes_scores      jsonb not null,          -- { energy: +3, structure: -1, ... }
  created_at       timestamptz default now()
);

create index if not exists onboarding_responses_session_idx on onboarding_responses(session_id);

alter table onboarding_responses enable row level security;

-- INSERT autorisé en anon (server action utilise service_role, mais on autorise anon aussi)
create policy "onboarding_insert_anon"
  on onboarding_responses for insert
  to anon
  with check (true);

-- ─── Experiences ─────────────────────────────────────────────────────────────

create table if not exists experiences (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text not null,
  menu_social         jsonb not null,           -- { entree, plat, dessert } — 3 actes sociaux
  venue_name          text not null,
  venue_ambiance      text not null,
  date                timestamptz not null,
  duration_minutes    integer not null,
  pricing_tiers       jsonb not null,           -- [{ id, label, quantity, price_cents }, ...]
  capacity_max        integer not null,          -- doit égaler la somme des quantity des paliers
  capacity_current    integer not null default 0,
  cover_image_url     text,
  compatible_profiles text[] not null,           -- ex: ['explorer_festif', 'connecteur_social']
  organizer_name      text not null,
  organizer_bio       text,
  status              text not null default 'published', -- 'draft' | 'published' | 'sold_out' | 'past'
  created_at          timestamptz default now()
);

create index if not exists experiences_date_idx    on experiences(date);
create index if not exists experiences_status_idx  on experiences(status);

alter table experiences enable row level security;

-- Lecture publique des expériences publiées
create policy "experiences_select_published"
  on experiences for select
  to anon
  using (status = 'published');

-- ─── Registrations ───────────────────────────────────────────────────────────

create table if not exists registrations (
  id                       uuid primary key default gen_random_uuid(),
  experience_id            uuid not null references experiences(id),
  participant_first_name   text not null,
  participant_last_name    text not null,
  participant_email        text not null,
  participant_profile_id   text not null,       -- l'un des 6 profils
  tier_id                  text not null,        -- 'early' | 'standard' | 'last' — palier au moment de l'achat
  charter_accepted_at      timestamptz not null, -- preuve d'acceptation de la charte participant
  stripe_session_id        text,
  payment_status           text not null default 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  amount_paid_cents        integer,
  created_at               timestamptz default now()
);

create index if not exists registrations_experience_idx on registrations(experience_id);
create index if not exists registrations_email_idx      on registrations(participant_email);

alter table registrations enable row level security;
-- Aucune lecture publique — accès via service_role uniquement (webhooks, admin)
