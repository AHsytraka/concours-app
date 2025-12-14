import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';

// ShadcnUI-inspired Layout styles
const Header = styled.header`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 50;
`;

const HeaderContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  height: 4rem;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.025em;

  &:hover {
    text-decoration: none;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const LogoText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme, $active }) => $active ? theme.colors.text : theme.colors.textMuted};
  transition: color 150ms;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 100;
  flex-direction: column;
  padding: 1.5rem;

  @media (max-width: 768px) {
    display: ${({ $open }) => $open ? 'flex' : 'none'};
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const MobileNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MobileNavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
  }
`;

const MobileAuthButtons = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Main = styled.main`
  flex: 1;
  min-height: calc(100vh - 4rem);
`;

const Footer = styled.footer`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  padding: 3rem 1.5rem;
`;

const FooterContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div`
  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textInverse};
  }
`;

const FooterLink = styled(Link)`
  display: block;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textInverse};
  opacity: 0.7;
  padding: 0.375rem 0;
  transition: opacity 150ms;
  text-decoration: none;

  &:hover {
    opacity: 1;
    text-decoration: none;
  }
`;

const FooterBottom = styled.div`
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.7;
`;

const PublicLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/events', label: 'Concours' },
    { path: '/about', label: 'À propos' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <>
      <Header>
        <HeaderContainer>
          <Logo to="/">
            <GraduationCap />
            <LogoText>Inscription.univ</LogoText>
          </Logo>

          <Nav>
            {navLinks.map(link => (
              <NavLink 
                key={link.path} 
                to={link.path}
                $active={location.pathname === link.path}
              >
                {link.label}
              </NavLink>
            ))}
          </Nav>

          <AuthButtons>
            <Button as={Link} to="/login" variant="ghost">
              Connexion
            </Button>
            <Button as={Link} to="/register">
              S'inscrire
            </Button>
          </AuthButtons>

          <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </MobileMenuButton>
        </HeaderContainer>
      </Header>

      <MobileMenu $open={mobileMenuOpen}>
        <MobileMenuHeader>
          <Logo to="/" onClick={() => setMobileMenuOpen(false)}>
            <GraduationCap />
            <span>Inscription.univ</span>
          </Logo>
          <MobileMenuButton onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </MobileMenuButton>
        </MobileMenuHeader>

        <MobileNav>
          {navLinks.map(link => (
            <MobileNavLink 
              key={link.path} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </MobileNavLink>
          ))}
        </MobileNav>

        <MobileAuthButtons>
          <Button as={Link} to="/login" variant="secondary" fullWidth onClick={() => setMobileMenuOpen(false)}>
            Connexion
          </Button>
          <Button as={Link} to="/register" fullWidth onClick={() => setMobileMenuOpen(false)}>
            S'inscrire
          </Button>
        </MobileAuthButtons>
      </MobileMenu>

      <Main>{children}</Main>

      <Footer>
        <FooterContainer>
          <FooterGrid>
            <FooterSection>
              <h4>Inscription.univ</h4>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, lineHeight: 1.6 }}>
                Plateforme officielle d'inscription aux concours d'entrée dans les établissements d'enseignement supérieur.
              </p>
            </FooterSection>

            <FooterSection>
              <h4>Liens rapides</h4>
              <FooterLink to="/events">Concours disponibles</FooterLink>
              <FooterLink to="/register/student">Inscription candidat</FooterLink>
              <FooterLink to="/register/university">Espace établissement</FooterLink>
              <FooterLink to="/results">Résultats</FooterLink>
            </FooterSection>

            <FooterSection>
              <h4>Aide</h4>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/guide">Guide d'utilisation</FooterLink>
              <FooterLink to="/contact">Nous contacter</FooterLink>
              <FooterLink to="/support">Support technique</FooterLink>
            </FooterSection>

            <FooterSection>
              <h4>Légal</h4>
              <FooterLink to="/privacy">Politique de confidentialité</FooterLink>
              <FooterLink to="/terms">Conditions d'utilisation</FooterLink>
              <FooterLink to="/cookies">Cookies</FooterLink>
            </FooterSection>
          </FooterGrid>

          <FooterBottom>
            © {new Date().getFullYear()} Inscription.univ. Tous droits réservés.
          </FooterBottom>
        </FooterContainer>
      </Footer>
    </>
  );
};

export default PublicLayout;
