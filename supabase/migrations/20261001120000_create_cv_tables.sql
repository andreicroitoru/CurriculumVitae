-- CV schema
-- Everyone (anon) can read, only users listed in admin_users can write.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Users can only check whether they themselves are an admin
create policy "Users can see their own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- security definer so the policies below can call it without exposing admin_users
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger for updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profile (exactly one row)
-- ---------------------------------------------------------------------------

create table public.profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null,
  avatar_initials text not null,
  linkedin_url text,
  location_ro text,
  location_en text,
  current_job_title_ro text,
  current_job_title_en text,
  current_company text,
  about_ro text,
  about_en text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Work experience
-- ---------------------------------------------------------------------------

create table public.work_experience (
  id bigint generated always as identity primary key,
  job_title_ro text not null,
  job_title_en text not null,
  company_name text not null,
  location_ro text,
  location_en text,
  start_date date not null,
  end_date date, -- null = current job
  logo_initials text,
  logo_color text default '#444444',
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  constraint work_experience_dates_check check (end_date is null or end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- Education
-- ---------------------------------------------------------------------------

create table public.education (
  id bigint generated always as identity primary key,
  school_name_ro text not null,
  school_name_en text not null,
  degree_name_ro text,
  degree_name_en text,
  start_year int not null,
  end_year int,
  logo_initials text,
  logo_color text default '#444444',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Certifications
-- ---------------------------------------------------------------------------

create table public.certifications (
  id bigint generated always as identity primary key,
  certificate_name text not null,
  skill_level smallint not null default 1 check (skill_level between 1 and 3), -- 1 Basic, 2 Intermediate, 3 Advanced
  issued_by text not null,
  issue_date date,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Skills
-- ---------------------------------------------------------------------------

create table public.skills (
  id bigint generated always as identity primary key,
  name_ro text not null,
  name_en text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS + triggers for all CV tables (same rules everywhere)
-- ---------------------------------------------------------------------------

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profile', 'work_experience', 'education', 'certifications', 'skills']
  loop
    execute format('alter table public.%I enable row level security', table_name);

    execute format(
      'create policy "Anyone can read %1$s" on public.%1$I for select to anon, authenticated using (true)',
      table_name
    );
    execute format(
      'create policy "Admins can insert %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))',
      table_name
    );
    execute format(
      'create policy "Admins can update %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      table_name
    );
    execute format(
      'create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()))',
      table_name
    );

    execute format(
      'create trigger set_%1$s_updated_at before update on public.%1$I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;
