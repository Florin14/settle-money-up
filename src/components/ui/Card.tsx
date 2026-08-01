import styled from 'styled-components';

/**
 * The base surface: solid, quiet, hairline border, feather shadow.
 * ($static is accepted for API compatibility; cards no longer animate on hover.)
 */
export const Card = styled.section<{ $static?: boolean }>`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: equi-fade-up 360ms ${({ theme }) => theme.transitions.spring} both;
`;

export const CardTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wider};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

/** Money badge: green when the group owes you, clay when you owe. */
export const BalancePill = styled.span<{ $negative?: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $negative }) =>
    $negative ? theme.colors.negative.text : theme.colors.positive.text};
  background: ${({ theme, $negative }) =>
    $negative ? theme.colors.negative.bg : theme.colors.positive.bg};
`;

/**
 * Debt-ratio meter: thin track + rounded fill, animated once on mount.
 * Identity comes from the row label; the fill is a single semantic hue.
 */
export const MeterTrack = styled.div`
  width: 100%;
  height: 5px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.background.sunken};
  overflow: hidden;
`;

export const MeterFill = styled.div<{ $pct: number; $negative?: boolean }>`
  height: 100%;
  width: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
  border-radius: inherit;
  background: ${({ theme, $negative }) =>
    $negative ? theme.colors.negative.solid : theme.colors.positive.solid};
  transform-origin: left center;
  animation: equi-grow-bar 600ms ${({ theme }) => theme.transitions.spring} both;
`;
