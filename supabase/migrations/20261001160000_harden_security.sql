-- Security hardening, following the Supabase Postgres best practices:
--   1. is_admin() moves from public (callable through the REST API) to a private schema
--   2. auth.uid() wrapped in (select ...) so it's evaluated once per query, not per row
--   3. CHECK constraints so the admin form can't save values that would break the page
--
-- Replaces the earlier restrict_is_admin migration; safe to run whether or not that one was applied.

-- ---------------------------------------------------------------------------
-- 1. private.is_admin()
-- ---------------------------------------------------------------------------

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Point every write policy at the private function
do $$
declare
  table_name text;
begin
  foreach table_name in array array['profile', 'work_experience', 'education', 'certifications', 'skills']
  loop
    execute format('drop policy if exists "Admins can insert %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "Admins can update %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "Admins can delete %1$s" on public.%1$I', table_name);

    execute format(
      'create policy "Admins can insert %1$s" on public.%1$I for insert to authenticated with check ((select private.is_admin()))',
      table_name
    );
    execute format(
      'create policy "Admins can update %1$s" on public.%1$I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name
    );
    execute format(
      'create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using ((select private.is_admin()))',
      table_name
    );
  end loop;
end;
$$;

-- Nothing uses the public one anymore (admin.html now reads admin_users directly)
drop function if exists public.is_admin();

-- ---------------------------------------------------------------------------
-- 2. admin_users policy: evaluate auth.uid() once
-- ---------------------------------------------------------------------------

drop policy if exists "Users can see their own admin row" on public.admin_users;

create policy "Users can see their own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. Constraints - these values end up inside HTML attributes on the site
-- ---------------------------------------------------------------------------

alter table public.profile
  add constraint profile_linkedin_url_check check (linkedin_url is null or linkedin_url ~ '^https://');

alter table public.work_experience
  add constraint work_experience_logo_color_check check (logo_color ~ '^#[0-9a-fA-F]{6}$');

alter table public.education
  add constraint education_logo_color_check check (logo_color ~ '^#[0-9a-fA-F]{6}$'),
  add constraint education_years_check check (end_year is null or end_year >= start_year);
