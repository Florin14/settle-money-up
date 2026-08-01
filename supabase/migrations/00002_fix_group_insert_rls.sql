-- ============================================================================
-- Migration 00002 — fix "new row violates row-level security policy for groups"
--
-- Cause: the app inserts a group with `.insert(...).select()`. Postgres checks
-- the SELECT policy on the RETURNING row DURING the insert, but membership is
-- added by an AFTER INSERT trigger — which hasn't run yet at that point, so
-- `is_group_member(id)` is still false and the whole statement is rejected.
--
-- Fix: the creator is always allowed to see their own group directly.
-- Also backfills `profiles` for any auth user created before migration 00001
-- (the auto-profile trigger only fires for signups made after it was installed).
-- ============================================================================

drop policy if exists "groups_select" on public.groups;

create policy "groups_select" on public.groups
  for select to authenticated
  using (created_by = (select auth.uid()) or public.is_group_member(id));

insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;
