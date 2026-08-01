import styled from 'styled-components';
import { Icon } from './Icon';
import type { ExpenseCategory } from '@/types/database.types';

/**
 * Soft pastel disc per expense category — same wash-plus-ink recipe as the
 * avatars, one hue per category, so lists get gentle colour without noise.
 */
const HUES: Record<ExpenseCategory, number> = {
  food: 25, // peach
  transport: 205, // sky
  utilities: 45, // gold
  housing: 160, // green
  entertainment: 305, // lilac
  health: 340, // rose
  shopping: 265, // violet
  travel: 190, // teal
  education: 95, // leaf
  other: 225, // slate blue
};

const Bubble = styled.span<{ $hue: number; $size: number }>`
  display: grid;
  place-items: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $hue, theme }) =>
    theme.mode === 'dark' ? `hsl(${$hue} 20% 24%)` : `hsl(${$hue} 42% 91%)`};
  color: ${({ $hue, theme }) =>
    theme.mode === 'dark' ? `hsl(${$hue} 40% 74%)` : `hsl(${$hue} 45% 32%)`};
  transition: transform ${({ theme }) => theme.transitions.fast};

  li:hover > &,
  a:hover > & {
    transform: scale(1.07) rotate(-3deg);
  }
`;

export function CategoryBubble({
  category,
  size = 40,
}: {
  category: ExpenseCategory;
  size?: number;
}) {
  return (
    <Bubble $hue={HUES[category]} $size={size} aria-hidden>
      <Icon name={category} size={Math.round(size * 0.48)} />
    </Bubble>
  );
}
