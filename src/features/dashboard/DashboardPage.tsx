import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { usePersonalExpenses, useCreatePersonalExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useMyEventBalances } from '@/hooks/useSettlement';
import { useGroups } from '@/hooks/useGroups';
import { CATEGORY_LABELS, CATEGORY_OPTIONS, todayISO } from '@/lib/categories';
import { formatMoney } from '@/lib/money';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardTitle, BalancePill, MeterTrack, MeterFill } from '@/components/ui/Card';
import type { ExpenseCategory } from '@/types/database.types';

/* ---------- Bento layout ---------- */

const Bento = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: 1fr;
  grid-template-areas:
    'hero'
    'count'
    'topcat'
    'form'
    'cats'
    'list';

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas:
      'hero hero count topcat'
      'form form cats cats'
      'list list list list';
  }
`;

const HeroTile = styled(Card)`
  grid-area: hero;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeroNumber = styled.p<{ $secondary?: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ $secondary, theme }) =>
    $secondary
      ? theme.typography.fontSize.xl
      : `clamp(2.2rem, 5vw, ${theme.typography.fontSize.display})`};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text.heading};
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MonthLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatTile = styled(Card)<{ $area: string }>`
  grid-area: ${({ $area }) => $area};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

const StatValue = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.heading};
  font-variant-numeric: tabular-nums;
`;

const StatHint = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/* ---------- Form ---------- */

const FormCard = styled(Card)`
  grid-area: form;
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: start;
`;

/* ---------- Lists ---------- */

const CatsCard = styled(Card)`
  grid-area: cats;
`;

const ListCard = styled(Card)`
  grid-area: list;
`;

const ListHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const Segments = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.background.sunken};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SegButton = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.heading : theme.colors.text.secondary};
  background: ${({ theme, $active }) => ($active ? theme.colors.brand.subtle : 'transparent')};
  box-shadow: ${({ theme, $active }) =>
    $active ? `inset 0 0 0 1px ${theme.colors.brand.subtleBorder}` : 'none'};
  transition:
    background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
`;

const rowStyles = `
  display: flex;
  align-items: center;
`;

const FeedRow = styled.li`
  ${rowStyles}
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin: 0 -${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.sunken};
  }
`;

const EventRow = styled(Link)`
  ${rowStyles}
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin: 0 -${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.sunken};
    color: ${({ theme }) => theme.colors.text.primary};
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

const CatRow = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.xs} 0;
`;

const CatHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
`;

