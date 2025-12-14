import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Award,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  Eye,
  Users,
  Trophy,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader, Select } from '../../components/common';
import { eventService, resultsService } from '../../services/api';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
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

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundDark};
    color: ${({ theme }) => theme.colors.text};
  }
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

const EventSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const EventSelect = styled(Select)`
  width: 350px;
`;

const StatusCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  background: ${({ $published, theme }) => 
    $published ? `${theme.colors.success}10` : theme.colors.backgroundAlt};
  border-color: ${({ $published, theme }) => 
    $published ? theme.colors.success : theme.colors.border};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0;
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
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

const RankBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ $rank, theme }) => 
    $rank === 1 ? '#fbbf24' : 
    $rank === 2 ? '#94a3b8' : 
    $rank === 3 ? '#cd7f32' : 
    theme.colors.backgroundDark};
  color: ${({ $rank, theme }) => 
    $rank <= 3 ? '#fff' : theme.colors.text};
`;

const CandidateName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const AverageValue = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ $value, theme }) => 
    $value >= 12 ? theme.colors.success : 
    $value >= 10 ? theme.colors.warning : 
    theme.colors.error};
`;

const ResultBadge = styled(Badge)`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ActionButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
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

const Checklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ $done, theme }) => $done ? `${theme.colors.success}10` : theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  
  svg {
    color: ${({ $done, theme }) => $done ? theme.colors.success : theme.colors.textLight};
  }
  
  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ $done, theme }) => $done ? theme.colors.text : theme.colors.textLight};
  }
`;

