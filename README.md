# SettleUp — Expense Tracker & Bill Splitting

React (Vite) + TypeScript + styled-components + Supabase + TanStack Query.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create the Supabase project**, then run the migration:
   - Dashboard → SQL Editor → paste `supabase/migrations/00001_init.sql` → Run
   - or with the CLI: `supabase link --project-ref <ref> && supabase db push`

3. **Environment variables** — copy and fill in from Dashboard → Project Settings → API:

   ```bash
   cp .env.example .env.local
   ```

4. **Run**

   ```bash
   npm run dev
   ```

After schema changes, regenerate types: `SUPABASE_PROJECT_ID=<ref> npm run gen:types`.

## Architecture notes

- **Money math** runs in integer cents (`src/lib/money.ts`); the DB stores `numeric(12,2)`. Never use floats for split arithmetic.
- **Splits invariant**: `sum(expense_splits.amount) === expenses.amount`, enforced twice — client-side in `splitCalculator.ts` (largest-remainder rounding) and in Postgres by a deferred constraint trigger.
- **Group expenses are created via the `create_group_expense` RPC**, never by separate inserts — supabase-js has no client transactions, and the RPC makes expense + splits atomic.
- **RLS recursion**: policies on `group_members` cannot query `group_members` directly; the `is_group_member` / `is_group_owner` `SECURITY DEFINER` functions exist to break that cycle. Keep using them in any new policy.
- **Settlement** (`settlement.ts`): greedy largest-debtor ↔ largest-creditor matching over the `group_balances` view; settles n members in ≤ n−1 transactions.
- **Views** are `security_invoker = true`, so the caller's RLS applies — don't remove that flag.

## Structure

```
src/
├── components/ui/     # Reusable primitives (Button, Input, Card)
├── context/           # AuthContext (Supabase session), ThemeModeContext (dark/light)
├── features/
│   ├── dashboard/     # Personal history, monthly breakdowns
│   ├── groups/        # Group CRUD, member management UI
│   └── splitting/     # splitCalculator.ts, settlement.ts + split UI
├── hooks/             # useGroups, useExpenses, useSettlement (TanStack Query)
├── lib/               # money.ts (cents helpers, formatting)
├── services/          # supabase.ts client
├── styles/            # theme.ts, GlobalStyles.ts, styled.d.ts
└── types/             # database.types.ts (generated from schema)
```
