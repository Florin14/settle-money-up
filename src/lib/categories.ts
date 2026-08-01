import type { ExpenseCategory } from '@/types/database.types';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Mâncare',
  transport: 'Transport',
  utilities: 'Utilități',
  housing: 'Locuință',
  entertainment: 'Divertisment',
  health: 'Sănătate',
  shopping: 'Cumpărături',
  travel: 'Călătorii',
  education: 'Educație',
  other: 'Altele',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][];

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
