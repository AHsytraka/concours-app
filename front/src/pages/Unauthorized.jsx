import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/common';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  max-width: 450px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => `${theme.colors.error}15`};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: ${({ theme }) => theme.colors.error};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const RoleInfo = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0;

    strong {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const Unauthorized = ({ requiredRole, currentPage }) => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const getRoleName = (role) => {
    const roleNames = {
      'STUDENT': 'Étudiant',
      'INSTITUTION_ADMIN': 'Administrateur d\'établissement',
      'CONTEST_MANAGER': 'Gestionnaire de concours',
      'UNIVERSITY_ADMIN': 'Administrateur universitaire'
    };
    return roleNames[role] || role;
  };

  const getHomeUrl = () => {
    if (hasRole(['INSTITUTION_ADMIN', 'UNIVERSITY_ADMIN'])) {
      return '/university';
    }
    if (hasRole(['CONTEST_MANAGER'])) {
      return '/university/grades';
    }
    if (hasRole(['STUDENT'])) {
      return '/student';
    }
    return '/';
  };

  return (
    <Container>
      <Card>
        <IconWrapper>
          <ShieldX />
        </IconWrapper>
        <Title>Accès non autorisé</Title>
        <Message>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          {currentPage && ` Cette page (${currentPage}) nécessite des privilèges supplémentaires.`}
        </Message>
        
        <RoleInfo>
          <p>
            Votre rôle actuel : <strong>{getRoleName(user?.role)}</strong>
          </p>
          {requiredRole && (
            <p style={{ marginTop: '8px' }}>
              Rôle requis : <strong>{Array.isArray(requiredRole) ? requiredRole.map(getRoleName).join(' ou ') : getRoleName(requiredRole)}</strong>
            </p>
          )}
        </RoleInfo>

        <ButtonGroup>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Retour
          </Button>
          <Button variant="primary" as={Link} to={getHomeUrl()}>
            <Home size={16} />
            Accueil
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default Unauthorized;
