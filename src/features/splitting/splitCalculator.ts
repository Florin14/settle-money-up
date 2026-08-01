import { toCents, fromCents } from '@/lib/money';
import type { SplitType } from '@/types/database.types';

export interface SplitInput {
  userId: string;
  /** For 'amount': the exact amount. For 'percentage': the percent (0–100). Ignored for 'equal'. */
  value?: number;
}

export interface ResolvedSplit {
  userId: string;
  /** Final amount owed, in major units with exactly 2 decimals — sums exactly to the total. */
  amount: number;
  /** Original input preserved for the DB `share_value` column (percentage splits). */
  shareValue: number | null;
}

export class SplitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SplitValidationError';
  }
}

/**
 * Resolves a split configuration into exact per-person amounts.
 *
 * Invariant guaranteed for every split type:
 *   sum(result.amount) === total, to the cent.
 * (The DB enforces the same invariant with a deferred trigger — this function
 * exists so the UI never submits something the DB would reject.)
 *
 * Rounding strategy for 'equal' and 'percentage': compute the floor in cents,
 * then distribute the leftover cents one-by-one to the first participants.
 * e.g. 100.00 / 3 -> 33.34, 33.33, 33.33.
 */
export function calculateSplits(
  splitType: SplitType,
  total: number,
  participants: SplitInput[],
): ResolvedSplit[] {
  if (total <= 0) {
    throw new SplitValidationError('Total must be greater than zero');
  }
  if (participants.length === 0) {
    throw new SplitValidationError('At least one participant is required');
  }
  const ids = new Set(participants.map((p) => p.userId));
  if (ids.size !== participants.length) {
    throw new SplitValidationError('Duplicate participant');
  }

  const totalCents = toCents(total);

  switch (splitType) {
    case 'equal':
      return splitEqual(totalCents, participants);
    case 'amount':
      return splitByAmount(totalCents, participants);
    case 'percentage':
      return splitByPercentage(totalCents, participants);
  }
}

function splitEqual(totalCents: number, participants: SplitInput[]): ResolvedSplit[] {
  const n = participants.length;
  const baseCents = Math.floor(totalCents / n);
  const remainder = totalCents - baseCents * n; // 0..n-1 leftover cents

  return participants.map((p, i) => ({
    userId: p.userId,
    amount: fromCents(baseCents + (i < remainder ? 1 : 0)),
    shareValue: null,
  }));
}

function splitByAmount(totalCents: number, participants: SplitInput[]): ResolvedSplit[] {
  const resolved = participants.map((p) => {
    if (p.value === undefined || p.value < 0) {
      throw new SplitValidationError('Every participant needs a non-negative amount');
    }
    return { userId: p.userId, cents: toCents(p.value) };
  });

  const sum = resolved.reduce((acc, r) => acc + r.cents, 0);
  if (sum !== totalCents) {
    throw new SplitValidationError(
      `Split amounts (${fromCents(sum).toFixed(2)}) must add up to the total (${fromCents(totalCents).toFixed(2)})`,
    );
  }

  return resolved.map((r) => ({ userId: r.userId, amount: fromCents(r.cents), shareValue: null }));
}

function splitByPercentage(totalCents: number, participants: SplitInput[]): ResolvedSplit[] {
  const percents = participants.map((p) => {
    if (p.value === undefined || p.value < 0 || p.value > 100) {
      throw new SplitValidationError('Every participant needs a percentage between 0 and 100');
    }
    return { userId: p.userId, percent: p.value };
  });

  // Tolerate float noise in user input (33.33 * 3 = 99.99): accept if the
  // percentages round to 100.00 at 2 decimals.
  const percentSum = percents.reduce((acc, r) => acc + r.percent, 0);
  if (Math.round(percentSum * 100) !== 100 * 100) {
    throw new SplitValidationError(`Percentages must add up to 100 (got ${percentSum.toFixed(2)})`);
  }

  // Largest-remainder method: floor everyone, then hand the missing cents to
  // the participants with the biggest fractional part (deterministic order).
  const raw = percents.map((r, i) => {
    const exact = (totalCents * r.percent) / 100;
    const floor = Math.floor(exact);
    return { ...r, index: i, floor, frac: exact - floor };
  });

  let leftover = totalCents - raw.reduce((acc, r) => acc + r.floor, 0);
  const byFrac = [...raw].sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (const r of byFrac) {
    if (leftover <= 0) break;
    r.floor += 1;
    leftover -= 1;
  }

  return raw.map((r) => ({
    userId: r.userId,
    amount: fromCents(r.floor),
    shareValue: r.percent,
  }));
}
