import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useGroup, useGroupMembers, useAddMemberByEmail } from '@/hooks/useGroups';
import { useGroupExpenses, useCreateGroupExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useGroupSettlement } from '@/hooks/useSettlement';
import { CATEGORY_OPTIONS, todayISO } from '@/lib/categories';
import { formatMoney } from '@/lib/money';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardTitle, BalancePill, MeterTrack, MeterFill } from '@/components/ui/Card';
import { Avatar, AvatarStack } from '@/components/ui/Avatar';
import type { ExpenseCategory, Profile, SplitType } from '@/types/database.types';

/* ---------- layout ---------- */

const PageHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const BackLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const GroupTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin-top: ${({ theme }) => theme.spacing.xxs};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 3fr 2fr;
    align-items: start;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

/* ---------- forms ---------- */

const FormGrid = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ParticipantRow = styled.label<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $checked }) => ($checked ? theme.colors.brand.subtleBorder : 'transparent')};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.brand.subtle : 'transparent'};
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.sunken};
  }

  input[type='checkbox'] {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const ParticipantName = styled.span`
  flex: 1;
`;

const ShareInput = styled.input`
  width: 7rem;
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.xs}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.sunken};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: right;
  font-variant-numeric: tabular-nums;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
  }
`;

/* ---------- feed rows ---------- */

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
`;

const FeedRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin: 0 -${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.sunken};
  }
`;

const IconBubble = styled.span`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.brand.subtle};
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const RowMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const RowTitle = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Amount = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.heading};
`;

/* ---------- settlement feed ---------- */

const SettleItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.background.sunken};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SettleHead = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const SettleArrow = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SettleAmount = styled.span`
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.positive.text};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.negative.text};
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
`;

type ParticipantState = Record<string, { checked: boolean; value: string }>;

function displayName(p: Profile | undefined): string {
  return p?.full_name || p?.email || 'necunoscut';
}

