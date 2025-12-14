import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Save,
  Search,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Calculator,
  Users,
  ArrowLeft
} from 'lucide-react';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader, Select, Input } from '../../components/common';
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
  flex-wrap: wrap;
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

const StatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ $color }) => `${$color}15`};
  border-radius: ${({ theme }) => theme.radii.md};
  
  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ $color }) => $color};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
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
    width: 16px;
    height: 16px;
  }
`;

const GradesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  position: sticky;
  top: 0;
  z-index: 10;

  th {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textLight};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
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
    vertical-align: middle;
  }
`;

const CandidateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 200px;
`;

const CandidateNumber = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  width: 30px;
`;

const CandidateName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const GradeInput = styled.input`
  width: 70px;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme, $invalid }) => $invalid ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight}30;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const AverageCell = styled.td`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ $value, theme }) => 
    $value >= 12 ? theme.colors.success : 
    $value >= 10 ? theme.colors.warning : 
    theme.colors.error};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ $complete, theme }) => $complete ? theme.colors.success : theme.colors.warning}20;
  color: ${({ $complete, theme }) => $complete ? theme.colors.success : theme.colors.warning};

  svg {
    width: 12px;
    height: 12px;
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

const SubjectHeader = styled.th`
  background: ${({ $color }) => `${$color}10`} !important;
  border-left: 3px solid ${({ $color }) => $color} !important;
`;

const Grades = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || '');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [grades, setGrades] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data || []);
      if (location.state?.eventId) {
        setSelectedEventId(location.state.eventId);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventData = async (eventId) => {
    try {
      const [eventRes, registrationsRes] = await Promise.all([
        eventService.getById(eventId),
        eventService.getRegistrations(eventId)
      ]);
      
      setSelectedEvent(eventRes.data);
      const validatedCandidates = (registrationsRes.data || [])
        .filter(r => r.status === 'validated')
        .map((r, index) => ({
          ...r,
          number: index + 1
        }));
      setCandidates(validatedCandidates);
      
      // Initialize grades
      const initialGrades = {};
      validatedCandidates.forEach(c => {
        initialGrades[c.id] = {};
        (eventRes.data?.subjects || []).forEach(s => {
          initialGrades[c.id][s.name] = c.grades?.[s.name] || '';
        });
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setSelectedEvent(null);
      setCandidates([]);
      setGrades({});
    }
  };

  const handleGradeChange = (candidateId, subject, value) => {
    const numValue = value === '' ? '' : Math.min(20, Math.max(0, parseFloat(value) || 0));
    setGrades(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [subject]: numValue
      }
    }));
  };

  const calculateAverage = (candidateId) => {
    const candidateGrades = grades[candidateId] || {};
    const subjects = selectedEvent?.subjects || [];
    
    let totalWeighted = 0;
    let totalCoef = 0;
    let hasAllGrades = true;

    subjects.forEach(subject => {
      const grade = candidateGrades[subject.name];
      if (grade !== '' && !isNaN(grade)) {
        totalWeighted += grade * subject.coefficient;
        totalCoef += subject.coefficient;
      } else {
        hasAllGrades = false;
      }
    });

    if (!hasAllGrades || totalCoef === 0) return null;
    return (totalWeighted / totalCoef).toFixed(2);
  };

  const isComplete = (candidateId) => {
    const candidateGrades = grades[candidateId] || {};
    const subjects = selectedEvent?.subjects || [];
    return subjects.every(s => candidateGrades[s.name] !== '' && !isNaN(candidateGrades[s.name]));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await resultsService.enterGrades(selectedEventId, grades);
      alert('Notes enregistrées avec succès');
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Erreur lors de l\'enregistrement des notes');
    } finally {
      setSaving(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const fullName = `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const completedCount = candidates.filter(c => isComplete(c.id)).length;
  const subjectColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  if (loading) {
    return (
      <UniversityLayout pageTitle="Saisie des notes">
        <Loader text="Chargement..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Saisie des notes">
      <PageHeader>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft />
          </BackButton>
          <PageTitle>Saisie des notes</PageTitle>
        </HeaderLeft>
        <HeaderActions>
          {selectedEvent && (
            <>
              <Button variant="outline">
                <Upload size={18} />
                Importer CSV
              </Button>
              <Button variant="outline">
                <Download size={18} />
                Exporter
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </HeaderActions>
      </PageHeader>



      {selectedEvent ? (
        <>
          <StatsBar>
            <StatItem $color="#3b82f6">
              <Users size={16} />
              <span>{candidates.length} candidats</span>
            </StatItem>
            <StatItem $color="#10b981">
              <CheckCircle size={16} />
              <span>{completedCount} complets</span>
            </StatItem>
            <StatItem $color="#f59e0b">
              <AlertCircle size={16} />
              <span>{candidates.length - completedCount} en attente</span>
            </StatItem>
            <SearchBar>
              <Search />
              <input 
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
          </StatsBar>

          <Card style={{ overflowX: 'auto' }}>
            {filteredCandidates.length === 0 ? (
              <EmptyState>
                <Users />
                <h3>Aucun candidat</h3>
                <p>Aucun candidat validé pour ce concours</p>
              </EmptyState>
            ) : (
              <GradesTable>
                <TableHead>
                  <tr>
                    <th>#</th>
                    <th>Candidat</th>
                    {(selectedEvent.subjects || []).map((subject, index) => (
                      <SubjectHeader 
                        key={subject.name} 
                        $color={subjectColors[index % subjectColors.length]}
                      >
                        {subject.name} (coef. {subject.coefficient})
                      </SubjectHeader>
                    ))}
                    <th>Moyenne</th>
                    <th>Statut</th>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredCandidates.map((candidate, index) => {
                    const average = calculateAverage(candidate.id);
                    const complete = isComplete(candidate.id);
                    
                    return (
                      <tr key={candidate.id}>
                        <td>
                          <CandidateNumber>{index + 1}</CandidateNumber>
                        </td>
                        <td>
                          <CandidateName>
                            {candidate.user?.lastName?.toUpperCase()} {candidate.user?.firstName}
                          </CandidateName>
                        </td>
                        {(selectedEvent.subjects || []).map(subject => (
                          <td key={subject.name}>
                            <GradeInput
                              type="number"
                              min="0"
                              max="20"
                              step="0.25"
                              value={grades[candidate.id]?.[subject.name] ?? ''}
                              onChange={(e) => handleGradeChange(candidate.id, subject.name, e.target.value)}
                              $invalid={
                                grades[candidate.id]?.[subject.name] !== '' && 
                                (grades[candidate.id]?.[subject.name] < 0 || grades[candidate.id]?.[subject.name] > 20)
                              }
                            />
                          </td>
                        ))}
                        <AverageCell $value={average}>
                          {average !== null ? average : '-'}
                        </AverageCell>
                        <td>
                          <StatusBadge $complete={complete}>
                            {complete ? <CheckCircle /> : <AlertCircle />}
                            {complete ? 'Complet' : 'Incomplet'}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </TableBody>
              </GradesTable>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState>
            <Calculator />
            <h3>Sélectionnez un concours</h3>
            <p>Choisissez un concours pour commencer la saisie des notes</p>
          </EmptyState>
        </Card>
      )}
    </UniversityLayout>
  );
};

export default Grades;
