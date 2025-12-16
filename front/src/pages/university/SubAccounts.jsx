import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  UserCog, 
  Search, 
  Plus,
  Edit2,
  Trash2,
  Key,
  Shield,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader } from '../../components/common';
import api from '../../services/api';

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

const InfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => `${theme.colors.info}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.info}30`};
  border-radius: ${({ theme }) => theme.radii.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  svg {
    color: ${({ theme }) => theme.colors.info};
    flex-shrink: 0;
  }

  div {
    h4 {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      font-weight: ${({ theme }) => theme.fontWeights.semibold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0 0 ${({ theme }) => theme.spacing.xs};
    }

    p {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      color: ${({ theme }) => theme.colors.textLight};
      margin: 0;
    }
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

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const AccountCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const AccountHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AccountAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const AccountDetails = styled.div`
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const AccountMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AccountActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled(Button)`
  flex: 1;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  width: 100%;
  max-width: 500px;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin: 0;
  }

  button {
    padding: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.textLight};
    border-radius: ${({ theme }) => theme.radii.sm};
    
    &:hover {
      background: ${({ theme }) => theme.colors.backgroundDark};
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  label {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  input {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }

    &.error {
      border-color: ${({ theme }) => theme.colors.error};
      background: ${({ theme }) => `${theme.colors.error}05`};
    }
  }
`;

const ErrorText = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PhoneInputLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#e5e7eb')};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }
`;

const PhonePrefix = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-right: 1px solid #e5e7eb;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
`;

const PhoneInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  letter-spacing: 1px;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
    letter-spacing: 0;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};

  button {
    flex: 1;
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => `${theme.colors.error}10`};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SubAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{2}\s?\d{2}\s?\d{3}\s?\d{2}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Last name validation
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }

    // Phone validation
    if (formData.phone?.trim()) {
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Numéro de téléphone invalide (minimum 8 caractères)';
      }
    }

    // Password validation (only for new accounts or if password is being changed)
    if (!editingAccount || formData.password) {
      if (!formData.password?.trim()) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/institution/subaccounts');
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching sub-accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        firstName: account.firstName || '',
        lastName: account.lastName || '',
        email: account.email || '',
        phone: account.phone || '',
        password: ''
      });
    } else {
      setEditingAccount(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setError('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (editingAccount) {
        await api.put(`/institution/subaccounts/${editingAccount.id}`, formData);
      } else {
        await api.post('/institution/subaccounts', formData);
      }
      handleCloseModal();
      fetchAccounts();
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sous-compte ?')) return;
    
    try {
      await api.delete(`/institution/subaccounts/${id}`);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting sub-account:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (account) => {
    try {
      await api.put(`/institution/subaccounts/${account.id}`, { isActive: !account.isActive });
      fetchAccounts();
    } catch (error) {
      console.error('Error toggling account status:', error);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const filteredAccounts = accounts.filter(account => {
    const name = `${account.firstName} ${account.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || 
           account.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <UniversityLayout pageTitle="Sous-comptes">
        <Loader text="Chargement des sous-comptes..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Sous-comptes">
      <PageHeader>
        <PageTitle>Sous-comptes</PageTitle>
        <HeaderActions>
          <SearchBar>
            <Search />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Créer un sous-compte
          </Button>
        </HeaderActions>
      </PageHeader>

      <InfoBanner>
        <Shield size={24} />
        <div>
          <h4>À propos des sous-comptes</h4>
          <p>
            Les sous-comptes (Gestionnaires de concours) ont un accès limité à la plateforme. 
            Ils peuvent uniquement accéder à la "Saisie des notes" pour enregistrer les résultats des examens.
          </p>
        </div>
      </InfoBanner>

      {filteredAccounts.length === 0 ? (
        <Card>
          <EmptyState>
            <UserCog />
            <h3>Aucun sous-compte</h3>
            <p>
              {accounts.length === 0 
                ? "Vous n'avez pas encore créé de sous-compte. Les sous-comptes permettent de déléguer la saisie des notes à d'autres utilisateurs."
                : "Aucun sous-compte ne correspond à votre recherche."
              }
            </p>
          </EmptyState>
        </Card>
      ) : (
        <AccountsGrid>
          {filteredAccounts.map(account => (
            <AccountCard key={account.id}>
              <AccountHeader>
                <AccountInfo>
                  <AccountAvatar>{getInitials(account.firstName, account.lastName)}</AccountAvatar>
                  <AccountDetails>
                    <h4>{account.firstName} {account.lastName}</h4>
                    <span>{account.email}</span>
                  </AccountDetails>
                </AccountInfo>
                <Badge variant={account.isActive ? 'success' : 'default'}>
                  {account.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </AccountHeader>

              <AccountMeta>
                <MetaRow>
                  <Shield />
                  <span>Rôle: Gestionnaire de concours</span>
                </MetaRow>
                <MetaRow>
                  <Clock />
                  <span>
                    Créé le {account.createdAt 
                      ? format(new Date(account.createdAt), 'dd/MM/yyyy', { locale: fr })
                      : 'N/A'
                    }
                  </span>
                </MetaRow>
              </AccountMeta>

              <AccountActions>
                <ActionButton size="sm" variant="outline" onClick={() => handleOpenModal(account)}>
                  <Edit2 size={14} />
                  Modifier
                </ActionButton>
                <ActionButton size="sm" variant="outline" onClick={() => handleToggleActive(account)}>
                  <Key size={14} />
                  {account.isActive ? 'Désactiver' : 'Activer'}
                </ActionButton>
                <ActionButton size="sm" variant="outline" onClick={() => handleDelete(account.id)}>
                  <Trash2 size={14} />
                </ActionButton>
              </AccountActions>
            </AccountCard>
          ))}
        </AccountsGrid>
      )}

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingAccount ? 'Modifier le sous-compte' : 'Créer un sous-compte'}</h2>
              <button onClick={handleCloseModal}><X size={20} /></button>
            </ModalHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Prénom du gestionnaire"
                />
                {errors.firstName && (
                  <ErrorText>
                    <AlertCircle />
                    {errors.firstName}
                  </ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Nom de famille"
                />
                {errors.lastName && (
                  <ErrorText>
                    <AlertCircle />
                    {errors.lastName}
                  </ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'error' : ''}
                  placeholder="email@exemple.mg"
                  disabled={!!editingAccount}
                />
                {errors.email && (
                  <ErrorText>
                    <AlertCircle />
                    {errors.email}
                  </ErrorText>
                )}
              </FormGroup>

              <PhoneInputWrapper>
                <PhoneInputLabel>Téléphone</PhoneInputLabel>
                <PhoneInputContainer $hasError={!!errors.phone}>
                  <PhonePrefix>+261</PhonePrefix>
                  <PhoneInput
                    type="tel"
                    value={formData.phone}
                    placeholder="32 11 234 56"
                    maxLength={12}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 9) value = value.slice(0, 9);
                      if (value.length > 7) {
                        value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
                      } else if (value.length > 4) {
                        value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4);
                      } else if (value.length > 2) {
                        value = value.slice(0, 2) + ' ' + value.slice(2);
                      }
                      setFormData({ ...formData, phone: value });
                    }}
                    className={errors.phone ? 'error' : ''}
                  />
                </PhoneInputContainer>
                {errors.phone && (
                  <ErrorText>
                    <AlertCircle />
                    {errors.phone}
                  </ErrorText>
                )}
              </PhoneInputWrapper>

              <FormGroup>
                <label>{editingAccount ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? 'error' : ''}
                  placeholder={editingAccount ? 'Laisser vide pour conserver le mot de passe' : 'Minimum 8 caractères'}
                />
                {errors.password && (
                  <ErrorText>
                    <AlertCircle />
                    {errors.password}
                  </ErrorText>
                )}
              </FormGroup>

              <ModalActions>
                <Button variant="outline" type="button" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'En cours...' : (editingAccount ? 'Mettre à jour' : 'Créer')}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </UniversityLayout>
  );
};

export default SubAccounts;