export default function GroupDetailPage() {
  const { groupId = '' } = useParams();
  const { user } = useAuth();
  const { data: group } = useGroup(groupId);
  const { data: members } = useGroupMembers(groupId);
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(groupId);
  const { data: settlement } = useGroupSettlement(groupId);
  const createExpense = useCreateGroupExpense();
  const deleteExpense = useDeleteExpense();
  const addMember = useAddMemberByEmail(groupId);

  const currency = group?.currency ?? 'EUR';
  const isOwner = members?.some((m) => m.user_id === user?.id && m.role === 'owner') ?? false;

  const profileById = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const m of members ?? []) map.set(m.user_id, m.profile);
    return map;
  }, [members]);

  /* --- add-expense form state --- */
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(todayISO());
  const [payerId, setPayerId] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [participants, setParticipants] = useState<ParticipantState>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!members) return;
    setPayerId((prev) => prev || user?.id || members[0]?.user_id || '');
    setParticipants((prev) => {
      const next: ParticipantState = {};
      for (const m of members) {
        next[m.user_id] = prev[m.user_id] ?? { checked: true, value: '' };
      }
      return next;
    });
  }, [members, user?.id]);

  const checkedIds = (members ?? [])
    .filter((m) => participants[m.user_id]?.checked)
    .map((m) => m.user_id);

  const enteredSum = checkedIds.reduce(
    (acc, id) => acc + (Number(participants[id]?.value) || 0),
    0,
  );

  function onSubmitExpense(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    createExpense.mutate(
      {
        groupId,
        description,
        amount: Number(amount),
        category,
        splitType,
        payerId,
        expenseDate: date,
        participants: checkedIds.map((id) => ({
          userId: id,
          value: splitType === 'equal' ? undefined : Number(participants[id]?.value) || 0,
        })),
      },
      {
        onSuccess: () => {
          setDescription('');
          setAmount('');
          setParticipants((prev) => {
            const next: ParticipantState = {};
            for (const [id, p] of Object.entries(prev)) next[id] = { ...p, value: '' };
            return next;
          });
        },
        onError: (err) => setFormError(err instanceof Error ? err.message : String(err)),
      },
    );
  }

  /* --- add-member form state --- */
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);

  function onAddMember(e: FormEvent) {
    e.preventDefault();
    setMemberError(null);
    addMember.mutate(memberEmail, {
      onSuccess: () => setMemberEmail(''),
      onError: (err) => setMemberError(err instanceof Error ? err.message : String(err)),
    });
  }

  const maxTransaction = Math.max(...(settlement?.transactions.map((t) => t.amount) ?? [0]), 0);
  const maxAbsBalance = Math.max(
    ...(settlement?.balances.map((b) => Math.abs(b.net_balance)) ?? [0]),
    0,
  );

  return (
    <>
      <PageHead>
        <div>
          <BackLink to="/groups">← Toate grupurile</BackLink>
          <GroupTitle>{group?.name ?? 'Grup'}</GroupTitle>
        </div>
        <AvatarStack>
          {(members ?? []).map((m) => (
            <Avatar
              key={m.user_id}
              name={displayName(m.profile)}
              seed={m.user_id}
              size={34}
              title={displayName(m.profile)}
            />
          ))}
        </AvatarStack>
      </PageHead>

      <Grid>
        <Column>
          <Card $static>
            <CardTitle>Adaugă cheltuială</CardTitle>
            <FormGrid onSubmit={onSubmitExpense}>
              <FieldRow>
                <Input
                  label="Descriere"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <Input
                  label={`Sumă (${currency})`}
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <Select
                  label="Categorie"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                >
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Data"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FieldRow>
              <FieldRow>
                <Select
                  label="Plătit de"
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                >
                  {(members ?? []).map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {displayName(m.profile)}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Mod de împărțire"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                >
                  <option value="equal">Egal între participanți</option>
                  <option value="amount">Sume exacte</option>
                  <option value="percentage">Procente</option>
                </Select>
              </FieldRow>

              <div>
                <Hint>Cine a participat?</Hint>
                {(members ?? []).map((m) => (
                  <ParticipantRow key={m.user_id} $checked={participants[m.user_id]?.checked}>
                    <input
                      type="checkbox"
                      checked={participants[m.user_id]?.checked ?? false}
                      onChange={(e) =>
                        setParticipants((prev) => ({
                          ...prev,
                          [m.user_id]: {
                            checked: e.target.checked,
                            value: prev[m.user_id]?.value ?? '',
                          },
                        }))
                      }
                    />
                    <Avatar name={displayName(m.profile)} seed={m.user_id} size={26} />
                    <ParticipantName>{displayName(m.profile)}</ParticipantName>
                    {splitType !== 'equal' && participants[m.user_id]?.checked && (
                      <ShareInput
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={splitType === 'amount' ? '0.00' : '%'}
                        value={participants[m.user_id]?.value ?? ''}
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) =>
                          setParticipants((prev) => ({
                            ...prev,
                            [m.user_id]: { checked: true, value: e.target.value },
                          }))
                        }
                      />
                    )}
                  </ParticipantRow>
                ))}
                {splitType === 'amount' && (
                  <Hint>
                    Introdus: {enteredSum.toFixed(2)} / {Number(amount || 0).toFixed(2)} {currency}
                  </Hint>
                )}
                {splitType === 'percentage' && (
                  <Hint>Introdus: {enteredSum.toFixed(2)}% / 100%</Hint>
                )}
              </div>

              {formError && <ErrorText role="alert">{formError}</ErrorText>}
              <Button type="submit" disabled={createExpense.isPending}>
                {createExpense.isPending ? 'Se salvează…' : '+ Adaugă cheltuiala'}
              </Button>
            </FormGrid>
          </Card>

          <Card $static>
            <CardTitle>Cheltuielile grupului</CardTitle>
            {expensesLoading ? (
              <Muted>Se încarcă…</Muted>
            ) : (expenses ?? []).length === 0 ? (
              <Muted>Nicio cheltuială încă.</Muted>
            ) : (
              <List>
                {(expenses ?? []).map((e) => (
                  <FeedRow key={e.id}>
                    <IconBubble aria-hidden>
                      <Icon name={e.category} size={19} />
                    </IconBubble>
                    <RowMain>
                      <RowTitle>{e.description}</RowTitle>
                      <RowMeta>
                        plătit de {displayName(e.payer)} ·{' '}
                        {new Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium' }).format(
                          new Date(`${e.expense_date}T00:00:00`),
                        )}{' '}
                        · {e.splits.length} participanți
                      </RowMeta>
                    </RowMain>
                    <Amount data-money>{formatMoney(e.amount, e.currency, 'ro-RO')}</Amount>
                    {(e.created_by === user?.id || isOwner) && (
                      <Button
                        $variant="ghost"
                        $size="sm"
                        aria-label={`Șterge ${e.description}`}
                        onClick={() => deleteExpense.mutate({ id: e.id, group_id: e.group_id })}
                      >
                        <Icon name="close" size={15} />
                      </Button>
                    )}
                  </FeedRow>
                ))}
              </List>
            )}
          </Card>
        </Column>

        <Column>
          <Card $static>
            <CardTitle>Cine cui datorează</CardTitle>
            {!settlement ? (
              <Muted>Se calculează…</Muted>
            ) : settlement.transactions.length === 0 ? (
              <Muted>Totul e decontat.</Muted>
            ) : (
              <List>
                {settlement.transactions.map((t, i) => (
                  <SettleItem key={i}>
                    <SettleHead>
                      <Avatar
                        name={displayName(profileById.get(t.fromUserId))}
                        seed={t.fromUserId}
                        size={26}
                      />
                      <span>{displayName(profileById.get(t.fromUserId))}</span>
                      <SettleArrow>
                        <Icon name="arrowRight" size={16} />
                      </SettleArrow>
                      <Avatar
                        name={displayName(profileById.get(t.toUserId))}
                        seed={t.toUserId}
                        size={26}
                      />
                      <span>{displayName(profileById.get(t.toUserId))}</span>
                      <SettleAmount data-money>
                        {formatMoney(t.amount, currency, 'ro-RO')}
                      </SettleAmount>
                    </SettleHead>
                    <MeterTrack>
                      <MeterFill
                        $pct={maxTransaction > 0 ? (t.amount / maxTransaction) * 100 : 0}
                      />
                    </MeterTrack>
                  </SettleItem>
                ))}
              </List>
            )}
          </Card>

          <Card $static>
            <CardTitle>Balanțe</CardTitle>
            {!settlement || settlement.balances.length === 0 ? (
              <Muted>Nicio balanță încă.</Muted>
            ) : (
              <List>
                {settlement.balances.map((b) => (
                  <FeedRow key={b.user_id} as="li" style={{ flexWrap: 'wrap' }}>
                    <Avatar
                      name={displayName(profileById.get(b.user_id))}
                      seed={b.user_id}
                      size={34}
                    />
                    <RowMain>
                      <RowTitle>{displayName(profileById.get(b.user_id))}</RowTitle>
                      <RowMeta>
                        a plătit {formatMoney(b.total_paid, currency, 'ro-RO')} · consumă{' '}
                        {formatMoney(b.total_owed, currency, 'ro-RO')}
                      </RowMeta>
                    </RowMain>
                    <BalancePill $negative={b.net_balance < 0} data-money>
                      {b.net_balance > 0 ? '+' : ''}
                      {formatMoney(b.net_balance, currency, 'ro-RO')}
                    </BalancePill>
                    <div style={{ width: '100%' }}>
                      <MeterTrack>
                        <MeterFill
                          $pct={
                            maxAbsBalance > 0
                              ? (Math.abs(b.net_balance) / maxAbsBalance) * 100
                              : 0
                          }
                          $negative={b.net_balance < 0}
                        />
                      </MeterTrack>
                    </div>
                  </FeedRow>
                ))}
              </List>
            )}
          </Card>

          <Card $static>
            <CardTitle>Membri</CardTitle>
            <List>
              {(members ?? []).map((m) => (
                <FeedRow key={m.user_id}>
                  <Avatar name={displayName(m.profile)} seed={m.user_id} size={34} />
                  <RowMain>
                    <RowTitle>{displayName(m.profile)}</RowTitle>
                    <RowMeta>{m.role === 'owner' ? 'Proprietar' : 'Membru'}</RowMeta>
                  </RowMain>
                </FeedRow>
              ))}
            </List>
            {isOwner && (
              <FormGrid onSubmit={onAddMember} style={{ marginTop: '1rem' }}>
                <Input
                  label="Adaugă membru după email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                {memberError && <ErrorText role="alert">{memberError}</ErrorText>}
                <Button type="submit" $variant="secondary" disabled={addMember.isPending}>
                  {addMember.isPending ? 'Se adaugă…' : '+ Adaugă membru'}
                </Button>
              </FormGrid>
            )}
          </Card>
        </Column>
      </Grid>
    </>
  );
}
