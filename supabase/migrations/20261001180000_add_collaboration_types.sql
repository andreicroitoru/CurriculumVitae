-- Collaboration types: a small lookup table (nomenclator) for how a person (PF) works with a company,
-- following Romanian law: CIM full-time / part-time, PFA, drepturi de autor, mandat etc.
-- work_experience.collaboration_type_id points at it; editable from its own tab in admin.html.
--
-- Safe to run more than once.

create table if not exists public.collaboration_types (
  id bigint generated always as identity primary key,
  name_ro text not null,
  name_en text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  constraint collaboration_types_name_ro_key unique (name_ro)
);

alter table public.collaboration_types enable row level security;

-- Same rules as every other CV table: anyone reads, only admins write
drop policy if exists "Anyone can read collaboration_types" on public.collaboration_types;
drop policy if exists "Admins can insert collaboration_types" on public.collaboration_types;
drop policy if exists "Admins can update collaboration_types" on public.collaboration_types;
drop policy if exists "Admins can delete collaboration_types" on public.collaboration_types;

create policy "Anyone can read collaboration_types" on public.collaboration_types
  for select to anon, authenticated using (true);
create policy "Admins can insert collaboration_types" on public.collaboration_types
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can update collaboration_types" on public.collaboration_types
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete collaboration_types" on public.collaboration_types
  for delete to authenticated using ((select private.is_admin()));

drop trigger if exists set_collaboration_types_updated_at on public.collaboration_types;
create trigger set_collaboration_types_updated_at
  before update on public.collaboration_types
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Link from work_experience. Deleting a type only clears it on the jobs, never deletes a job.
-- ---------------------------------------------------------------------------

alter table public.work_experience
  add column if not exists collaboration_type_id bigint
    references public.collaboration_types (id) on delete set null;

-- Postgres doesn't index foreign keys on its own
create index if not exists work_experience_collaboration_type_id_idx
  on public.work_experience (collaboration_type_id);

-- ---------------------------------------------------------------------------
-- Starting list. EN names follow LinkedIn's "employment type" wording.
-- ---------------------------------------------------------------------------

insert into public.collaboration_types (name_ro, name_en, sort_order)
values
  ('Contract individual de muncă - normă întreagă', 'Full-time', 1),
  ('Contract individual de muncă - timp parțial', 'Part-time', 2),
  ('Contract individual de muncă - durată determinată', 'Fixed-term contract', 3),
  ('PFA - prestări servicii', 'Freelance (PFA)', 4),
  ('Prestări servicii prin firma proprie (SRL / II)', 'Contractor (B2B)', 5),
  ('Contract de drepturi de autor', 'Copyright agreement', 6),
  ('Contract de mandat', 'Management agreement', 7),
  ('Convenție civilă / contract de colaborare', 'Collaboration agreement', 8),
  ('Stagiu / internship', 'Internship', 9),
  ('Contract de ucenicie', 'Apprenticeship', 10),
  ('Contract de voluntariat', 'Volunteer', 11),
  ('Zilier', 'Day labour', 12)
on conflict (name_ro) do nothing;
