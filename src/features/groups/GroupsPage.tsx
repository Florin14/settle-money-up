import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardTitle } from '@/components/ui/Card';

const FormRow = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: start;
`;

const GroupGrid = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const GroupTile = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.primary};
  transition:
    box-shadow ${({ theme }) => theme.transitions.normal},
    border-color ${({ theme }) => theme.transitions.normal};

  &::after {
    content: '→';
    position: absolute;
    right: ${({ theme }) => theme.spacing.md};
    bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.brand.primary};
    opacity: 0;
    transform: translateX(-6px);
    transition:
      opacity ${({ theme }) => theme.transitions.normal},
      transform ${({ theme }) => theme.transitions.normal};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.brand.subtleBorder};
    box-shadow: ${({ theme }) => theme.shadows.md};
    color: ${({ theme }) => theme.colors.text.primary};

    &::after {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const GroupName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.heading};
`;

const GroupMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const CurrencyChip = styled.span`
  align-self: flex-start;
  padding: 2px ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  color: ${({ theme }) => theme.colors.brand.primary};
  background: ${({ theme }) => theme.colors.brand.subtle};
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
`;

export default function GroupsPage() {
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('EUR');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createGroup.mutate({ name, currency }, { onSuccess: () => setName('') });
  }

  return (
    <>
      <Card $static>
        <CardTitle>Creează un grup</CardTitle>
        <FormRow onSubmit={onSubmit}>
          <Input
            label='Nume grup (ex. "Vacanță la Roma")'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select label="Monedă" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="RON">RON</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </Select>
          <Button type="submit" disabled={createGroup.isPending}>
            {createGroup.isPending ? 'Se creează…' : '+ Creează grup'}
          </Button>
        </FormRow>
        {createGroup.isError && (
          <Muted role="alert">Eroare: {(createGroup.error as Error).message}</Muted>
        )}
      </Card>

      <Card $static>
        <CardTitle>Grupurile tale</CardTitle>
        {isLoading ? (
          <Muted>Se încarcă…</Muted>
        ) : (groups ?? []).length === 0 ? (
          <Muted>Nu ești în niciun grup încă. Creează unul mai sus.</Muted>
        ) : (
          <GroupGrid>
            {(groups ?? []).map((g) => (
              <li key={g.id}>
                <GroupTile to={`/groups/${g.id}`}>
                  <CurrencyChip>{g.currency}</CurrencyChip>
                  <GroupName>{g.name}</GroupName>
                  <GroupMeta>
                    creat{' '}
                    {new Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium' }).format(
                      new Date(g.created_at),
                    )}
                  </GroupMeta>
                </GroupTile>
              </li>
            ))}
          </GroupGrid>
        )}
      </Card>
    </>
  );
}