const Results = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [results, setResults] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchResults(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([
        { id: 1, name: 'Concours L1 Informatique 2024', status: 'closed', resultsPublished: false, maxRegistrations: 100 },
        { id: 2, name: 'Concours Master IG 2024', status: 'completed', resultsPublished: true, maxRegistrations: 50 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (eventId) => {
    try {
      const [eventRes, resultsRes] = await Promise.all([
        eventService.getById(eventId),
        resultsService.getEventResults(eventId)
      ]);
      setSelectedEvent(eventRes.data);
      setResults(resultsRes.data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setSelectedEvent(null);
      setResults([]);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir publier les résultats ? Cette action est irréversible.')) {
      return;
    }
    
    setPublishing(true);
    try {
      await resultsService.publishResults(selectedEventId);
      setSelectedEvent({ ...selectedEvent, resultsPublished: true });
      alert('Résultats publiés avec succès !');
    } catch (error) {
      console.error('Error publishing results:', error);
      alert('Erreur lors de la publication des résultats');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeliberate = async () => {
    try {
      await resultsService.deliberate(selectedEventId);
      fetchResults(selectedEventId);
      alert('Délibération effectuée');
    } catch (error) {
      console.error('Error during deliberation:', error);
      alert('Erreur lors de la délibération');
    }
  };

  const stats = {
    total: results.length,
    admitted: results.filter(r => r.status === 'admitted').length,
    waitlist: results.filter(r => r.status === 'waitlist').length,
    rejected: results.filter(r => r.status === 'rejected').length
  };

  const getResultConfig = (status) => {
    const configs = {
      admitted: { variant: 'success', label: 'Admis' },
      waitlist: { variant: 'warning', label: 'Liste d\'attente' },
      rejected: { variant: 'error', label: 'Non admis' }
    };
    return configs[status] || configs.rejected;
  };

  // Check preparation status
  const hasAllGrades = results.length > 0 && results.every(r => r.average !== null);
  const hasDeliberated = results.some(r => r.status !== undefined);

  if (loading) {
    return (
      <UniversityLayout pageTitle="Publication des résultats">
        <Loader text="Chargement..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Publication des résultats">
      <PageHeader>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft />
          </BackButton>
          <PageTitle>Publication des résultats</PageTitle>
        </HeaderLeft>
        <HeaderActions>
          {selectedEvent && !selectedEvent.resultsPublished && (
            <Button 
              variant="primary" 
              onClick={handlePublish}
              disabled={publishing || !hasAllGrades || !hasDeliberated}
            >
              <Send size={18} />
              {publishing ? 'Publication...' : 'Publier les résultats'}
            </Button>
          )}
        </HeaderActions>
      </PageHeader>



      {selectedEvent ? (
        <>
          <StatusCard $published={selectedEvent.resultsPublished}>
            <StatusHeader>
              <StatusInfo>
                <StatusIcon $color={selectedEvent.resultsPublished ? '#10b981' : '#f59e0b'}>
                  {selectedEvent.resultsPublished ? <CheckCircle size={24} /> : <Clock size={24} />}
                </StatusIcon>
                <StatusText>
                  <h3>
                    {selectedEvent.resultsPublished 
                      ? 'Résultats publiés' 
                      : 'Résultats non publiés'}
                  </h3>
                  <p>
                    {selectedEvent.resultsPublished 
                      ? 'Les candidats peuvent consulter leurs résultats'
                      : 'Complétez les étapes ci-dessous pour publier'}
                  </p>
                </StatusText>
              </StatusInfo>
              {selectedEvent.resultsPublished && (
                <Badge variant="success">Publié</Badge>
              )}
            </StatusHeader>

            {!selectedEvent.resultsPublished && (
              <Checklist>
                <ChecklistItem $done={hasAllGrades}>
                  {hasAllGrades ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>Toutes les notes sont saisies</span>
                </ChecklistItem>
                <ChecklistItem $done={hasDeliberated}>
                  {hasDeliberated ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>Délibération effectuée</span>
                </ChecklistItem>
              </Checklist>
            )}
          </StatusCard>

          <StatsGrid>
            <StatCard>
              <StatValue $color="#3b82f6">{stats.total}</StatValue>
              <StatLabel>Total candidats</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue $color="#10b981">{stats.admitted}</StatValue>
              <StatLabel>Admis</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue $color="#f59e0b">{stats.waitlist}</StatValue>
              <StatLabel>Liste d'attente</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue $color="#ef4444">{stats.rejected}</StatValue>
              <StatLabel>Non admis</StatLabel>
            </StatCard>
          </StatsGrid>

          <ContentGrid>
            <Section>
              <SectionHeader>
                <SectionTitle>Classement ({results.length})</SectionTitle>
                <Button variant="outline" size="sm">
                  <Download size={16} />
                  Exporter PDF
                </Button>
              </SectionHeader>

              {results.length === 0 ? (
                <EmptyState>
                  <Trophy />
                  <h3>Aucun résultat</h3>
                  <p>Saisissez d'abord les notes des candidats</p>
                </EmptyState>
              ) : (
                <Table>
                  <TableHead>
                    <tr>
                      <th>Rang</th>
                      <th>Candidat</th>
                      <th>Moyenne</th>
                      <th>Résultat</th>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {results.map(result => {
                      const resultConfig = getResultConfig(result.status);
                      return (
                        <tr key={result.id}>
                          <td>
                            <RankBadge $rank={result.rank}>{result.rank}</RankBadge>
                          </td>
                          <td>
                            <CandidateName>
                              {result.user?.lastName?.toUpperCase()} {result.user?.firstName}
                            </CandidateName>
                          </td>
                          <td>
                            <AverageValue $value={result.average}>
                              {result.average?.toFixed(2)} / 20
                            </AverageValue>
                          </td>
                          <td>
                            <ResultBadge variant={resultConfig.variant}>
                              {resultConfig.label}
                            </ResultBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Section>

            <div>
              <Section>
                <SectionHeader>
                  <SectionTitle>Actions</SectionTitle>
                </SectionHeader>
                <ActionsList>
                  <ActionButton 
                    variant="outline"
                    onClick={handleDeliberate}
                    disabled={!hasAllGrades || selectedEvent.resultsPublished}
                  >
                    <Users size={18} />
                    Lancer la délibération
                  </ActionButton>
                  <ActionButton variant="outline">
                    <Eye size={18} />
                    Aperçu du PV
                  </ActionButton>
                  <ActionButton variant="outline">
                    <Download size={18} />
                    Télécharger le PV
                  </ActionButton>
                  <ActionButton variant="outline">
                    <Send size={18} />
                    Notifier les candidats
                  </ActionButton>
                </ActionsList>
              </Section>

              <Section>
                <SectionHeader>
                  <SectionTitle>Paramètres</SectionTitle>
                </SectionHeader>
                <div style={{ padding: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Nombre de places
                    </label>
                    <input 
                      type="number" 
                      value={selectedEvent.maxRegistrations || 100}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem'
                      }}
                      disabled={selectedEvent.resultsPublished}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Note éliminatoire
                    </label>
                    <input 
                      type="number" 
                      defaultValue={0}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem'
                      }}
                      disabled={selectedEvent.resultsPublished}
                    />
                  </div>
                </div>
              </Section>
            </div>
          </ContentGrid>
        </>
      ) : (
        <Card>
          <EmptyState>
            <Award />
            <h3>Sélectionnez un concours</h3>
            <p>Choisissez un concours pour gérer ses résultats</p>
          </EmptyState>
        </Card>
      )}
    </UniversityLayout>
  );
};

export default Results;
