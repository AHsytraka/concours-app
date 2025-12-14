import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader } from '../../components/common';
import { eventService } from '../../services/api';

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

const FilterTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: all ${({ theme }) => theme.transitions.fast};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.textInverse : theme.colors.textLight};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.backgroundDark};
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EventCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.default};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const EventHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, ${({ $color }) => $color}15, ${({ $color }) => $color}05);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const EventTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EventBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.backgroundDark};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ $percentage, theme }) => 
    $percentage > 80 ? theme.colors.success : 
    $percentage > 50 ? theme.colors.warning : 
    theme.colors.primary};
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
`;

const EventFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textLight};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}20;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
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
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
  }

  p {
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
  }
`;

const getStatusConfig = (status) => {
  const configs = {
    draft: { variant: 'neutral', label: 'Brouillon', icon: Edit2, color: '#6b7280' },
    open: { variant: 'success', label: 'Ouvert', icon: CheckCircle, color: '#10b981' },
    closed: { variant: 'warning', label: 'Fermé', icon: XCircle, color: '#f59e0b' },
    completed: { variant: 'info', label: 'Terminé', icon: AlertCircle, color: '#3b82f6' }
  };
  return configs[status] || configs.draft;
};

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concours ?')) {
      try {
        await eventService.delete(eventId);
        setEvents(events.filter(e => e.id !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (loading) {
    return (
      <UniversityLayout pageTitle="Mes concours">
        <Loader text="Chargement des concours..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Mes concours">
      <PageHeader>
        <PageTitle>Mes concours</PageTitle>
        <HeaderActions>
          <SearchBar>
            <Search />
            <input 
              type="text" 
              placeholder="Rechercher un concours..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          <Button as={Link} to="/university/events/create" variant="primary">
            <Plus size={16} />
            Nouveau concours
          </Button>
        </HeaderActions>
      </PageHeader>

      <FilterTabs>
        <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>
          Tous ({events.length})
        </FilterTab>
        <FilterTab $active={filter === 'open'} onClick={() => setFilter('open')}>
          Ouverts ({events.filter(e => e.status === 'open').length})
        </FilterTab>
        <FilterTab $active={filter === 'draft'} onClick={() => setFilter('draft')}>
          Brouillons ({events.filter(e => e.status === 'draft').length})
        </FilterTab>
        <FilterTab $active={filter === 'closed'} onClick={() => setFilter('closed')}>
          Fermés ({events.filter(e => e.status === 'closed').length})
        </FilterTab>
        <FilterTab $active={filter === 'completed'} onClick={() => setFilter('completed')}>
          Terminés ({events.filter(e => e.status === 'completed').length})
        </FilterTab>
      </FilterTabs>

      {filteredEvents.length === 0 ? (
        <Card>
          <EmptyState>
            <Calendar />
            <h3>Aucun concours trouvé</h3>
            <p>
              {filter === 'all' 
                ? "Vous n'avez pas encore créé de concours. Cliquez sur 'Nouveau concours' dans le menu pour en créer un."
                : `Aucun concours avec le statut "${getStatusConfig(filter).label}".`
              }
            </p>
          </EmptyState>
        </Card>
      ) : (
        <EventsGrid>
          {filteredEvents.map(event => {
            const statusConfig = getStatusConfig(event.status);
            const progress = (event.registrations / event.maxRegistrations) * 100;

            return (
              <EventCard key={event.id}>
                <EventHeader $color={statusConfig.color}>
                  <EventTitle>{event.name}</EventTitle>
                  <EventMeta>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    <MetaItem>
                      <Clock />
                      {event.deadline && format(new Date(event.deadline), 'dd MMM yyyy', { locale: fr })}
                    </MetaItem>
                  </EventMeta>
                </EventHeader>

                <EventBody>
                  <StatsRow>
                    <StatItem>
                      <StatValue>{event.registrations || 0}</StatValue>
                      <StatLabel>Inscrits</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{event.maxRegistrations || 0}</StatValue>
                      <StatLabel>Places</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{Math.round(progress)}%</StatValue>
                      <StatLabel>Remplissage</StatLabel>
                    </StatItem>
                  </StatsRow>

                  <ProgressBar>
                    <ProgressFill $percentage={progress} />
                  </ProgressBar>
                </EventBody>

                <EventFooter>
                  <Button 
                    as={Link} 
                    to={`/university/events/${event.id}`} 
                    variant="primary" 
                    size="sm"
                  >
                    <Eye size={16} />
                    Voir détails
                  </Button>
                  <ActionButtons>
                    <IconButton as={Link} to={`/university/events/${event.id}/edit`}>
                      <Edit2 />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(event.id)}>
                      <Trash2 />
                    </IconButton>
                  </ActionButtons>
                </EventFooter>
              </EventCard>
            );
          })}
        </EventsGrid>
      )}
    </UniversityLayout>
  );
};

export default Events;
