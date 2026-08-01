import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const Field = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

/**
 * Floating label: rests centered in the field, floats to the top on focus or
 * when the input has content (placeholder=" " powers :placeholder-shown).
 */
const FloatLabel = styled.label`
  position: absolute;
  left: ${({ theme }) => theme.spacing.sm};
  top: 1.05rem;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.muted};
  pointer-events: none;
  transform-origin: left top;
  transition:
    transform ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: 1.55rem ${({ theme }) => theme.spacing.sm} 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.solid : theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.sunken};
  color: ${({ theme }) => theme.colors.text.primary};
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.normal},
    background ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: transparent;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.solid : theme.colors.border.focus};
    box-shadow: ${({ theme, $hasError }) =>
      $hasError ? '0 0 15px rgba(244, 63, 94, 0.25)' : theme.shadows.focusRing};
  }

  &:focus + ${FloatLabel},
  &:not(:placeholder-shown) + ${FloatLabel} {
    transform: translateY(-0.72rem) scale(0.74);
    color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.negative.text : theme.colors.brand.primaryHover};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    letter-spacing: 0.02em;
  }

  /* date/time inputs always render a value — keep the label floated */
  &[type='date'] + ${FloatLabel} {
    transform: translateY(-0.72rem) scale(0.74);
  }

  /* Modern date field: themed popup, tinted indicator, whole field clickable */
  &[type='date'] {
    cursor: pointer;
    color-scheme: ${({ theme }) => theme.mode};
    min-height: 3.1rem;

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.55;
      ${({ theme }) =>
        theme.mode === 'dark' ? 'filter: invert(1) brightness(1.3);' : ''}
      transition: opacity ${({ theme }) => theme.transitions.fast};
    }

    &:hover::-webkit-calendar-picker-indicator,
    &:focus::-webkit-calendar-picker-indicator {
      opacity: 1;
    }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.negative.text};
`;

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, placeholder, onClick, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <Field>
      <StyledInput
        ref={ref}
        id={inputId}
        $hasError={!!error}
        aria-invalid={!!error}
        placeholder={placeholder && placeholder.trim() ? placeholder : ' '}
        onClick={(e) => {
          onClick?.(e);
          // tap anywhere on a date field opens the native picker
          if (rest.type === 'date' && !e.defaultPrevented) {
            const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
            try {
              el.showPicker?.();
            } catch {
              /* showPicker needs a user gesture — the tap itself is one */
            }
          }
        }}
        {...rest}
      />
      {label && <FloatLabel htmlFor={inputId}>{label}</FloatLabel>}
      {error && <ErrorText role="alert">{error}</ErrorText>}
    </Field>
  );
});
