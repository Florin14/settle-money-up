import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

const FormRow = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  /* top-aligned so an error under one field never shifts its neighbours */
  align-items: start;

  button[type='submit'] {
    height: 2.5rem;
    margin-top: calc(0.75rem * 1.55 + 4px);
  }
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
  const [nameError, setNameError] = useState<string | undefined>();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Dă-i un nume grupului');
      return;
    }
    createGroup.mutate({ name, currency }, { onSuccess: () => setName('') });
  }

  return (
    <>
      <Card $static>
        <CardTitle>Creează un grup</CardTitle>
        <FormRow onSubmit={onSubmit} noValidate>
          <Input
            label='Nume grup (ex. "Vacanță la Roma")'
            value={name}
            error={nameError}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(undefined);
            }}
          />
          <Select label="Monedă" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="RON">RON</option>
          </Select>
          <Button type="submit" disabled={createGroup.isPending}>
            {createGroup.isPending ? 'Se creează…' : 'Creează grup'}
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
          <EmptyState
            icon="users"
            title="Niciun grup încă"
            hint="O vacanță, o chirie împărțită, o ieșire cu prietenii — primul grup e la un click distanță."
          />
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
