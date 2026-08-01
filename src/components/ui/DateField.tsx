import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Icon } from './Icon';

/**
 * Custom date picker — a quiet popover calendar in the app's own design.
 * The calendar renders in a PORTAL on document.body: ancestor cards animate
 * with transforms (which create stacking contexts and containing blocks), so
 * an in-place absolute popover would be clipped or painted under sibling
 * cards. Desktop: anchored under the trigger; phones: centered, modal-like.
 * Value in/out is always ISO 'YYYY-MM-DD'.
 */

const WEEKDAYS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
const POP_WIDTH = 276;

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Trigger = styled.button<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $open }) => ($open ? theme.colors.border.focus : theme.colors.border.default)};
  background: ${({ theme }) => theme.colors.background.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
  box-shadow: ${({ theme, $open }) => ($open ? theme.shadows.focusRing : 'none')};
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  &:hover:not(:focus) {
    border-color: ${({ theme, $open }) =>
      $open ? theme.colors.border.focus : theme.colors.border.strong};
  }

  svg {
    color: ${({ theme }) => theme.colors.text.muted};
    flex-shrink: 0;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
  background: transparent;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    background: rgba(20, 20, 18, 0.35);
  }
`;

const Pop = styled.div<{ $centered?: boolean }>`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.modal};
  width: ${POP_WIDTH}px;
  max-width: calc(100vw - 1rem);
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: equi-fade-up 180ms ${({ theme }) => theme.transitions.spring} both;

  ${({ $centered }) =>
    $centered &&
    `
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
    width: min(300px, calc(100vw - 2rem));
    animation: none;
  `}
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MonthTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.heading};
  text-transform: capitalize;
`;

const NavBtn = styled.button`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radii.full};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.sunken};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayName = styled.span`
  text-align: center;
  font-size: 0.68rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 4px 0;
`;

const DayBtn = styled.button<{ $selected?: boolean; $today?: boolean }>`
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.text.onBrand : theme.colors.text.primary};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.brand.primary : 'transparent')};
  box-shadow: ${({ theme, $today, $selected }) =>
    $today && !$selected ? `inset 0 0 0 1px ${theme.colors.brand.subtleBorder}` : 'none'};
  transition:
    background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme, $selected }) =>
      $selected ? theme.colors.brand.primaryHover : theme.colors.background.sunken};
  }
`;

const TodayLink = styled.button`
  margin-top: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xxs};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.brand.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    background: ${({ theme }) => theme.colors.brand.subtle};
  }
`;

export interface DateFieldProps {
  label?: string;
  /** ISO date 'YYYY-MM-DD' */
  value: string;
  onChange: (iso: string) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [centered, setCentered] = useState(false);
  const selected = value ? parseISO(value) : new Date();
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  function computePosition() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - POP_WIDTH - 8));
    // open above the trigger when there is no room below
    const top = r.bottom + 340 > window.innerHeight ? Math.max(8, r.top - 346) : r.bottom + 6;
    setPos({ top, left });
  }

  useEffect(() => {
    if (!open) return;

    function onDocDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onReflow() {
      computePosition();
    }

    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('touchstart', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('touchstart', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open]);

  function openCalendar() {
    if (open) {
      setOpen(false);
      return;
    }
    const d = value ? parseISO(value) : new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setCentered(window.matchMedia('(max-width: 480px)').matches);
    computePosition();
    setOpen(true);
  }

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function pick(day: number) {
    onChange(toISO(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  }

  const today = new Date();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Monday-first offset of the 1st of the viewed month
  const leadingBlanks = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const monthTitle = new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric' }).format(
    new Date(viewYear, viewMonth, 1),
  );
  const triggerText = value
    ? new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        parseISO(value),
      )
    : 'Alege data';

  const calendar = open ? (
    <>
      <Backdrop onClick={() => setOpen(false)} />
      <Pop
        ref={popRef}
        role="dialog"
        aria-label="Alege data"
        $centered={centered}
        style={centered ? undefined : { top: pos.top, left: pos.left }}
      >
        <Head>
          <NavBtn type="button" aria-label="Luna anterioară" onClick={() => shiftMonth(-1)}>
            <Icon name="chevronLeft" size={16} />
          </NavBtn>
          <MonthTitle>{monthTitle}</MonthTitle>
          <NavBtn type="button" aria-label="Luna următoare" onClick={() => shiftMonth(1)}>
            <Icon name="chevronRight" size={16} />
          </NavBtn>
        </Head>
        <Grid>
          {WEEKDAYS.map((d) => (
            <DayName key={d}>{d}</DayName>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSelected =
              !!value &&
              selected.getFullYear() === viewYear &&
              selected.getMonth() === viewMonth &&
              selected.getDate() === day;
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === day;
            return (
              <DayBtn
                key={day}
                type="button"
                $selected={isSelected}
                $today={isToday}
                onClick={() => pick(day)}
              >
                {day}
              </DayBtn>
            );
          })}
        </Grid>
        <TodayLink
          type="button"
          onClick={() => {
            onChange(toISO(today));
            setOpen(false);
          }}
        >
          Astăzi
        </TodayLink>
      </Pop>
    </>
  ) : null;

  return (
    <Field>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Trigger
        ref={triggerRef}
        type="button"
        id={id}
        $open={open}
        onClick={openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span data-money>{triggerText}</span>
        <Icon name="calendar" size={16} />
      </Trigger>
      {calendar && createPortal(calendar, document.body)}
    </Field>
  );
}
