import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  Calendar, FileText, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Bell, Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/layout';
import { Card, Badge, Button, Loader } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { eventService, registrationService } from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const WelcomeText = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SubText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textLight};
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const StatCardContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ color }) => `${color}15`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatInfo = styled.div``;

const StatValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const SectionLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  &:hover {
    text-decoration: underline;
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EventCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const EventCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EventTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const EventInstitution = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const EventMetaItem = styled.span`
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

const RegistrationCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const RegistrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const RegistrationTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const RegistrationStatus = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const RegistrationMeta = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
`;

const RegistrationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ color }) => `${color}15`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
`;

const NotificationTime = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.textLight};
`;

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { variant: 'warning', label: 'En attente' },
    validated: { variant: 'success', label: 'Validée' },
    rejected: { variant: 'error', label: 'Refusée' },
    cancelled: { variant: 'neutral', label: 'Annulée' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    validatedRegistrations: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, registrationsRes] = await Promise.all([
          eventService.getAll({ status: 'open', limit: 5 }),
          registrationService.getMyRegistrations()
        ]);

        setEvents(eventsRes.data?.content || eventsRes.data || []);
        setRegistrations(registrationsRes.data || []);

        // Calculate stats
        const regs = registrationsRes.data || [];
        setStats({
          totalRegistrations: regs.length,
          pendingRegistrations: regs.filter(r => r.status === 'pending').length,
          validatedRegistrations: regs.filter(r => r.status === 'validated').length,
          upcomingEvents: (eventsRes.data?.content || eventsRes.data || []).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <Loader text="Chargement du tableau de bord..." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <PageHeader>
        <WelcomeText>Bonjour, {user?.firstName || 'Candidat'} 👋</WelcomeText>
        <SubText>Voici un résumé de vos activités et des concours disponibles</SubText>
      </PageHeader>

      <DashboardGrid>
        <StatCard>
          <StatCardContent>
            <StatIcon color="#3b82f6">
              <FileText />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.totalRegistrations}</StatValue>
              <StatLabel>Total inscriptions</StatLabel>
            </StatInfo>
          </StatCardContent>
        </StatCard>

        <StatCard>
          <StatCardContent>
            <StatIcon color="#f59e0b">
              <Clock />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.pendingRegistrations}</StatValue>
              <StatLabel>En attente</StatLabel>
            </StatInfo>
          </StatCardContent>
        </StatCard>

        <StatCard>
          <StatCardContent>
            <StatIcon color="#10b981">
              <CheckCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.validatedRegistrations}</StatValue>
              <StatLabel>Validées</StatLabel>
            </StatInfo>
          </StatCardContent>
        </StatCard>

        <StatCard>
          <StatCardContent>
            <StatIcon color="#8b5cf6">
              <Calendar />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.upcomingEvents}</StatValue>
              <StatLabel>Concours ouverts</StatLabel>
            </StatInfo>
          </StatCardContent>
        </StatCard>
      </DashboardGrid>

      <ContentGrid>
        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>Concours disponibles</SectionTitle>
              <SectionLink to="/student/events">
                Voir tout <ChevronRight size={16} />
              </SectionLink>
            </SectionHeader>

            <EventList>
              {events.length === 0 ? (
                <Card>
                  <EmptyState>
                    <Calendar size={48} />
                    <p>Aucun concours disponible pour le moment</p>
                  </EmptyState>
                </Card>
              ) : (
                events.slice(0, 3).map(event => (
                  <EventCard key={event.id} as={Link} to={`/student/events/${event.id}`}>
                    <EventCardHeader>
                      <div>
                        <EventTitle>{event.name}</EventTitle>
                        <EventInstitution>{event.institutionName}</EventInstitution>
                      </div>
                      <Badge variant="success">Ouvert</Badge>
                    </EventCardHeader>
                    <EventMeta>
                      <EventMetaItem>
                        <Calendar />
                        {event.deadline && format(new Date(event.deadline), 'dd MMM yyyy', { locale: fr })}
                      </EventMetaItem>
                      <EventMetaItem>
                        <Award />
                        {event.availableSeats} places
                      </EventMetaItem>
                    </EventMeta>
                  </EventCard>
                ))
              )}
            </EventList>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Mes inscriptions récentes</SectionTitle>
              <SectionLink to="/student/registrations">
                Voir tout <ChevronRight size={16} />
              </SectionLink>
            </SectionHeader>

            <EventList>
              {registrations.length === 0 ? (
                <Card>
                  <EmptyState>
                    <FileText size={48} />
                    <p>Vous n'avez pas encore d'inscriptions</p>
                    <Button as={Link} to="/student/events" variant="primary" style={{ marginTop: '1rem' }}>
                      Parcourir les concours
                    </Button>
                  </EmptyState>
                </Card>
              ) : (
                registrations.slice(0, 3).map(reg => (
                  <RegistrationCard key={reg.id}>
                    <RegistrationHeader>
                      <RegistrationTitle>{reg.eventName}</RegistrationTitle>
                      {getStatusBadge(reg.status)}
                    </RegistrationHeader>
                    <RegistrationStatus>
                      <RegistrationMeta>
                        N° d'inscription: {reg.registrationNumber}
                      </RegistrationMeta>
                      <RegistrationMeta>
                        Inscrit le {reg.createdAt && format(new Date(reg.createdAt), 'dd/MM/yyyy')}
                      </RegistrationMeta>
                    </RegistrationStatus>
                    {reg.status === 'validated' && (
                      <RegistrationActions>
                        <Button size="sm" variant="secondary">
                          Télécharger convocation
                        </Button>
                      </RegistrationActions>
                    )}
                  </RegistrationCard>
                ))
              )}
            </EventList>
          </Section>
        </div>

        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>Notifications</SectionTitle>
            </SectionHeader>

            <Card>
              <NotificationList>
                <NotificationItem>
                  <NotificationIcon color="#10b981">
                    <CheckCircle />
                  </NotificationIcon>
                  <NotificationContent>
                    <NotificationText>
                      Votre inscription au concours a été validée
                    </NotificationText>
                    <NotificationTime>Il y a 2 heures</NotificationTime>
                  </NotificationContent>
                </NotificationItem>
                <NotificationItem>
                  <NotificationIcon color="#3b82f6">
                    <Bell />
                  </NotificationIcon>
                  <NotificationContent>
                    <NotificationText>
                      Nouveau concours disponible: INSCAE 2024
                    </NotificationText>
                    <NotificationTime>Hier</NotificationTime>
                  </NotificationContent>
                </NotificationItem>
                <NotificationItem>
                  <NotificationIcon color="#f59e0b">
                    <AlertCircle />
                  </NotificationIcon>
                  <NotificationContent>
                    <NotificationText>
                      Date limite d'inscription dans 3 jours
                    </NotificationText>
                    <NotificationTime>Il y a 2 jours</NotificationTime>
                  </NotificationContent>
                </NotificationItem>
              </NotificationList>
            </Card>
          </Section>
        </div>
      </ContentGrid>
    </StudentLayout>
  );
};

export default StudentDashboard;
