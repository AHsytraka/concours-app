import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, GraduationCap, FileText, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr';
import StudentLayout from '../../components/layout/StudentLayout';
import { Card, Button, Loader, Badge, Alert } from '../../components/common';
import { eventService } from '../../services/api';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EventCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  transition: all ${({ theme }) => theme.transitions.fast};
  border: 2px solid ${({ theme, $disabled }) => $disabled ? theme.colors.border : 'transparent'};
  opacity: ${({ theme, $disabled }) => $disabled ? 0.6 : 1};
  cursor: ${({ theme, $disabled }) => $disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    ${({ $disabled }) => !$disabled && `
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    `}
  }
`;

const EventTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const EventDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    width: 16px;
    height: 16px;
  }
`;

const SeriesBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EligibilityText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme, $eligible }) => $eligible ? theme.colors.success : theme.colors.warning};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`;

const StudentCourseRegistrations = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentSeries, setStudentSeries] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get available events filtered by student's bac series from API
        const response = await fetch('/api/students/available-events', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des concours');
        }
        
        const data = await response.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Erreur lors du chargement des concours disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const checkEligibility = (event) => {
    // API already filters by eligibility, but we can also check here
    return event.isEligible;
  };

  const isDeadlinePassed = (event) => {
    if (!event.registrationEnd) return false;
    return new Date(event.registrationEnd) < new Date();
  };

  const handleRegisterClick = (eventId) => {
    navigate(`/student/register-event/${eventId}`);
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Inscriptions aux concours">
        <Loader text="Chargement des concours..." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Inscriptions aux concours">
      <PageContainer>
        <PageHeader>
          <PageTitle>Concours disponibles</PageTitle>
          <PageSubtitle>Sélectionnez un concours pour vous inscrire</PageSubtitle>
        </PageHeader>

        {error && (
          <Alert variant="error" style={{ marginBottom: '2rem' }}>
            {error}
          </Alert>
        )}

        {events.length === 0 ? (
          <Card>
            <EmptyState>
              <GraduationCap />
              <h3>Aucun concours disponible</h3>
              <p>Il n'y a actuellement pas de concours disponibles pour vous.</p>
            </EmptyState>
          </Card>
        ) : (
          <EventsGrid>
            {events.map(event => {
              const eligible = checkEligibility(event);
              const deadlinePassed = isDeadlinePassed(event);
              const disabled = !eligible || deadlinePassed;

              return (
                <EventCard key={event.id} $disabled={disabled}>
                  <EventTitle>{event.title}</EventTitle>
                  <EventDescription>{event.description}</EventDescription>

                  {event.eligibleSeries && event.eligibleSeries.length > 0 && (
                    <SeriesBadges>
                      {event.eligibleSeries.map(series => (
                        <Badge key={series} variant={eligible && event.eligibleSeries.includes(studentSeries) ? 'success' : 'default'}>
                          {series}
                        </Badge>
                      ))}
                    </SeriesBadges>
                  )}

                  <EventMeta>
                    <MetaItem>
                      <Calendar />
                      <span>Limite d'inscription: {format(parseISO(event.registrationEnd), 'dd MMM yyyy', { locale: fr })}</span>
                    </MetaItem>
                    {event.contestDate && (
                      <MetaItem>
                        <MapPin />
                        <span>Examen: {format(parseISO(event.contestDate), 'dd MMM yyyy', { locale: fr })}</span>
                      </MetaItem>
                    )}
                    {event.level && (
                      <MetaItem>
                        <GraduationCap />
                        <span>Niveau: {event.level}</span>
                      </MetaItem>
                    )}
                  </EventMeta>

                  <StatusContainer>
                    {!eligible && (
                      <EligibilityText $eligible={false}>
                        <AlertCircle />
                        Pas éligible - Série non acceptée
                      </EligibilityText>
                    )}
                    {eligible && deadlinePassed && (
                      <EligibilityText $eligible={false}>
                        <AlertCircle />
                        Inscriptions fermées
                      </EligibilityText>
                    )}
                    {eligible && !deadlinePassed && (
                      <EligibilityText $eligible={true}>
                        Inscriptions ouvertes
                      </EligibilityText>
                    )}
                  </StatusContainer>

                  <ActionButtons>
                    {!disabled && (
                      <Button
                        variant="primary"
                        onClick={() => handleRegisterClick(event.id)}
                        style={{ flex: 1 }}
                      >
                        <FileText size={18} />
                        S'inscrire
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{ flex: 1 }}
                    >
                      Détails
                    </Button>
                  </ActionButtons>
                </EventCard>
              );
            })}
          </EventsGrid>
        )}
      </PageContainer>
    </StudentLayout>
  );
};

export default StudentCourseRegistrations;
