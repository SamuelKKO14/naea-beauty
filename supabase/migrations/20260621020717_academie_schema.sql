-- Académie — Brique 1 : schéma de base
-- Tables : formations, modules, lecons, achats, acces (+ RLS).
-- Écritures réservées au service_role (BYPASSRLS) ; aucune policy d'écriture
-- pour anon/authenticated. Idempotent (create ... if not exists / or replace).
--
-- SÉCURITÉ CONTENU PROTÉGÉ :
--   lecons.contenu_url et lecons.contenu_texte ne doivent JAMAIS être renvoyés
--   côté client. La RLS filtre les LIGNES mais pas les COLONNES — on protège donc
--   ces 2 colonnes par des privilèges au niveau colonne (REVOKE + GRANT ciblé).
--   Le contenu protégé sera servi plus tard par une route serveur (service_role)
--   qui vérifie `acces` (ou `est_gratuite = true`).

-- updated_at : fonction réutilisable (réutilise l'existante si déjà présente).
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) formations -------------------------------------------------------------
create table if not exists public.formations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titre text not null,
  sous_titre text,
  description text,
  prix_cents int not null,
  prix_lancement_cents int,
  devise text not null default 'eur',
  statut text not null default 'brouillon'
    check (statut in ('brouillon', 'publie', 'archive')),
  image_couverture_url text,
  teaser_video_url text,
  niveau text,
  duree_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) modules ----------------------------------------------------------------
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references public.formations(id) on delete cascade,
  titre text not null,
  description text,
  ordre int not null,
  created_at timestamptz not null default now()
);

-- 3) lecons -----------------------------------------------------------------
create table if not exists public.lecons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  titre text not null,
  type text not null default 'video' check (type in ('video', 'pdf', 'texte')),
  contenu_url text,      -- protégé : jamais exposé à anon/authenticated
  contenu_texte text,    -- protégé : jamais exposé à anon/authenticated
  duree_minutes int,
  est_gratuite boolean not null default false,
  ordre int not null,
  created_at timestamptz not null default now()
);

-- 4) achats -----------------------------------------------------------------
create table if not exists public.achats (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid references public.formations(id),
  email_client text not null,
  user_id uuid references auth.users(id),
  fournisseur_paiement text,
  transaction_externe_id text,
  montant_cents int not null,
  devise text not null default 'eur',
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'paye', 'rembourse', 'echoue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) acces ------------------------------------------------------------------
create table if not exists public.acces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  formation_id uuid not null references public.formations(id),
  achat_id uuid references public.achats(id),
  actif boolean not null default true,
  date_octroi timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, formation_id)
);

-- Index ---------------------------------------------------------------------
-- NB: formations(slug) est déjà indexé par la contrainte UNIQUE (slug) ;
--     acces(user_id, formation_id) est déjà indexé par la contrainte UNIQUE.
--     On ne crée donc pas d'index redondants pour ces deux-là.
create index if not exists idx_modules_formation_ordre
  on public.modules(formation_id, ordre);
create index if not exists idx_lecons_module_ordre
  on public.lecons(module_id, ordre);
create index if not exists idx_achats_transaction_externe_id
  on public.achats(transaction_externe_id);
create index if not exists idx_achats_user_id
  on public.achats(user_id);

-- Triggers updated_at -------------------------------------------------------
drop trigger if exists set_updated_at on public.formations;
create trigger set_updated_at before update on public.formations
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.achats;
create trigger set_updated_at before update on public.achats
  for each row execute function public.handle_updated_at();

-- RLS -----------------------------------------------------------------------
alter table public.formations enable row level security;
alter table public.modules    enable row level security;
alter table public.lecons     enable row level security;
alter table public.achats     enable row level security;
alter table public.acces      enable row level security;

-- formations : lecture publique uniquement si publiée.
drop policy if exists formations_select_publie on public.formations;
create policy formations_select_publie on public.formations
  for select
  using (statut = 'publie');

-- modules : lecture publique si la formation parente est publiée.
drop policy if exists modules_select_publie on public.modules;
create policy modules_select_publie on public.modules
  for select
  using (
    exists (
      select 1 from public.formations f
      where f.id = modules.formation_id and f.statut = 'publie'
    )
  );

-- lecons : lecture publique si la formation parente est publiée.
-- (Les colonnes contenu_url / contenu_texte restent protégées par les GRANT
--  ci-dessous — la policy n'autorise que des LIGNES, pas toutes les colonnes.)
drop policy if exists lecons_select_publie on public.lecons;
create policy lecons_select_publie on public.lecons
  for select
  using (
    exists (
      select 1
      from public.modules m
      join public.formations f on f.id = m.formation_id
      where m.id = lecons.module_id and f.statut = 'publie'
    )
  );

-- achats : aucun accès anon ; lecture de ses propres achats si connecté.
drop policy if exists achats_select_own on public.achats;
create policy achats_select_own on public.achats
  for select
  using (auth.uid() = user_id);

-- acces : lecture de ses propres accès uniquement.
drop policy if exists acces_select_own on public.acces;
create policy acces_select_own on public.acces
  for select
  using (auth.uid() = user_id);

-- Protection colonnes sensibles de lecons -----------------------------------
-- On retire le SELECT pleine-table à anon/authenticated, puis on ne re-grante
-- que les colonnes non sensibles. contenu_url / contenu_texte ne sont donc
-- jamais lisibles côté client (service_role conserve son accès complet).
revoke select on public.lecons from anon, authenticated;
grant select (
  id, module_id, titre, type, duree_minutes, est_gratuite, ordre, created_at
) on public.lecons to anon, authenticated;
