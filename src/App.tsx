import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeModeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';

const Shell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: ${({ theme }) => theme.breakpoints.lg};
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.lg};
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.brand.primary};
`;

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { mode, toggle } = useThemeMode();

  return (
    <Shell>
      <TopBar>
        <Logo>SettleUp</Logo>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button $variant="ghost" onClick={toggle} aria-label="Toggle color theme">
            {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </Button>
          {user && (
            <Button $variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          )}
        </div>
      </TopBar>

      <Card>
        <CardTitle>Welcome</CardTitle>
        {loading ? (
          <p>Loading session…</p>
        ) : user ? (
          <p>
            Signed in as <strong>{user.email}</strong>. Wire your routes here: dashboard (personal
            expenses), groups, and the settlement view.
          </p>
        ) : (
          <p>
            Not signed in. Build the auth screen with <code>useAuth().signInWithEmail</code> /{' '}
            <code>signUpWithEmail</code>, then add routes with react-router.
          </p>
        )}
      </Card>
    </Shell>
  );
}
