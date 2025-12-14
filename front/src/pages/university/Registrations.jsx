import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Download,
  Clock,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader, Select } from '../../components/common';
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
  flex-wrap: wrap;
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

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`;

const FilterSelect = styled(Select)`
  width: 200px;
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
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

const CandidateDetails = styled.div``;

const CandidateName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CandidateEmail = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const EventTag = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme }) => theme.colors.primaryLight}20;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight}40;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ $color, theme }) => $color || theme.colors.textLight};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ $color, theme }) => $color ? `${$color}15` : theme.colors.backgroundDark};
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
    margin: 0;
  }
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primaryLight}10;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SelectedCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const getStatusConfig = (status) => {
  const configs = {
    pending: { variant: 'warning', label: 'En attente', color: '#f59e0b' },
    validated: { variant: 'success', label: 'Validée', color: '#10b981' },
    rejected: { variant: 'error', label: 'Rejetée', color: '#ef4444' }
  };
  return configs[status] || configs.pending;
};

const Registrations = () => {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsRes = await eventService.getMyEvents();
      setEvents(eventsRes.data || []);
      
      // Fetch all registrations for all events
      const allRegistrations = [];
      for (const event of (eventsRes.data || [])) {
        try {
          const regRes = await eventService.getRegistrations(event.id);
          const regsWithEvent = (regRes.data || []).map(r => ({
            ...r,
            event: event
          }));
          allRegistrations.push(...regsWithEvent);
        } catch (e) {
          console.error('Error fetching registrations for event', event.id);
        }
      }
      setRegistrations(allRegistrations);
    } catch (error) {
      console.error('Error fetching data:', error);
      setEvents([]);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesEvent = selectedEvent === 'all' || r.event?.id === parseInt(selectedEvent);
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const fullName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                         r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesStatus && matchesSearch;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    validated: registrations.filter(r => r.status === 'validated').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredRegistrations.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleBulkValidate = () => {
    setRegistrations(registrations.map(r => 
      selectedIds.includes(r.id) ? { ...r, status: 'validated' } : r
    ));
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    setRegistrations(registrations.map(r => 
      selectedIds.includes(r.id) ? { ...r, status: 'rejected' } : r
    ));
    setSelectedIds([]);
  };

  const handleValidate = (id) => {
    setRegistrations(registrations.map(r => 
      r.id === id ? { ...r, status: 'validated' } : r
    ));
  };

  const handleReject = (id) => {
    setRegistrations(registrations.map(r => 
      r.id === id ? { ...r, status: 'rejected' } : r
    ));
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <UniversityLayout pageTitle="Inscriptions">
        <Loader text="Chargement des inscriptions..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Inscriptions">
      <PageHeader>
        <PageTitle>Gestion des inscriptions</PageTitle>
        <HeaderActions>
          <SearchBar>
            <Search />
            <input 
              type="text" 
              placeholder="Rechercher un candidat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          <Button variant="outline">
            <Download size={18} />
            Exporter
          </Button>
        </HeaderActions>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#3b82f6">
            <Users />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total inscriptions</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#f59e0b">
            <Clock />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>En attente</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#10b981">
            <CheckCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.validated}</StatValue>
            <StatLabel>Validées</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#ef4444">
            <XCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>Rejetées</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>



      {selectedIds.length > 0 && (
        <BulkActions>
          <SelectedCount>{selectedIds.length} sélectionné(s)</SelectedCount>
          <Button size="sm" variant="success" onClick={handleBulkValidate}>
            <CheckCircle size={16} />
            Valider
          </Button>
          <Button size="sm" variant="error" onClick={handleBulkReject}>
            <XCircle size={16} />
            Rejeter
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            Annuler
          </Button>
        </BulkActions>
      )}

      <Card>
        {filteredRegistrations.length === 0 ? (
          <EmptyState>
            <Users />
            <h3>Aucune inscription trouvée</h3>
            <p>Modifiez vos filtres pour voir plus de résultats</p>
          </EmptyState>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <th>
                  <input 
                    type="checkbox"
                    checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Candidat</th>
                <th>Concours</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </TableHead>
            <TableBody>
              {filteredRegistrations.map(registration => {
                const statusConfig = getStatusConfig(registration.status);
                return (
                  <tr key={registration.id}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(registration.id)}
                        onChange={(e) => handleSelectOne(registration.id, e.target.checked)}
                      />
                    </td>
                    <td>
                      <CandidateInfo>
                        <Avatar>
                          {getInitials(registration.user?.firstName, registration.user?.lastName)}
                        </Avatar>
                        <CandidateDetails>
                          <CandidateName>
                            {registration.user?.firstName} {registration.user?.lastName}
                          </CandidateName>
                          <CandidateEmail>{registration.user?.email}</CandidateEmail>
                        </CandidateDetails>
                      </CandidateInfo>
                    </td>
                    <td>
                      <EventTag to={`/university/events/${registration.event?.id}`}>
                        <Calendar />
                        {registration.event?.name}
                      </EventTag>
                    </td>
                    <td>
                      {registration.createdAt && format(new Date(registration.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </td>
                    <td>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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
                              $color="#10b981"
                              onClick={() => handleValidate(registration.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton 
                              title="Rejeter" 
                              $color="#ef4444"
                              onClick={() => handleReject(registration.id)}
                            >
                              <XCircle />
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
      </Card>
    </UniversityLayout>
  );
};

export default Registrations;
