import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Download,
  Mail,
  Search,
  Filter,
  Eye,
  FileText,
  User,
  Phone,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader } from '../../components/common';
import { eventService } from '../../services/api';

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textLight};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const HeaderInfo = styled.div``;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ $color, theme }) => $color || theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Section = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const SectionBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  flex: 1;
  max-width: 300px;

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
    width: 16px;
    height: 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.backgroundAlt};

  th {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textLight};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:hover {
      background: ${({ theme }) => theme.colors.backgroundAlt};
    }

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CandidateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight}30;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CandidateName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CandidateEmail = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textLight};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}20;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const InfoContent = styled.div``;

const InfoLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const SubjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SubjectItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const SubjectName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const SubjectCoef = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }

  p {
    margin: 0;
  }
`;

const getStatusConfig = (status) => {
  const configs = {
    draft: { variant: 'neutral', label: 'Brouillon', color: '#6b7280' },
    open: { variant: 'success', label: 'Ouvert', color: '#10b981' },
    closed: { variant: 'warning', label: 'Fermé', color: '#f59e0b' },
    completed: { variant: 'info', label: 'Terminé', color: '#3b82f6' }
  };
  return configs[status] || configs.draft;
};

const getRegistrationStatusConfig = (status) => {
  const configs = {
    pending: { variant: 'warning', label: 'En attente' },
    validated: { variant: 'success', label: 'Validée' },
    rejected: { variant: 'error', label: 'Rejetée' }
  };
  return configs[status] || configs.pending;
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingRegistrations, setTogglingRegistrations] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      const [eventRes, registrationsRes] = await Promise.all([
        eventService.getById(id),
        eventService.getRegistrations(id)
      ]);

      setEvent(eventRes.data);
      setRegistrations(registrationsRes.data || []);
    } catch (error) {
      console.error('Error fetching event:', error);
      setEvent(null);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await eventService.update(id, { status: newStatus });
      setEvent({ ...event, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleToggleRegistrations = async () => {
    try {
      setTogglingRegistrations(true);
      const response = await eventService.toggleRegistrations(id);
      setEvent({ ...event, registrationsOpen: response.data.registrationsOpen });
    } catch (error) {
      console.error('Error toggling registrations:', error);
      alert(error.response?.data?.error || 'Erreur lors du changement d\'état des inscriptions');
    } finally {
      setTogglingRegistrations(false);
    }
  };

  const handleValidateRegistration = async (registrationId) => {
    setRegistrations(registrations.map(r => 
      r.id === registrationId ? { ...r, status: 'validated' } : r
    ));
  };

  const handleRejectRegistration = async (registrationId) => {
    setRegistrations(registrations.map(r => 
      r.id === registrationId ? { ...r, status: 'rejected' } : r
    ));
  };

  const filteredRegistrations = registrations.filter(r => {
    const fullName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Check if deadline has passed
  const isDeadlinePassed = event && event.registrationEnd && new Date(event.registrationEnd) < new Date();

  if (loading) {
    return (
      <UniversityLayout pageTitle="Détails du concours">
        <Loader text="Chargement..." />
      </UniversityLayout>
    );
  }

  if (!event) {
    return (
      <UniversityLayout pageTitle="Concours non trouvé">
        <Card>
          <EmptyState>
            <Calendar />
            <p>Concours non trouvé</p>
          </EmptyState>
        </Card>
      </UniversityLayout>
    );
  }

  const statusConfig = getStatusConfig(event.status);
  const validatedCount = registrations.filter(r => r.status === 'validated').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  return (
    <UniversityLayout pageTitle={event.name}>
      <PageHeader>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/university/events')}>
            <ArrowLeft />
          </BackButton>
          <HeaderInfo>
            <PageTitle>{event.name}</PageTitle>
            <EventMeta>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <MetaItem>
                <Calendar />
                {event.examDate && format(new Date(event.examDate), 'dd MMMM yyyy', { locale: fr })}
              </MetaItem>
              <MetaItem>
                <MapPin />
                {event.location}
              </MetaItem>
            </EventMeta>
          </HeaderInfo>
        </HeaderLeft>

        <HeaderActions>
          {event.status === 'draft' && (
            <Button variant="primary" onClick={() => handleStatusChange('open')}>
              <Play size={16} />
              Ouvrir les inscriptions
            </Button>
          )}
          {event.status === 'open' && !isDeadlinePassed && (
            <>
              <Button 
                variant={event.registrationsOpen ? "warning" : "success"}
                onClick={handleToggleRegistrations}
                disabled={togglingRegistrations}
              >
                {event.registrationsOpen ? (
                  <>
                    <Pause size={16} />
                    Fermer les inscriptions
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Ouvrir les inscriptions
                  </>
                )}
              </Button>
            </>
          )}
          {isDeadlinePassed && (
            <Button variant="ghost" disabled title="Date limite dépassée">
              <Clock size={16} />
              Inscriptions fermées
            </Button>
          )}
          <Button as={Link} to={`/university/events/${id}/edit`} variant="outline">
            <Edit2 size={16} />
            Modifier
          </Button>
          <Button variant="ghost" onClick={() => navigate('/university/grades', { state: { eventId: id } })}>
            <Award size={16} />
            Saisir notes
          </Button>
        </HeaderActions>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatValue $color="#3b82f6">{registrations.length}</StatValue>
          <StatLabel>Total inscrits</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue $color="#10b981">{validatedCount}</StatValue>
          <StatLabel>Validées</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue $color="#f59e0b">{pendingCount}</StatValue>
          <StatLabel>En attente</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue $color="#ef4444">{rejectedCount}</StatValue>
          <StatLabel>Rejetées</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>Candidats inscrits ({registrations.length})</SectionTitle>
              <SearchBar>
                <Search />
                <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchBar>
            </SectionHeader>

            {filteredRegistrations.length === 0 ? (
              <SectionBody>
                <EmptyState>
                  <Users />
                  <p>Aucun candidat inscrit</p>
                </EmptyState>
              </SectionBody>
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <th>Candidat</th>
                    <th>Date d'inscription</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredRegistrations.map(registration => {
                    const regStatusConfig = getRegistrationStatusConfig(registration.status);
                    return (
                      <tr key={registration.id}>
                        <td>
                          <CandidateInfo>
                            <Avatar>
                              {getInitials(registration.user?.firstName, registration.user?.lastName)}
                            </Avatar>
                            <div>
                              <CandidateName>
                                {registration.user?.firstName} {registration.user?.lastName}
                              </CandidateName>
                              <CandidateEmail>{registration.user?.email}</CandidateEmail>
                            </div>
                          </CandidateInfo>
                        </td>
                        <td>
                          {registration.createdAt && format(new Date(registration.createdAt), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td>
                          <Badge variant={regStatusConfig.variant}>{regStatusConfig.label}</Badge>
                        </td>
                        <td>
                          <ActionButtons>
                            <IconButton title="Voir dossier">
                              <Eye />
                            </IconButton>
                            {registration.status === 'pending' && (
                              <>
                                <IconButton 
                                  title="Valider"
                                  onClick={() => handleValidateRegistration(registration.id)}
                                  style={{ color: '#10b981' }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </>
                            )}
                            <IconButton title="Envoyer email">
                              <Mail />
                            </IconButton>
                          </ActionButtons>
                        </td>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Section>
        </div>

        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>Informations</SectionTitle>
            </SectionHeader>
            <SectionBody>
              <InfoList>
                <InfoItem>
                  <Calendar />
                  <InfoContent>
                    <InfoLabel>Date limite d'inscription</InfoLabel>
                    <InfoValue>
                      {event.registrationEnd && format(new Date(event.registrationEnd), 'dd MMMM yyyy', { locale: fr })}
                    </InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem>
                  <Calendar />
                  <InfoContent>
                    <InfoLabel>Date de l'examen</InfoLabel>
                    <InfoValue>
                      {event.contestDate && format(new Date(event.contestDate), 'dd MMMM yyyy', { locale: fr })}
                      {event.contestEndDate && ` - ${format(new Date(event.contestEndDate), 'dd MMMM yyyy', { locale: fr })}`}
                    </InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem>
                  <MapPin />
                  <InfoContent>
                    <InfoLabel>Lieu</InfoLabel>
                    <InfoValue>{event.locations?.join(', ') || 'Non défini'}</InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem>
                  <Users />
                  <InfoContent>
                    <InfoLabel>Places disponibles</InfoLabel>
                    <InfoValue>{event.registrationCount || 0} inscrits / {event.maxAdmissions || '∞'} places</InfoValue>
                  </InfoContent>
                </InfoItem>
                <InfoItem>
                  <FileText />
                  <InfoContent>
                    <InfoLabel>Frais d'inscription</InfoLabel>
                    <InfoValue>{event.registrationFee?.toLocaleString() || 0} Ar</InfoValue>
                  </InfoContent>
                </InfoItem>
              </InfoList>
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Matières</SectionTitle>
            </SectionHeader>
            <SectionBody>
              {event.subjects?.length > 0 ? (
                <SubjectsList>
                  {event.subjects.map((subject, index) => (
                    <SubjectItem key={index}>
                      <SubjectName>{subject.name}</SubjectName>
                      <SubjectCoef>Coef. {subject.coefficient}</SubjectCoef>
                    </SubjectItem>
                  ))}
                </SubjectsList>
              ) : (
                <EmptyState>
                  <p>Aucune matière définie</p>
                </EmptyState>
              )}
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Actions</SectionTitle>
            </SectionHeader>
            <SectionBody>
              <Button variant="outline" style={{ width: '100%', marginBottom: '0.5rem' }}>
                <Download size={16} />
                Exporter la liste
              </Button>
              <Button variant="outline" style={{ width: '100%' }}>
                <Mail size={16} />
                Envoyer convocations
              </Button>
            </SectionBody>
          </Section>
        </div>
      </ContentGrid>
    </UniversityLayout>
  );
};

export default EventDetail;
