-- ─── Soirée Villa — Schéma Supabase ──────────────────────────────────────────
-- Exécuter dans Supabase > SQL Editor
-- Semaine 1 : table waitlist uniquement
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
