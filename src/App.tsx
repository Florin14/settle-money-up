import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeModeContext';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import AuthPage from '@/features/auth/AuthPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import GroupsPage from '@/features/groups/GroupsPage';
import GroupDetailPage from '@/features/groups/GroupDetailPage';

const Shell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.glass.bgStrong};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

/* The mark is an "=" — Equi, equality, settled balances. */
const LogoMark = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.brand.primary};

  &::before,
  &::after {
    content: '';
    width: 14px;
    height: 3px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.text.onBrand};
  }
`;

const Wordmark = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.heading};
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.xxs};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.background.sunken};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};

  /* on phones the nav drops to its own full-width row */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 3;
    width: 100%;
    justify-content: center;

    a {
      flex: 1;
      text-align: center;
    }
  }

  a {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    border-radius: ${({ theme }) => theme.radii.full};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    transition:
      color ${({ theme }) => theme.transitions.fast},
      background ${({ theme }) => theme.transitions.fast},
      box-shadow ${({ theme }) => theme.transitions.normal};

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }

    &.active {
      color: ${({ theme }) => theme.colors.brand.primary};
      background: ${({ theme }) => theme.colors.brand.subtle};
    }
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.xl};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Centered = styled.div`
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 50vh;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { mode, toggle } = useThemeMode();

  const themeButton = (
    <Button $variant="ghost" $size="sm" onClick={toggle} aria-label="Schimbă tema">
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={18} />
    </Button>
  );

  if (loading) {
    return <Centered>Se încarcă…</Centered>;
  }

  if (!user) {
    return <AuthPage themeButton={themeButton} />;
  }

  return (
    <Shell>
      <TopBar>
        <Brand>
          <LogoMark aria-hidden />
          <Wordmark>Equi</Wordmark>
        </Brand>
        <Nav>
          <NavLink to="/" end>
            Cheltuielile mele
          </NavLink>
          <NavLink to="/groups">Grupuri</NavLink>
        </Nav>
        <Actions>
          {themeButton}
          <Button $variant="secondary" $size="sm" onClick={() => void signOut()}>
            <Icon name="signOut" size={16} />
            Ieși din cont
          </Button>
        </Actions>
      </TopBar>

      <Main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Main>
    </Shell>
  );
}
