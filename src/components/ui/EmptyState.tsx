import styled from 'styled-components';
import { Icon, type IconName } from './Icon';

/**
 * Friendly empty state: a big soft-washed icon disc, a warm title and a hint.
 * Keeps blank screens from feeling dead without shouting.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md}`};
  text-align: center;
`;

const Disc = styled.span<{ $positive?: boolean }>`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $positive }) =>
    $positive ? theme.colors.positive.bg : theme.colors.brand.subtle};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.positive.text : theme.colors.brand.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.heading};
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 34ch;
`;

export function EmptyState({
  icon,
  title,
  hint,
  positive,
}: {
  icon: IconName;
  title: string;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <Wrap>
      <Disc $positive={positive}>
        <Icon name={icon} size={32} strokeWidth={1.5} />
      </Disc>
      <Title>{title}</Title>
      {hint && <Hint>{hint}</Hint>}
    </Wrap>
  );
}
