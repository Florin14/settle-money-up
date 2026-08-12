-- ============================================================================
-- SettleUp — Migration 00003: unified "my expenses" view + multi-currency groups
-- 1. my_expenses view: personal expenses + the caller's share of group
--    expenses, in one feed (with the group name).
-- 2. Group expenses may now be in ANY currency (e.g. 300 RON and 50 EUR in
--    the same group); groups.currency becomes just the default/prefill.
--    Balances and settlements are computed PER CURRENCY.
-- Additive/replace only: no table changes, existing data is untouched.
-- Run in the Supabase SQL Editor, or via `supabase db push`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. my_expenses — one row per expense that concerns the calling user:
--   * personal expense (group_id null, paid by me)      -> my_share = amount
--   * group expense where I have a split                -> my_share = my split
--   * group expense I paid but don't participate in     -> my_share = 0
-- Group expenses where I neither paid nor participate are excluded: they are
-- visible on the group page but are not *my* spending.
-- security_invoker => the caller's RLS on expenses/groups/splits still applies.
-- ----------------------------------------------------------------------------

create or replace view public.my_expenses
with (security_invoker = true) as
select
  e.id,
  e.group_id,
  g.name as group_name,
  e.payer_id,
  e.created_by,
  e.description,
  e.category,
  e.currency,
  e.split_type,
  e.expense_date,
  e.notes,
  e.created_at,
  e.amount::numeric(12, 2) as total_amount,
  (case
     when e.group_id is null then e.amount
     else coalesce(s.amount, 0)
   end)::numeric(12, 2) as my_share,
  (e.payer_id = (select auth.uid())) as paid_by_me
from public.expenses e
left join public.groups g on g.id = e.group_id
left join public.expense_splits s
  on s.expense_id = e.id and s.user_id = (select auth.uid())
where
  (e.group_id is null and e.payer_id = (select auth.uid()))
  or (e.group_id is not null and (s.user_id is not null or e.payer_id = (select auth.uid())));

grant select on public.my_expenses to authenticated;

-- ----------------------------------------------------------------------------
-- 2a. group_balances now carries a `currency` column and is computed per
--     (group, member, currency). Debts in RON and debts in EUR never mix.
--     NOTE: a group with zero expenses now simply has zero balance rows.
-- ----------------------------------------------------------------------------

create or replace view public.group_balances
with (security_invoker = true) as
select
  gm.group_id,
  gm.user_id,
  coalesce(paid.total, 0)::numeric(12, 2)                             as total_paid,
  coalesce(owed.total, 0)::numeric(12, 2)                             as total_owed,
  (coalesce(paid.total, 0) - coalesce(owed.total, 0))::numeric(12, 2) as net_balance,
  cur.currency
from public.group_members gm
join lateral (
  select distinct e.currency
  from public.expenses e
  where e.group_id = gm.group_id
) cur on true
left join lateral (
  select sum(e.amount) as total
  from public.expenses e
  where e.group_id = gm.group_id
    and e.payer_id = gm.user_id
    and e.currency = cur.currency
) paid on true
left join lateral (
  select sum(s.amount) as total
  from public.expense_splits s
  join public.expenses e on e.id = s.expense_id
  where e.group_id = gm.group_id
    and s.user_id = gm.user_id
    and e.currency = cur.currency
) owed on true;

grant select on public.group_balances to authenticated;

-- ----------------------------------------------------------------------------
-- 2b. create_group_expense accepts an explicit currency (falls back to the
--     group's default when null). Old signature is dropped so PostgREST has
--     exactly one candidate.
-- ----------------------------------------------------------------------------

drop function if exists public.create_group_expense(
  uuid, text, numeric, public.expense_category, public.split_type, date, uuid, jsonb
);

create or replace function public.create_group_expense(
  p_group_id uuid,
  p_description text,
  p_amount numeric,
  p_category public.expense_category,
  p_split_type public.split_type,
  p_expense_date date,
  p_payer_id uuid,
  p_splits jsonb,
  p_currency text default null
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
     coalesce(
       nullif(upper(trim(p_currency)), ''),
       (select currency from public.groups where id = p_group_id)
     ))
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

grant execute on function public.create_group_expense(
  uuid, text, numeric, public.expense_category, public.split_type, date, uuid, jsonb, text
) to authenticated;
