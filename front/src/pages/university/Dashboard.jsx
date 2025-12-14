import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  Calendar, Users, PlusCircle, FileText, 
  Clock, CheckCircle, AlertCircle,
  ChevronRight, BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { UniversityLayout } from '../../components/layout';
import { Card, Badge, Button, Loader } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { eventService, institutionService } from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  border-left: 4px solid ${({ color }) => color};
`;

const StatCardContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const StatInfo = styled.div``;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
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

  svg {
    width: 24px;
    height: 24px;
  }
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

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuickActionCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const QuickActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primaryLight}20;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const QuickActionText = styled.div`
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0;
  }
`;

const EventTable = styled.table`
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

const EventName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const EventDate = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.backgroundDark};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ $percentage, theme }) => 
    $percentage > 80 ? theme.colors.success : 
    $percentage > 50 ? theme.colors.warning : 
    theme.colors.primary};
  width: ${({ $percentage }) => $percentage}%;
  transition: width ${({ theme }) => theme.transitions.default};
`;

const ProgressText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`;

const getStatusBadge = (status) => {
  const statusConfig = {
    draft: { variant: 'neutral', label: 'Brouillon' },
    open: { variant: 'success', label: 'Ouvert' },
    closed: { variant: 'warning', label: 'Fermé' },
    completed: { variant: 'info', label: 'Terminé' }
  };
  const config = statusConfig[status] || statusConfig.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const UniversityDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    pendingValidations: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          eventService.getMyEvents(),
          institutionService.getStatistics()
        ]);

        setEvents(eventsRes.data || []);
        setStats(statsRes.data || {
          totalEvents: (eventsRes.data || []).length,
          activeEvents: (eventsRes.data || []).filter(e => e.status === 'open').length,
          totalRegistrations: 0,
          pendingValidations: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setEvents([]);
        setStats({
          totalEvents: 0,
          activeEvents: 0,
          totalRegistrations: 0,
          pendingValidations: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <UniversityLayout>
        <Loader text="Chargement du tableau de bord..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Tableau de bord">
      <DashboardGrid>
        <StatCard color="#3b82f6">
          <StatCardContent>
            <StatInfo>
              <StatLabel>Total événements</StatLabel>
              <StatValue>{stats.totalEvents}</StatValue>
            </StatInfo>
            <StatIcon color="#3b82f6">
              <Calendar />
            </StatIcon>
          </StatCardContent>
        </StatCard>

        <StatCard color="#10b981">
          <StatCardContent>
            <StatInfo>
              <StatLabel>Événements actifs</StatLabel>
              <StatValue>{stats.activeEvents}</StatValue>
            </StatInfo>
            <StatIcon color="#10b981">
              <CheckCircle />
            </StatIcon>
          </StatCardContent>
        </StatCard>

        <StatCard color="#8b5cf6">
          <StatCardContent>
            <StatInfo>
              <StatLabel>Inscriptions totales</StatLabel>
              <StatValue>{stats.totalRegistrations}</StatValue>
            </StatInfo>
            <StatIcon color="#8b5cf6">
              <Users />
            </StatIcon>
          </StatCardContent>
        </StatCard>

        <StatCard color="#f59e0b">
          <StatCardContent>
            <StatInfo>
              <StatLabel>À valider</StatLabel>
              <StatValue>{stats.pendingValidations}</StatValue>
            </StatInfo>
            <StatIcon color="#f59e0b">
              <AlertCircle />
            </StatIcon>
          </StatCardContent>
        </StatCard>
      </DashboardGrid>

      <QuickActions>
        <QuickActionCard as={Link} to="/university/events/create">
          <QuickActionIcon>
            <PlusCircle />
          </QuickActionIcon>
          <QuickActionText>
            <h4>Créer un événement</h4>
            <p>Nouveau concours ou sélection</p>
          </QuickActionText>
        </QuickActionCard>

        <QuickActionCard as={Link} to="/university/registrations">
          <QuickActionIcon>
            <FileText />
          </QuickActionIcon>
          <QuickActionText>
            <h4>Gérer les inscriptions</h4>
            <p>Valider les candidatures</p>
          </QuickActionText>
        </QuickActionCard>

        <QuickActionCard as={Link} to="/university/statistics">
          <QuickActionIcon>
            <BarChart3 />
          </QuickActionIcon>
          <QuickActionText>
            <h4>Voir les statistiques</h4>
            <p>Analyses et rapports</p>
          </QuickActionText>
        </QuickActionCard>
      </QuickActions>

      <ContentGrid>
        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>Événements récents</SectionTitle>
              <SectionLink to="/university/events">
                Voir tout <ChevronRight size={16} />
              </SectionLink>
            </SectionHeader>

            <Card>
              {events.length === 0 ? (
                <EmptyState>
                  <Calendar size={48} />
                  <p>Aucun événement créé</p>
                  <Button as={Link} to="/university/events/create" variant="primary" style={{ marginTop: '1rem' }}>
                    Créer un événement
                  </Button>
                </EmptyState>
              ) : (
                <EventTable>
                  <TableHead>
                    <tr>
                      <th>Événement</th>
                      <th>Statut</th>
                      <th>Inscriptions</th>
                      <th>Actions</th>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {events.slice(0, 5).map(event => (
                      <tr key={event.id}>
                        <td>
                          <EventName>{event.name}</EventName>
                          <EventDate>
                            Date limite: {event.deadline && format(new Date(event.deadline), 'dd MMM yyyy', { locale: fr })}
                          </EventDate>
                        </td>
                        <td>{getStatusBadge(event.status)}</td>
                        <td>
                          <ProgressBar>
                            <ProgressFill $percentage={(event.registrations / event.maxRegistrations) * 100 || 0} />
                          </ProgressBar>
                          <ProgressText>
                            {event.registrations || 0} / {event.maxRegistrations || 100}
                          </ProgressText>
                        </td>
                        <td>
                          <Button 
                            as={Link} 
                            to={`/university/events/${event.id}`} 
                            size="sm" 
                            variant="ghost"
                          >
                            Voir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </TableBody>
                </EventTable>
              )}
            </Card>
          </Section>
        </div>

        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>Informations</SectionTitle>
            </SectionHeader>

            <Card>
              <Card.Body>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <Clock size={32} style={{ marginBottom: '0.5rem' }} />
                  <p>Aucune activité récente</p>
                </div>
              </Card.Body>
            </Card>
          </Section>
        </div>
      </ContentGrid>
    </UniversityLayout>
  );
};

export default UniversityDashboard;
