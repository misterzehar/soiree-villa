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
