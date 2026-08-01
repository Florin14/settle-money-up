import { useState, type FormEvent, type ReactNode } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const Stage = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
`;

const ThemeCorner = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 430px;
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

/* The mark is an "=" — Equi, equality, settled balances. */
const LogoMark = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.brand.primary};
  box-shadow: ${({ theme }) => theme.shadows.glowViolet};

  &::before,
  &::after {
    content: '';
    width: 22px;
    height: 4px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.text.onBrand};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text.heading};
`;

const Tagline = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p<{ $error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, $error }) =>
    $error ? theme.colors.negative.text : theme.colors.positive.text};
`;

const SwitchMode = styled.button`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 100%;
  text-align: center;

  strong {
    color: ${({ theme }) => theme.colors.brand.primary};
  }

  &:hover strong {
    text-decoration: underline;
  }
`;

interface AuthPageProps {
  themeButton?: ReactNode;
}

export default function AuthPage({ themeButton }: AuthPageProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, fullName);
        setInfo('Cont creat! Dacă nu ești logat automat, verifică emailul pentru linkul de confirmare.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare. Încearcă din nou.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stage>
      <ThemeCorner>{themeButton}</ThemeCorner>

      <AuthCard $static>
        <Brand>
          <LogoMark aria-hidden />
          <Title>Equi</Title>
          <Tagline>Split smarter. Settle faster.</Tagline>
        </Brand>

        <Form onSubmit={onSubmit}>
          {mode === 'signup' && (
            <Input
              label="Nume complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Parolă"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
          {error && <Message $error>{error}</Message>}
          {info && <Message>{info}</Message>}
          <Button type="submit" disabled={submitting} $fullWidth $size="lg">
            {submitting ? 'Se procesează…' : mode === 'signin' ? 'Intră în cont' : 'Creează cont'}
          </Button>
        </Form>

        <SwitchMode
          type="button"
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
            setInfo(null);
          }}
        >
          {mode === 'signin' ? (
            <>
              Nu ai cont? <strong>Creează unul</strong>
            </>
          ) : (
            <>
              Ai deja cont? <strong>Autentifică-te</strong>
            </>
          )}
        </SwitchMode>
      </AuthCard>
    </Stage>
  );
}
