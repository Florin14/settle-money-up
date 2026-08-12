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

export const CURRENCIES = [
  { code: 'RON', label: 'lei Românești' },
  { code: 'EUR', label: '€ Euro' },
] as const;

/** The selectable currencies, always including `extra` (e.g. a group's default). */
export function currencyOptions(extra?: string | null): { code: string; label: string }[] {
  const base: { code: string; label: string }[] = [...CURRENCIES];
  if (extra && !base.some((c) => c.code === extra)) base.push({ code: extra, label: extra });
  return base;
}