function monthStart(offsetFromNow: number): string {
  const d = new Date();
  const m = new Date(d.getFullYear(), d.getMonth() + offsetFromNow, 1);
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-01`;
}

const CURRENCIES = [
  { code: 'EUR', label: '€ Euro' },
  { code: 'RON', label: 'lei Românești' },
] as const;

export default function DashboardPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'monthly' | 'events'>('monthly');
  const month = monthStart(monthOffset);
  const { data: expenses, isLoading } = usePersonalExpenses(month);
  const { data: groups } = useGroups();
  const { data: eventBalances } = useMyEventBalances();
  const createExpense = useCreatePersonalExpense();
  const deleteExpense = useDeleteExpense();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>('RON');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(todayISO());

  const monthLabel = new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric' }).format(
    new Date(`${month}T00:00:00`),
  );

  /* Mixed-currency months are summed per currency — never across currencies. */
  const totalsByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses ?? []) m.set(e.currency, (m.get(e.currency) ?? 0) + e.amount);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const multiCurrency = totalsByCurrency.length > 1;
  const primaryCurrency = totalsByCurrency[0]?.[0] ?? currency;

  const byCategory = useMemo(() => {
    const totals = new Map<string, { category: ExpenseCategory; currency: string; sum: number }>();
    for (const e of expenses ?? []) {
      const key = `${e.category}|${e.currency}`;
      const entry = totals.get(key) ?? { category: e.category, currency: e.currency, sum: 0 };
      entry.sum += e.amount;
      totals.set(key, entry);
    }
    return [...totals.values()].sort((a, b) => b.sum - a.sum);
  }, [expenses]);

  const topCategory = byCategory.find((c) => c.currency === primaryCurrency);
  const groupById = useMemo(() => new Map((groups ?? []).map((g) => [g.id, g])), [groups]);

  function currencyTotal(cur: string): number {
    return totalsByCurrency.find(([c]) => c === cur)?.[1] ?? 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createExpense.mutate(
      { description, amount: Number(amount), category, currency, expenseDate: date },
      {
        onSuccess: () => {
          setDescription('');
          setAmount('');
        },
      },
    );
  }

  return (
    <Bento>
      <HeroTile $static>
        <CardTitle>Total cheltuit</CardTitle>
        <div>
          {totalsByCurrency.length === 0 ? (
            <HeroNumber data-money>{formatMoney(0, currency, 'ro-RO')}</HeroNumber>
          ) : (
            totalsByCurrency.map(([cur, sum], i) => (
              <HeroNumber key={cur} $secondary={i > 0} data-money>
                {formatMoney(sum, cur, 'ro-RO')}
              </HeroNumber>
            ))
          )}
        </div>
        <MonthNav>
          <Button
            $variant="ghost"
            $size="sm"
            aria-label="Luna anterioară"
            onClick={() => setMonthOffset((o) => o - 1)}
          >
            <Icon name="chevronLeft" size={18} />
          </Button>
          <MonthLabel>{monthLabel}</MonthLabel>
          <Button
            $variant="ghost"
            $size="sm"
            aria-label="Luna următoare"
            onClick={() => setMonthOffset((o) => o + 1)}
            disabled={monthOffset >= 0}
          >
            <Icon name="chevronRight" size={18} />
          </Button>
        </MonthNav>
      </HeroTile>

      <StatTile $area="count">
        <CardTitle>Tranzacții</CardTitle>
        <StatValue>{(expenses ?? []).length}</StatValue>
        <StatHint>în {monthLabel}</StatHint>
      </StatTile>

      <StatTile $area="topcat">
        <CardTitle>Top categorie</CardTitle>
        <StatValue>
          {topCategory ? CATEGORY_LABELS[topCategory.category] : '—'}
        </StatValue>
        <StatHint data-money>
          {topCategory ? formatMoney(topCategory.sum, topCategory.currency, 'ro-RO') : 'nimic încă'}
        </StatHint>
      </StatTile>

      <FormCard $static>
        <CardTitle>Adaugă cheltuială</CardTitle>
        <FormGrid onSubmit={onSubmit}>
          <Input
            label="Descriere"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            label="Sumă"
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Select label="Monedă" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
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
          <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button type="submit" disabled={createExpense.isPending} style={{ alignSelf: 'stretch' }}>
            {createExpense.isPending ? 'Se salvează…' : '+ Adaugă'}
          </Button>
        </FormGrid>
        {createExpense.isError && (
          <Muted role="alert">Eroare: {(createExpense.error as Error).message}</Muted>
        )}
      </FormCard>

      <CatsCard $static>
        <CardTitle>Pe categorii</CardTitle>
        {byCategory.length === 0 ? (
          <Muted>Nimic de afișat luna asta.</Muted>
        ) : (
          <List>
            {byCategory.map((c) => (
              <CatRow key={`${c.category}|${c.currency}`}>
                <CatHead>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name={c.category} size={16} />
                    {CATEGORY_LABELS[c.category]}
                    {multiCurrency ? ` (${c.currency})` : ''}
                  </span>
                  <Amount data-money>{formatMoney(c.sum, c.currency, 'ro-RO')}</Amount>
                </CatHead>
                <MeterTrack>
                  <MeterFill
                    $pct={
                      currencyTotal(c.currency) > 0 ? (c.sum / currencyTotal(c.currency)) * 100 : 0
                    }
                  />
                </MeterTrack>
              </CatRow>
            ))}
          </List>
        )}
      </CatsCard>

      <ListCard $static>
        <ListHead>
          <CardTitle>
            {viewMode === 'monthly' ? `Istoric — ${monthLabel}` : 'Pe evenimente (grupuri)'}
          </CardTitle>
          <Segments role="tablist" aria-label="Mod de afișare">
            <SegButton
              type="button"
              $active={viewMode === 'monthly'}
              onClick={() => setViewMode('monthly')}
            >
              Lunar
            </SegButton>
            <SegButton
              type="button"
              $active={viewMode === 'events'}
              onClick={() => setViewMode('events')}
            >
              Evenimente
            </SegButton>
          </Segments>
        </ListHead>

        {viewMode === 'monthly' ? (
          isLoading ? (
            <Muted>Se încarcă…</Muted>
          ) : (expenses ?? []).length === 0 ? (
            <Muted>Nicio cheltuială în luna asta. Adaugă prima mai sus.</Muted>
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
                      {CATEGORY_LABELS[e.category]} ·{' '}
                      {new Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium' }).format(
                        new Date(`${e.expense_date}T00:00:00`),
                      )}
                    </RowMeta>
                  </RowMain>
                  <Amount data-money>{formatMoney(e.amount, e.currency, 'ro-RO')}</Amount>
                  <Button
                    $variant="ghost"
                    $size="sm"
                    aria-label={`Șterge ${e.description}`}
                    onClick={() => deleteExpense.mutate({ id: e.id, group_id: e.group_id })}
                  >
                    <Icon name="close" size={15} />
                  </Button>
                </FeedRow>
              ))}
            </List>
          )
        ) : (eventBalances ?? []).length === 0 ? (
          <Muted>
            Niciun eveniment încă. Creează un grup din pagina <Link to="/groups">Grupuri</Link>.
          </Muted>
        ) : (
          <List>
            {(eventBalances ?? []).map((b) => {
              const g = groupById.get(b.group_id);
              const cur = g?.currency ?? 'EUR';
              return (
                <li key={b.group_id}>
                  <EventRow to={`/groups/${b.group_id}`}>
                    <IconBubble aria-hidden>
                      <Icon name="flag" size={19} />
                    </IconBubble>
                    <RowMain>
                      <RowTitle>{g?.name ?? 'Grup'}</RowTitle>
                      <RowMeta data-money>
                        partea ta: {formatMoney(b.total_owed, cur, 'ro-RO')} · ai plătit:{' '}
                        {formatMoney(b.total_paid, cur, 'ro-RO')}
                      </RowMeta>
                    </RowMain>
                    <BalancePill $negative={b.net_balance < 0} data-money>
                      {b.net_balance > 0 ? '+' : ''}
                      {formatMoney(b.net_balance, cur, 'ro-RO')}
                    </BalancePill>
                  </EventRow>
                </li>
              );
            })}
          </List>
        )}
      </ListCard>
    </Bento>
  );
}
