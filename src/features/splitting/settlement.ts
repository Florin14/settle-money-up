import { toCents, fromCents } from '@/lib/money';
import type { GroupBalance } from '@/types/database.types';

export interface SettlementTransaction {
  /** Debtor — the member who pays. */
  fromUserId: string;
  /** Creditor — the member who receives. */
  toUserId: string;
  amount: number;
  /** Debts never mix currencies: a RON debt is settled in RON, a EUR one in EUR. */
  currency: string;
}

/**
 * Debt settlement matrix: turns per-member net balances into a minimal,
 * concrete list of "X pays Y amount Z" transactions.
 *
 * Input comes from the `group_balances` view (net = paid - owed):
 *   net > 0 -> creditor, net < 0 -> debtor.
 *
 * Greedy algorithm: repeatedly match the largest debtor with the largest
 * creditor and transfer min(|debt|, credit). This settles n members in at
 * most n-1 transactions. (The absolute minimum transaction count is
 * NP-hard via subset-sum matching; n-1 greedy is the standard,
 * user-comprehensible choice used by Splitwise & co.)
 *
 * Works in integer cents; because each expense's splits sum exactly to its
 * amount, group balances always sum to zero and the loop terminates cleanly.
 *
 * Balances arrive per (member, currency); each currency settles independently.
 */
export function calculateSettlement(balances: GroupBalance[]): SettlementTransaction[] {
  const byCurrency = new Map<string, GroupBalance[]>();
  for (const b of balances) {
    const list = byCurrency.get(b.currency) ?? [];
    list.push(b);
    byCurrency.set(b.currency, list);
  }

  return [...byCurrency.keys()]
    .sort()
    .flatMap((currency) => settleOneCurrency(byCurrency.get(currency)!, currency));
}

function settleOneCurrency(
  balances: GroupBalance[],
  currency: string,
): SettlementTransaction[] {
  const debtors: { userId: string; cents: number }[] = [];
  const creditors: { userId: string; cents: number }[] = [];

  for (const b of balances) {
    const cents = toCents(b.net_balance);
    if (cents < 0) debtors.push({ userId: b.user_id, cents: -cents });
    else if (cents > 0) creditors.push({ userId: b.user_id, cents });
  }

  // Largest first; tie-break by id so output is deterministic across renders.
  debtors.sort((a, b) => b.cents - a.cents || a.userId.localeCompare(b.userId));
  creditors.sort((a, b) => b.cents - a.cents || a.userId.localeCompare(b.userId));

  const transactions: SettlementTransaction[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const transfer = Math.min(debtor.cents, creditor.cents);

    if (transfer > 0) {
      transactions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: fromCents(transfer),
        currency,
      });
    }

    debtor.cents -= transfer;
    creditor.cents -= transfer;
    if (debtor.cents === 0) d += 1;
    if (creditor.cents === 0) c += 1;
  }

  return transactions;
}
