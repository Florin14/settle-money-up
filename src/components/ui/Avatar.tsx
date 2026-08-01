import styled from 'styled-components';

const HUES = [160, 205, 25, 340, 265, 95, 45, 305];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* Soft pastel disc: muted wash background, deep ink of the same hue. */
const Circle = styled.span<{ $hue: number; $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $hue, theme }) =>
    theme.mode === 'dark' ? `hsl(${$hue} 22% 26%)` : `hsl(${$hue} 38% 90%)`};
  color: ${({ $hue, theme }) =>
    theme.mode === 'dark' ? `hsl(${$hue} 45% 78%)` : `hsl(${$hue} 45% 30%)`};
  border: 1px solid
    ${({ $hue, theme }) =>
      theme.mode === 'dark' ? `hsl(${$hue} 22% 34%)` : `hsl(${$hue} 32% 82%)`};
  font-size: ${({ $size }) => Math.round($size * 0.36)}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.02em;
  user-select: none;
`;

interface AvatarProps {
  /** Display name (or email) — drives the initials. */
  name: string;
  /** Stable id for the hue; falls back to name. */
  seed?: string;
  size?: number;
  title?: string;
}

export function Avatar({ name, seed, size = 32, title }: AvatarProps) {
  const hue = HUES[hashString(seed ?? name) % HUES.length];
  return (
    <Circle $hue={hue} $size={size} title={title ?? name} aria-hidden>
      {initialsOf(name)}
    </Circle>
  );
}

/** Overlapping avatar row for group headers. */
export const AvatarStack = styled.div`
  display: flex;

  > * + * {
    margin-left: -8px;
  }
`;
