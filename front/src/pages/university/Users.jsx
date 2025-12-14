import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users as UsersIcon, 
  Search, 
  Plus,
  Edit2,
  Trash2,
  Mail,
  Shield,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader } from '../../components/common';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  width: 300px;

  input {
    border: none;
    background: transparent;
    flex: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.text};

    &::placeholder {
      color: ${({ theme }) => theme.colors.textLight};
    }
  }

  svg {
    color: ${({ theme }) => theme.colors.textLight};
    width: 18px;
    height: 18px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    opacity: 0.5;
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    max-width: 400px;
  }
`;

const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textLight};
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }

  td {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  tr:hover td {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const UserDetails = styled.div`
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textLight};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // API call would go here
      setUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           user.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <UniversityLayout pageTitle="Utilisateurs">
        <Loader text="Chargement des utilisateurs..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Utilisateurs">
      <PageHeader>
        <PageTitle>Utilisateurs</PageTitle>
        <HeaderActions>
          <SearchBar>
            <Search />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
        </HeaderActions>
      </PageHeader>

      <Card>
        {filteredUsers.length === 0 ? (
          <EmptyState>
            <UsersIcon />
            <h3>Aucun utilisateur</h3>
            <p>
              {users.length === 0 
                ? "Vous n'avez pas encore d'utilisateurs associés à votre établissement. Les étudiants apparaîtront ici après leur inscription à vos concours."
                : "Aucun utilisateur ne correspond à votre recherche."
              }
            </p>
          </EmptyState>
        ) : (
          <UsersTable>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <UserInfo>
                      <UserAvatar>{getInitials(user.firstName, user.lastName)}</UserAvatar>
                      <UserDetails>
                        <h4>{user.firstName} {user.lastName}</h4>
                        <span>{user.email}</span>
                      </UserDetails>
                    </UserInfo>
                  </td>
                  <td>
                    <Badge variant="info">{user.role || 'Utilisateur'}</Badge>
                  </td>
                  <td>
                    <Badge variant={user.active ? 'success' : 'default'}>
                      {user.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    {user.lastLogin 
                      ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm', { locale: fr })
                      : 'Jamais connecté'
                    }
                  </td>
                  <td>
                    <ActionButtons>
                      <IconButton title="Modifier">
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton title="Envoyer un email">
                        <Mail size={16} />
                      </IconButton>
                      <IconButton title="Supprimer">
                        <Trash2 size={16} />
                      </IconButton>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </UsersTable>
        )}
      </Card>
    </UniversityLayout>
  );
};

export default Users;
