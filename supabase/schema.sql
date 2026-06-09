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

-- ─── Phase 1 — Auth + comptes persistants ────────────────────────────────────

-- Table profiles : étend auth.users avec le rôle et le profil social
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null default 'participant', -- 'participant' | 'organisateur' | 'lieu' | 'fournisseur'
  display_name    text,
  social_profile_id text,                             -- copie du sv_profile cookie à la création
  avatar_url      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table profiles enable row level security;

-- Chaque utilisateur peut lire et modifier uniquement son propre profil
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- Trigger : crée automatiquement un profil public à la création d'un compte auth
create or replace function handle_new_user()
  returns trigger
  language plpgsql
  security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'participant'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Trigger : backfill user_id sur les registrations quand un compte est créé
-- avec un email qui correspond à des inscriptions existantes
create or replace function backfill_registration_user_id()
  returns trigger
  language plpgsql
  security definer set search_path = public
as $$
begin
  update public.registrations
  set user_id = new.id
  where participant_email = new.email
    and user_id is null;
  return new;
end;
$$;

create or replace trigger on_auth_user_backfill_registrations
  after insert on auth.users
  for each row execute procedure backfill_registration_user_id();

-- Colonne user_id sur registrations (nullable — les inscriptions MVP existantes restent valides)
alter table registrations
  add column if not exists user_id uuid references auth.users(id);

create index if not exists registrations_user_id_idx on registrations(user_id);

-- Un utilisateur authentifié peut lire ses propres inscriptions
create policy "registrations_select_own"
  on registrations for select
  to authenticated
  using (user_id = auth.uid());

-- ─── Fonctions utilitaires ────────────────────────────────────────────────────

-- Incrément atomique de capacity_current (évite les race conditions webhook)
create or replace function increment_experience_capacity(exp_id uuid)
  returns void
  language sql
  security definer
as $$
  update experiences
  set capacity_current = capacity_current + 1
  where id = exp_id;
$$;

-- ─── Phase 2 — Espace organisateur ────────────────────────────────────────────

create table if not exists organizers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  display_name    text not null,
  bio             text,
  photo_url       text,
  organizer_type  text not null default 'amateur',  -- 'amateur' | 'pro'
  city            text not null default 'Nice',
  commission_rate numeric(4,2) not null default 0.15,
  is_approved     boolean not null default false,
  created_at      timestamptz default now()
);

alter table organizers enable row level security;

create policy "organizers_select_own"
  on organizers for select
  to authenticated
  using (user_id = auth.uid());

create policy "organizers_update_own"
  on organizers for update
  to authenticated
  using (user_id = auth.uid());

-- organizer_id nullable sur experiences (les expériences pilotes MVP restent sans organizer)
alter table experiences
  add column if not exists organizer_id uuid references organizers(id);

create index if not exists experiences_organizer_idx on experiences(organizer_id);

-- Un organisateur peut voir toutes ses expériences (y compris draft)
create policy "experiences_select_own_organizer"
  on experiences for select
  to authenticated
  using (
    organizer_id in (select id from organizers where user_id = auth.uid())
  );

-- Un organisateur peut créer des expériences
create policy "experiences_insert_organizer"
  on experiences for insert
  to authenticated
  with check (
    organizer_id in (select id from organizers where user_id = auth.uid())
  );

-- Un organisateur peut modifier ses expériences
create policy "experiences_update_organizer"
  on experiences for update
  to authenticated
  using (
    organizer_id in (select id from organizers where user_id = auth.uid())
  );

-- Commission plateforme (15%) stockée au moment du paiement Stripe
alter table registrations
  add column if not exists platform_fee_cents integer;

-- Check-in le jour J
alter table registrations
  add column if not exists checked_in boolean not null default false;

alter table registrations
  add column if not exists checked_in_at timestamptz;

-- Un organisateur peut lire les inscriptions de ses expériences
create policy "registrations_select_organizer"
  on registrations for select
  to authenticated
  using (
    experience_id in (
      select e.id from experiences e
      join organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );

-- Un organisateur peut mettre à jour checked_in sur ses inscriptions
create policy "registrations_update_organizer"
  on registrations for update
  to authenticated
  using (
    experience_id in (
      select e.id from experiences e
      join organizers o on o.id = e.organizer_id
      where o.user_id = auth.uid()
    )
  );
