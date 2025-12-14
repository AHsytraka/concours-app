import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { 
  Settings as SettingsIcon,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Upload,
  Trash2,
  Bell,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Input, Loader } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/api';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div``;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textLight};
  background: ${({ $active, theme }) => $active ? `${theme.colors.primary}10` : 'transparent'};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Section = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns || '1fr 1fr'};
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  resize: vertical;
  min-height: 100px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}30;
  }
`;

const LogoUpload = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LogoPreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const LogoActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  input {
    display: none;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ToggleInfo = styled.div``;

const ToggleLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const ToggleDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const Toggle = styled.button`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  position: relative;
  transition: all ${({ theme }) => theme.transitions.fast};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $active }) => $active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all ${({ theme }) => theme.transitions.fast};
  }
`;

const PasswordInput = styled.div`
  position: relative;

  input {
    padding-right: 40px;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DangerZone = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.error}10;
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const DangerTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.error};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const DangerText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNewRegistration: true,
    emailDeadline: true,
    emailResults: false
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await institutionService.getProfile();
      const profile = response.data;
      setValue('name', profile.name);
      setValue('email', profile.email);
      setValue('phone', profile.phone);
      setValue('address', profile.address);
      setValue('website', profile.website);
      setValue('description', profile.description);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitGeneral = async (data) => {
    setSaving(true);
    try {
      await institutionService.updateProfile(data);
      alert('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitSecurity = async (data) => {
    setSaving(true);
    try {
      // API call to change password
      alert('Mot de passe modifié avec succès');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <UniversityLayout pageTitle="Paramètres">
        <Loader text="Chargement..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Paramètres">
      <PageHeader>
        <PageTitle>Paramètres</PageTitle>
      </PageHeader>

      <ContentGrid>
        <Sidebar>
          <Card>
            <NavList>
              <NavItem $active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
                <Building2 />
                Informations générales
              </NavItem>
              <NavItem $active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
                <Bell />
                Notifications
              </NavItem>
              <NavItem $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
                <Lock />
                Sécurité
              </NavItem>
            </NavList>
          </Card>
        </Sidebar>

        <div>
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit(onSubmitGeneral)}>
              <Section>
                <SectionTitle>
                  <Building2 size={20} />
                  Informations de l'établissement
                </SectionTitle>

                <FormGroup style={{ marginBottom: '1.5rem' }}>
                  <Label>Logo</Label>
                  <LogoUpload>
                    <LogoPreview>
                      <Building2 size={32} />
                    </LogoPreview>
                    <LogoActions>
                      <UploadButton>
                        <Upload size={16} />
                        Changer le logo
                        <input type="file" accept="image/*" />
                      </UploadButton>
                      <Button type="button" variant="ghost" size="sm">
                        <Trash2 size={16} />
                        Supprimer
                      </Button>
                    </LogoActions>
                  </LogoUpload>
                </FormGroup>

                <FormGrid>
                  <FormGroup>
                    <Label>Nom de l'établissement</Label>
                    <Input {...register('name', { required: true })} />
                  </FormGroup>
                  <FormGroup>
                    <Label>Site web</Label>
                    <Input {...register('website')} type="url" placeholder="https://..." />
                  </FormGroup>
                </FormGrid>

                <FormGroup style={{ marginTop: '1rem' }}>
                  <Label>Description</Label>
                  <TextArea {...register('description')} placeholder="Description de l'établissement..." />
                </FormGroup>
              </Section>

              <Section>
                <SectionTitle>
                  <Mail size={20} />
                  Coordonnées
                </SectionTitle>

                <FormGrid>
                  <FormGroup>
                    <Label>Email de contact</Label>
                    <Input {...register('email')} type="email" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Téléphone</Label>
                    <Input {...register('phone')} />
                  </FormGroup>
                </FormGrid>

                <FormGroup style={{ marginTop: '1rem' }}>
                  <Label>Adresse</Label>
                  <TextArea {...register('address')} placeholder="Adresse complète..." />
                </FormGroup>

                <ButtonGroup>
                  <Button type="button" variant="outline">Annuler</Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </ButtonGroup>
              </Section>
            </form>
          )}

          {activeTab === 'notifications' && (
            <Section>
              <SectionTitle>
                <Bell size={20} />
                Préférences de notification
              </SectionTitle>

              <ToggleRow>
                <ToggleInfo>
                  <ToggleLabel>Nouvelles inscriptions</ToggleLabel>
                  <ToggleDescription>Recevoir un email pour chaque nouvelle inscription</ToggleDescription>
                </ToggleInfo>
                <Toggle 
                  $active={notifications.emailNewRegistration}
                  onClick={() => toggleNotification('emailNewRegistration')}
                />
              </ToggleRow>

              <ToggleRow>
                <ToggleInfo>
                  <ToggleLabel>Rappels de date limite</ToggleLabel>
                  <ToggleDescription>Recevoir des rappels avant la fin des inscriptions</ToggleDescription>
                </ToggleInfo>
                <Toggle 
                  $active={notifications.emailDeadline}
                  onClick={() => toggleNotification('emailDeadline')}
                />
              </ToggleRow>

              <ToggleRow>
                <ToggleInfo>
                  <ToggleLabel>Publication des résultats</ToggleLabel>
                  <ToggleDescription>Envoyer automatiquement les résultats aux candidats</ToggleDescription>
                </ToggleInfo>
                <Toggle 
                  $active={notifications.emailResults}
                  onClick={() => toggleNotification('emailResults')}
                />
              </ToggleRow>

              <ButtonGroup>
                <Button variant="primary">
                  <Save size={18} />
                  Enregistrer
                </Button>
              </ButtonGroup>
            </Section>
          )}

          {activeTab === 'security' && (
            <>
              <Section>
                <SectionTitle>
                  <Lock size={20} />
                  Changer le mot de passe
                </SectionTitle>

                <FormGrid $columns="1fr">
                  <FormGroup>
                    <Label>Mot de passe actuel</Label>
                    <PasswordInput>
                      <Input type={showPassword ? 'text' : 'password'} />
                      <PasswordToggle 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </PasswordToggle>
                    </PasswordInput>
                  </FormGroup>
                  <FormGroup>
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Confirmer le nouveau mot de passe</Label>
                    <Input type="password" />
                  </FormGroup>
                </FormGrid>

                <ButtonGroup>
                  <Button variant="primary">
                    <Save size={18} />
                    Changer le mot de passe
                  </Button>
                </ButtonGroup>
              </Section>

              <Section>
                <DangerZone>
                  <DangerTitle>
                    <AlertTriangle size={20} />
                    Zone de danger
                  </DangerTitle>
                  <DangerText>
                    La suppression de votre compte est irréversible. Toutes vos données, 
                    concours et inscriptions seront définitivement supprimés.
                  </DangerText>
                  <Button variant="error">
                    <Trash2 size={18} />
                    Supprimer le compte
                  </Button>
                </DangerZone>
              </Section>
            </>
          )}
        </div>
      </ContentGrid>
    </UniversityLayout>
  );
};

export default Settings;
