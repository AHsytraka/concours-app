import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Home, 
  Calendar, 
  Users,
  FileText, 
  Settings,
  Bell, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ClipboardList,
  BarChart3,
  UserCog,
  Award,
  FolderOpen
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
`;

const Sidebar = styled.aside`
  width: ${({ $collapsed }) => $collapsed ? '80px' : '280px'};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transitions.default};
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;

  @media (max-width: 1024px) {
    width: ${({ $mobileOpen }) => $mobileOpen ? '280px' : '0'};
    transform: ${({ $mobileOpen }) => $mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarOverlay = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;

  @media (max-width: 1024px) {
    display: ${({ $open }) => $open ? 'block' : 'none'};
  }
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => $collapsed ? 'center' : 'space-between'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textInverse};

  svg {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
`;

const LogoText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  white-space: nowrap;
  overflow: hidden;
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;

const CollapseButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textInverse};
  opacity: 0.7;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'flex'};

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const NavSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textInverse};
  opacity: ${({ $active }) => $active ? 1 : 0.7};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  justify-content: ${({ $collapsed }) => $collapsed ? 'center' : 'flex-start'};
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const NavLinkText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;

const SidebarFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.radii.md};
  justify-content: ${({ $collapsed }) => $collapsed ? 'center' : 'flex-start'};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;

const UserName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserRole = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  opacity: 0.7;
  margin: 0;
`;

const LogoutButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textInverse};
  opacity: 0.7;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'flex'};

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${({ $collapsed }) => $collapsed ? '80px' : '280px'};
  transition: margin-left ${({ theme }) => theme.transitions.default};

  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MobileMenuButton = styled.button`
  display: none;
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const TopBarRight = styled.div`
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

const ContentArea = styled.div`
  padding: ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  min-height: calc(100vh - 65px);
`;

const UniversityLayout = ({ children, pageTitle }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();

  // Check if user is admin (full access) or contest manager (grades only)
  const isAdmin = hasRole(['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN']);
  const isContestManager = hasRole(['CONTEST_MANAGER']);

  // Define nav sections with role restrictions
  const allNavSections = [
    {
      title: 'Principal',
      adminOnly: true,
      links: [
        { path: '/university', label: 'Tableau de bord', icon: Home },
        { path: '/university/statistics', label: 'Statistiques', icon: BarChart3 }
      ]
    },
    {
      title: 'Gestion des concours',
      adminOnly: true,
      links: [
        { path: '/university/events', label: 'Mes concours', icon: Calendar },
        { path: '/university/events/create', label: 'Créer un concours', icon: PlusCircle },
        { path: '/university/registrations', label: 'Inscriptions', icon: ClipboardList },
        { path: '/university/dossiers', label: 'Sélection de dossiers', icon: FolderOpen }
      ]
    },
    {
      title: 'Résultats',
      adminOnly: false,
      links: [
        { path: '/university/grades', label: 'Saisie des notes', icon: FileText, allowedRoles: ['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN', 'CONTEST_MANAGER'] },
        { path: '/university/results', label: 'Publication', icon: Award, allowedRoles: ['UNIVERSITY_ADMIN', 'INSTITUTION_ADMIN'] }
      ]
    },
    {
      title: 'Administration',
      adminOnly: true,
      links: [
        { path: '/university/users', label: 'Utilisateurs', icon: Users },
        { path: '/university/accounts', label: 'Sous-comptes', icon: UserCog },
        { path: '/university/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  // Filter sections based on role
  const navSections = allNavSections
    .filter(section => !section.adminOnly || isAdmin)
    .map(section => ({
      ...section,
      links: section.links.filter(link => {
        if (link.allowedRoles) {
          return hasRole(link.allowedRoles);
        }
        return isAdmin; // Default to admin only if no allowedRoles specified
      })
    }))
    .filter(section => section.links.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCurrentPageTitle = () => {
    if (pageTitle) return pageTitle;
    
    for (const section of navSections) {
      for (const link of section.links) {
        if (location.pathname === link.path) {
          return link.label;
        }
      }
    }
    return 'Tableau de bord';
  };

  return (
    <LayoutWrapper>
      <SidebarOverlay $open={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      
      <Sidebar $collapsed={sidebarCollapsed} $mobileOpen={mobileMenuOpen}>
        <SidebarHeader $collapsed={sidebarCollapsed}>
          <Logo to="/university">
            <GraduationCap />
            <LogoText $collapsed={sidebarCollapsed}>inscription.univ</LogoText>
          </Logo>
          <CollapseButton 
            $collapsed={sidebarCollapsed}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </CollapseButton>
        </SidebarHeader>

        <SidebarContent>
          {navSections.map((section, index) => (
            <NavSection key={index}>
              <NavSectionTitle $collapsed={sidebarCollapsed}>
                {section.title}
              </NavSectionTitle>
              {section.links.map(link => (
                <NavLink 
                  key={link.path}
                  to={link.path}
                  $active={location.pathname === link.path}
                  $collapsed={sidebarCollapsed}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon />
                  <NavLinkText $collapsed={sidebarCollapsed}>{link.label}</NavLinkText>
                </NavLink>
              ))}
            </NavSection>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <UserCard $collapsed={sidebarCollapsed}>
            <UserAvatar>{getInitials(user?.name)}</UserAvatar>
            <UserInfo $collapsed={sidebarCollapsed}>
              <UserName>{user?.name || 'Administrateur'}</UserName>
              <UserRole>{user?.institutionName || 'Établissement'}</UserRole>
            </UserInfo>
            <LogoutButton $collapsed={sidebarCollapsed} onClick={handleLogout}>
              <LogOut size={18} />
            </LogoutButton>
          </UserCard>
        </SidebarFooter>
      </Sidebar>

      <MainContent $collapsed={sidebarCollapsed}>
        <TopBar>
          <TopBarLeft>
            <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
              <ChevronRight size={24} />
            </MobileMenuButton>
            <PageTitle>{getCurrentPageTitle()}</PageTitle>
          </TopBarLeft>

          <TopBarRight>
            <NotificationButton>
              <Bell size={20} />
              <NotificationBadge />
            </NotificationButton>
          </TopBarRight>
        </TopBar>

        <ContentArea>{children}</ContentArea>
      </MainContent>
    </LayoutWrapper>
  );
};

export default UniversityLayout;
