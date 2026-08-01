-- ============================================================================
-- SettleUp — Expense tracker & bill splitting
-- Migration 00001: schema, constraints, RLS, helper functions, views
-- Run in Supabase SQL Editor, or via `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------

create type public.expense_category as enum (
  'food', 'transport', 'utilities', 'housing', 'entertainment',
  'health', 'shopping', 'travel', 'education', 'other'
);

create type public.split_type as enum ('equal', 'amount', 'percentage');

create type public.group_role as enum ('owner', 'member');

-- ----------------------------------------------------------------------------
-- 2. TABLES
-- ----------------------------------------------------------------------------

-- Mirrors auth.users; auto-populated by trigger below.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) between 1 and 100),
  description text,
  currency    char(3) not null default 'EUR' check (currency = upper(currency)),
  created_by  uuid not null references public.profiles (id),
  created_at  timestamptz not null default now()
);

create table public.group_members (
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       public.group_role not null default 'member',
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- group_id NULL  => personal expense (only payer involved, no splits)
-- group_id set   => group expense (must have splits summing to amount)
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid references public.groups (id) on delete cascade,
  payer_id     uuid not null references public.profiles (id),
  created_by   uuid not null references public.profiles (id),
  description  text not null check (char_length(trim(description)) between 1 and 200),
  amount       numeric(12, 2) not null check (amount > 0),
  currency     char(3) not null default 'EUR' check (currency = upper(currency)),
  category     public.expense_category not null default 'other',
  split_type   public.split_type not null default 'equal',
  expense_date date not null default current_date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- How much each participant owes toward one expense (in the expense currency).
-- share_value stores the original input for 'percentage' (e.g. 33.33) so the
-- UI can re-render the form; 'amount' is always the resolved monetary value.
create table public.expense_splits (
  expense_id  uuid not null references public.expenses (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  amount      numeric(12, 2) not null check (amount >= 0),
  share_value numeric(7, 4),
  primary key (expense_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES (FKs are not auto-indexed in Postgres)
-- ----------------------------------------------------------------------------

create index idx_group_members_user       on public.group_members (user_id);
create index idx_groups_created_by        on public.groups (created_by);
create index idx_expenses_group_date      on public.expenses (group_id, expense_date desc)
  where group_id is not null;
create index idx_expenses_personal        on public.expenses (payer_id, expense_date desc)
  where group_id is null;
create index idx_expenses_payer           on public.expenses (payer_id);
create index idx_expenses_created_by      on public.expenses (created_by);
create index idx_expense_splits_user      on public.expense_splits (user_id);

-- ----------------------------------------------------------------------------
-- 4. HELPER FUNCTIONS (SECURITY DEFINER breaks RLS recursion:
--    a policy on group_members cannot query group_members directly)
-- ----------------------------------------------------------------------------

create or replace function public.is_group_member(_group_id uuid, _user_id uuid default auth.uid())
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = _group_id and user_id = _user_id
  );
$$;

create or replace function public.is_group_owner(_group_id uuid, _user_id uuid default auth.uid())
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = _group_id and user_id = _user_id and role = 'owner'
  );
$$;

-- True when the target profile shares at least one group with the caller.
create or replace function public.shares_group_with(_profile_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members a
    join public.group_members b using (group_id)
    where a.user_id = auth.uid() and b.user_id = _profile_id
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS
-- ----------------------------------------------------------------------------

-- 5a. Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 5b. Auto-add the group creator as its owner (SECURITY DEFINER because the
--     insert policy on group_members requires an existing owner).
create or replace function public.handle_new_group()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_group_created
after insert on public.groups
for each row execute function public.handle_new_group();

-- 5c. Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger trg_expenses_touch before update on public.expenses
for each row execute function public.touch_updated_at();

-- 5d. Integrity: splits of a group expense must (a) sum exactly to the
--     expense amount, (b) belong to group members, (c) never exist on a
--     personal expense. DEFERRED so multi-row inserts validate at commit.
create or replace function public.validate_expense_splits()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  _expense_id uuid;
  _expense record;
  _split_sum numeric(12, 2);
  _bad_user uuid;
begin
  if tg_op = 'DELETE' then
    _expense_id := old.expense_id;
  else
    _expense_id := new.expense_id;
  end if;

  select id, group_id, amount into _expense
  from public.expenses
  where id = _expense_id;

  -- Expense was deleted in the same transaction (cascade): nothing to check.
  if not found then
    return null;
  end if;

  if _expense.group_id is null then
    raise exception 'Personal expenses cannot have splits (expense %)', _expense.id;
  end if;

  select coalesce(sum(amount), 0) into _split_sum
  from public.expense_splits
  where expense_id = _expense.id;

  if _split_sum <> _expense.amount then
    raise exception 'Split total % does not equal expense amount % (expense %)',
      _split_sum, _expense.amount, _expense.id;
  end if;

  select s.user_id into _bad_user
  from public.expense_splits s
  where s.expense_id = _expense.id
    and not exists (
      select 1 from public.group_members m
      where m.group_id = _expense.group_id and m.user_id = s.user_id
    )
  limit 1;

  if _bad_user is not null then
    raise exception 'User % is not a member of group % (expense %)',
      _bad_user, _expense.group_id, _expense.id;
  end if;

  return null;
end;
$$;

create constraint trigger trg_validate_splits
after insert or update or delete on public.expense_splits
deferrable initially deferred
for each row execute function public.validate_expense_splits();

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.expenses       enable row level security;
alter table public.expense_splits enable row level security;

-- PROFILES: see yourself + anyone you share a group with; edit only yourself.
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shares_group_with(id));

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- GROUPS
create policy "groups_select" on public.groups
  for select to authenticated
  using (public.is_group_member(id));

create policy "groups_insert" on public.groups
  for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "groups_update" on public.groups
  for update to authenticated
  using (public.is_group_owner(id))
  with check (public.is_group_owner(id));

create policy "groups_delete" on public.groups
  for delete to authenticated
  using (public.is_group_owner(id));

-- GROUP MEMBERS: members can see the roster; only owners manage it
-- (adding by email goes through the add_group_member_by_email RPC);
-- a member may always remove themself (leave the group).
create policy "group_members_select" on public.group_members
  for select to authenticated
  using (public.is_group_member(group_id));

create policy "group_members_insert" on public.group_members
  for insert to authenticated
  with check (public.is_group_owner(group_id));

create policy "group_members_update" on public.group_members
  for update to authenticated
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));

create policy "group_members_delete" on public.group_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_owner(group_id));

-- EXPENSES
-- Personal: only the payer. Group: any member can read/create;
-- only the author or a group owner can edit/delete.
create policy "expenses_select" on public.expenses
  for select to authenticated
  using (
    (group_id is null and payer_id = (select auth.uid()))
    or (group_id is not null and public.is_group_member(group_id))
  );

create policy "expenses_insert" on public.expenses
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (group_id is null and payer_id = (select auth.uid()))
      or (
        group_id is not null
        and public.is_group_member(group_id)
        and public.is_group_member(group_id, payer_id)
      )
    )
  );

create policy "expenses_update" on public.expenses
  for update to authenticated
  using (
    (group_id is null and payer_id = (select auth.uid()))
    or (group_id is not null
        and (created_by = (select auth.uid()) or public.is_group_owner(group_id)))
  )
  with check (
    (group_id is null and payer_id = (select auth.uid()))
    or (group_id is not null and public.is_group_member(group_id, payer_id))
  );

create policy "expenses_delete" on public.expenses
  for delete to authenticated
  using (
    (group_id is null and payer_id = (select auth.uid()))
    or (group_id is not null
        and (created_by = (select auth.uid()) or public.is_group_owner(group_id)))
  );

-- EXPENSE SPLITS: visible to anyone who can see the expense; writable by the
-- expense author or a group owner.
create policy "expense_splits_select" on public.expense_splits
  for select to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and e.group_id is not null
        and public.is_group_member(e.group_id)
    )
  );

create policy "expense_splits_write" on public.expense_splits
  for all to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and e.group_id is not null
        and (e.created_by = (select auth.uid()) or public.is_group_owner(e.group_id))
    )
  )
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and e.group_id is not null
        and (e.created_by = (select auth.uid()) or public.is_group_owner(e.group_id))
    )
  );

-- ----------------------------------------------------------------------------
-- 7. RPCs
-- ----------------------------------------------------------------------------

-- 7a. Atomically create a group expense + its splits in ONE transaction so the
--     deferred sum-check trigger validates the complete set at commit.
--     SECURITY INVOKER: all RLS policies above still apply.
--     p_splits: [{ "user_id": "...", "amount": 12.34, "share_value": 33.33 }]
create or replace function public.create_group_expense(
  p_group_id uuid,
  p_description text,
  p_amount numeric,
  p_category public.expense_category,
  p_split_type public.split_type,
  p_expense_date date,
  p_payer_id uuid,
  p_splits jsonb
)
returns public.expenses
language plpgsql
set search_path = public
as $$
declare
  _expense public.expenses;
begin
  if jsonb_array_length(p_splits) < 1 then
    raise exception 'A group expense needs at least one participant';
  end if;

  insert into public.expenses
    (group_id, payer_id, created_by, description, amount, category,
     split_type, expense_date, currency)
  values
    (p_group_id, p_payer_id, auth.uid(), p_description, p_amount, p_category,
     p_split_type, coalesce(p_expense_date, current_date),
     (select currency from public.groups where id = p_group_id))
  returning * into _expense;

  insert into public.expense_splits (expense_id, user_id, amount, share_value)
  select
    _expense.id,
    (s ->> 'user_id')::uuid,
    (s ->> 'amount')::numeric(12, 2),
    (s ->> 'share_value')::numeric(7, 4)
  from jsonb_array_elements(p_splits) as s;

  return _expense;
end;
$$;

-- 7b. Owners invite by email. SECURITY DEFINER because the caller cannot
--     read the profile of someone they don't share a group with yet.
create or replace function public.add_group_member_by_email(
  p_group_id uuid,
  p_email text
)
returns public.group_members
language plpgsql security definer
set search_path = public
as $$
declare
  _profile_id uuid;
  _member public.group_members;
begin
  if not public.is_group_owner(p_group_id) then
    raise exception 'Only the group owner can add members';
  end if;

  select id into _profile_id
  from public.profiles
  where lower(email) = lower(trim(p_email));

  if _profile_id is null then
    raise exception 'No user found with email %', p_email;
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (p_group_id, _profile_id, 'member')
  on conflict (group_id, user_id) do nothing;

  select * into _member
  from public.group_members
  where group_id = p_group_id and user_id = _profile_id;

  return _member;
end;
$$;

-- Members with unsettled expense history cannot be hard-removed silently;
-- leaving is still allowed via the delete policy. (Optional stricter rule:
-- add a trigger blocking deletes while net balance != 0.)

-- ----------------------------------------------------------------------------
-- 8. VIEWS (security_invoker => the caller's RLS applies)
-- ----------------------------------------------------------------------------

-- Net balance per member per group:
--   net > 0  => the group owes this member money (they are a creditor)
--   net < 0  => this member owes the group money (they are a debtor)
create or replace view public.group_balances
with (security_invoker = true) as
select
  gm.group_id,
  gm.user_id,
  coalesce(paid.total, 0)::numeric(12, 2)                          as total_paid,
  coalesce(owed.total, 0)::numeric(12, 2)                          as total_owed,
  (coalesce(paid.total, 0) - coalesce(owed.total, 0))::numeric(12, 2) as net_balance
from public.group_members gm
left join lateral (
  select sum(e.amount) as total
  from public.expenses e
  where e.group_id = gm.group_id and e.payer_id = gm.user_id
) paid on true
left join lateral (
  select sum(s.amount) as total
  from public.expense_splits s
  join public.expenses e on e.id = s.expense_id
  where e.group_id = gm.group_id and s.user_id = gm.user_id
) owed on true;

-- Personal dashboard: monthly totals per category.
create or replace view public.personal_monthly_summary
with (security_invoker = true) as
select
  e.payer_id as user_id,
  (date_trunc('month', e.expense_date))::date as month,
  e.category,
  count(*) as expense_count,
  sum(e.amount)::numeric(12, 2) as total
from public.expenses e
where e.group_id is null
group by 1, 2, 3;

-- ----------------------------------------------------------------------------
-- 9. GRANTS (Supabase defaults usually cover this; explicit is safer)
-- ----------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.group_balances, public.personal_monthly_summary to authenticated;
grant execute on all functions in schema public to authenticated;
revoke all on all tables in schema public from anon;
