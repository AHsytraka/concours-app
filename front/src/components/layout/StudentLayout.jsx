import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Home, 
  Calendar, 
  FileText, 
  User, 
  Bell, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};

  svg {
    width: 28px;
    height: 28px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textLight};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}10;
  }

  ${({ $active, theme }) => $active && `
    background: ${theme.colors.primaryLight}15;
  `}

  svg {
    width: 18px;
    height: 18px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NotificationButton = styled.button`
  position: relative;
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textLight};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}10;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.error};
  border-radius: 50%;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight}30;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const UserInfo = styled.div`
  text-align: left;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const UserRole = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 200px;
  overflow: hidden;
  display: ${({ $open }) => $open ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.textLight};
  }

  ${({ $danger }) => $danger && `
    color: ${({ theme }) => theme.colors.error};
    
    svg {
      color: ${({ theme }) => theme.colors.error};
    }
  `}
`;

const DropdownDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

const MobileMenuButton = styled.button`
  display: none;
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Main = styled.main`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => `${theme.spacing['2xl']} ${theme.spacing.xl}`};
`;

const MainContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const MobileNav = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 200;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    display: ${({ $open }) => $open ? 'flex' : 'none'};
  }
`;

const MobileNavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const MobileNavLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};

  ${({ $active, theme }) => $active && `
    background: ${theme.colors.primaryLight}15;
    color: ${theme.colors.primary};
  `}

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StudentLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/student', label: 'Tableau de bord', icon: Home },
    { path: '/student/profile', label: 'Mon profil', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <LayoutWrapper>
      <Header>
        <HeaderContainer>
          <Logo to="/student">
            <GraduationCap />
            <span>inscription.univ</span>
          </Logo>

          <Nav>
            {navLinks.map(link => (
              <NavLink 
                key={link.path} 
                to={link.path}
                $active={location.pathname === link.path}
              >
                <link.icon />
                {link.label}
              </NavLink>
            ))}
          </Nav>

          <HeaderRight>
            <NotificationButton>
              <Bell />
              <NotificationBadge />
            </NotificationButton>

            <UserMenu>
              <UserMenuButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <UserAvatar>{getInitials(user?.name)}</UserAvatar>
                <UserInfo>
                  <UserName>{user?.name || 'Utilisateur'}</UserName>
                  <UserRole>Candidat</UserRole>
                </UserInfo>
                <ChevronDown size={16} />
              </UserMenuButton>

              <UserMenuDropdown $open={userMenuOpen}>
                <DropdownItem onClick={() => navigate('/student/profile')}>
                  <User />
                  Mon profil
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogout} $danger>
                  <LogOut />
                  Déconnexion
                </DropdownItem>
              </UserMenuDropdown>
            </UserMenu>

            <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </MobileMenuButton>
          </HeaderRight>
        </HeaderContainer>
      </Header>

      <MobileNav $open={mobileMenuOpen}>
        <MobileNavHeader>
          <Logo to="/student" onClick={() => setMobileMenuOpen(false)}>
            <GraduationCap />
            <span>Inscription.univ</span>
          </Logo>
          <MobileMenuButton onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </MobileMenuButton>
        </MobileNavHeader>

        <MobileNavLinks>
          {navLinks.map(link => (
            <MobileNavLink 
              key={link.path} 
              to={link.path}
              $active={location.pathname === link.path}
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon />
              {link.label}
            </MobileNavLink>
          ))}
        </MobileNavLinks>
      </MobileNav>

      <Main>
        <MainContainer>{children}</MainContainer>
      </Main>
    </LayoutWrapper>
  );
};

export default StudentLayout;
