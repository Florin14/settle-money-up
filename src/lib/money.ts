/**
 * All split/settlement math runs on integer cents to avoid IEEE-754 drift
 * (0.1 + 0.2 !== 0.3). Convert at the boundaries: DB numeric(12,2) <-> cents.
 */

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatMoney(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatCents(cents: number, currency: string, locale?: string): string {
  return formatMoney(fromCents(cents), currency, locale);
}
