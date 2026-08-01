import styled from 'styled-components';

export const Card = styled.section`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

/** Money badge: green when the group owes you, red when you owe. */
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
