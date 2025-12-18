import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, FileText, Upload, AlertCircle, CheckCircle, Info, Clock, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr';
import StudentLayout from '../../components/layout/StudentLayout';
import { Card, Button, Input, Loader, Alert } from '../../components/common';
import { eventService } from '../../services/api';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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
  border: none;
  background: transparent;
  cursor: pointer;

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

const FormSection = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};

  .required {
    color: ${({ theme }) => theme.colors.error};
    margin-left: ${({ theme }) => theme.spacing.xs};
  }
`;

const HintText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
`;

const FileUploadArea = styled.div`
  border: 2px dashed ${({ theme, $hasFile }) => $hasFile ? theme.colors.success : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  background: ${({ theme, $hasFile }) => $hasFile ? `${theme.colors.success}10` : theme.colors.backgroundAlt};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}10;
  }

  input {
    display: none;
  }
`;

const FileUploadIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadedFile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.success}15;
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const FileName = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  svg {
    color: ${({ theme }) => theme.colors.success};
  }
`;

const RemoveButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.error}15;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const EventInfo = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primaryLight}10;
  border-color: ${({ theme }) => theme.colors.primary}30;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EventTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const ReleveSelectionCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: #f0fdf4;
  border-color: #22c55e;
  border: 1px solid #22c55e;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ReleveSelectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ReleveSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ReleveOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid #e5e7eb;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;

  input[type="radio"] {
    cursor: pointer;
  }

  &:has(input:checked) {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  &:hover {
    border-color: #22c55e;
  }
`;

const ReleveOptionLabel = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ReleveSeriesLabel = styled.strong`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const ReleveStatusBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background: ${({ $verified }) => $verified ? '#22c55e' : '#fbbf24'};
  color: white;
  font-weight: 500;
`;

const WarningAlert = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ReleveRequirement = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: #f59e0b;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
`;

const ReleveRequirementText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #854d0e;

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

const StudentEventRegister = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [releveFile, setReleveFile] = useState(null);
  const [bordereauFile, setBordereauFile] = useState(null);
  
  // Releve de notes state
  const [studentReleves, setStudentReleves] = useState([]);
  const [selectedReleve, setSelectedReleve] = useState(null);
  const [releveWarning, setReleveWarning] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      numeroBordereau: '',
    }
  });

  const numeroBordereau = watch('numeroBordereau');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const eventRes = await eventService.getById(eventId);
        setEvent(eventRes.data);
        
        // Fetch student's relever de notes
        const relevesRes = await fetch('/api/students/releve-de-notes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (relevesRes.ok) {
          const releves = await relevesRes.json();
          setStudentReleves(Array.isArray(releves) ? releves : releves.data || []);
          
          // Auto-select first verified releve if event has series restrictions
          if (eventRes.data.eligibleSeries && eventRes.data.eligibleSeries.length > 0) {
            const verifiedReleves = releves.filter(r => r.verified && eventRes.data.eligibleSeries.includes(r.series));
            if (verifiedReleves.length > 0) {
              setSelectedReleve(verifiedReleves[0].id);
            } else {
              const availableReleves = releves.filter(r => eventRes.data.eligibleSeries.includes(r.series));
              if (availableReleves.length > 0) {
                setReleveWarning(`Vous avez uploadé un relevé pour la série ${availableReleves[0].series}, mais il n'a pas encore été vérifié par l'administration.`);
              } else {
                setReleveWarning(`Ce concours requiert une série spécifique (${eventRes.data.eligibleSeries.join(', ')}), mais vous n'avez pas uploadé de relevé pour cette série.`);
              }
            }
          } else if (releves.length > 0) {
            // No series restriction - just select first verified
            const verified = releves.find(r => r.verified);
            if (verified) {
              setSelectedReleve(verified.id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleReleveUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setError('Le relevé doit être en PDF, JPG ou PNG');
        return;
      }
      setReleveFile(file);
      setError('');
    }
  };

  const handleBordereauUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        setError('Le bordereau doit être en PDF, JPG ou PNG');
        return;
      }
      setBordereauFile(file);
      setError('');
    }
  };

  const onSubmit = async (data) => {
    // Validate selected releve de notes
    if (!selectedReleve) {
      setError('Vous devez sélectionner un relevé de notes uploadé');
      return;
    }

    // Verify selected releve exists and is verified
    const releve = studentReleves.find(r => r.id === selectedReleve);
    if (!releve) {
      setError('Le relevé de notes sélectionné n\'existe pas');
      return;
    }
    if (!releve.verified) {
      setError('Le relevé de notes sélectionné n\'a pas encore été vérifié par l\'administration');
      return;
    }

    // Validate bordereau file
    if (!bordereauFile) {
      setError('Le bordereau de versement est requis');
      return;
    }
    if (!numeroBordereau.trim()) {
      setError('Le numéro du bordereau est requis');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('releveDeNotesId', selectedReleve);
      formData.append('bacSeries', releve.series);
      formData.append('bordereauFile', bordereauFile);
      formData.append('numeroBordereau', numeroBordereau);

      // Call API to register student for event
      const response = await fetch(`/api/students/events/${eventId}/register`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Erreur lors de l\'inscription');
        return;
      }
      
      // Success - navigate back to registrations list
      navigate('/student/registrations', { 
        state: { success: 'Inscription enregistrée avec succès!' } 
      });
    } catch (err) {
      setError('Erreur lors de l\'inscription: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="S'inscrire à un concours">
        <Loader text="Chargement du concours..." />
      </StudentLayout>
    );
  }

  if (!event) {
    return (
      <StudentLayout pageTitle="S'inscrire à un concours">
        <PageContainer>
          <Alert variant="error">Le concours n'a pas pu être trouvé</Alert>
          <Button onClick={() => navigate('/student/registrations')} variant="outline" style={{ marginTop: '1rem' }}>
            Retour
          </Button>
        </PageContainer>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="S'inscrire à un concours">
      <PageContainer>
        <PageHeader>
          <BackButton onClick={() => navigate('/student/registrations')}>
            <ArrowLeft />
          </BackButton>
          <PageTitle>Inscription au concours</PageTitle>
        </PageHeader>

        <EventInfo>
          <EventTitle>{event.title}</EventTitle>
          <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
            Limite d'inscription: {format(parseISO(event.registrationEnd), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
          {event.eligibleSeries && event.eligibleSeries.length > 0 && (
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#dc2626' }}>
              <strong>Séries requises:</strong> {event.eligibleSeries.join(', ')}
            </p>
          )}
        </EventInfo>

        {error && (
          <Alert variant="error" style={{ marginBottom: '2rem' }}>
            {error}
          </Alert>
        )}

        {releveWarning && (
          <ReleveRequirement>
            <AlertCircle />
            <ReleveRequirementText>
              <strong>Attention - Relevé de notes</strong>
              {releveWarning}
            </ReleveRequirementText>
          </ReleveRequirement>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Releve de notes selection */}
          {studentReleves.length > 0 && (
            <ReleveSelectionCard>
              <ReleveSelectionTitle>
                <CheckCircle size={20} style={{ color: '#22c55e' }} />
                Sélectionnez votre relevé de notes
              </ReleveSelectionTitle>
              <ReleveSelectionGrid>
                {studentReleves.map((releve) => (
                  <ReleveOption key={releve.id}>
                    <input
                      type="radio"
                      name="selectedReleve"
                      value={releve.id}
                      checked={selectedReleve === releve.id}
                      onChange={(e) => {
                        setSelectedReleve(parseInt(e.target.value));
                        if (releve.verified) {
                          setReleveWarning('');
                        }
                      }}
                    />
                    <ReleveOptionLabel>
                      <ReleveSeriesLabel>Série {releve.series}</ReleveSeriesLabel>
                      <ReleveStatusBadge $verified={releve.verified}>
                        {releve.verified ? '✓ Vérifié' : '⏱ En attente'}
                      </ReleveStatusBadge>
                    </ReleveOptionLabel>
                  </ReleveOption>
                ))}
              </ReleveSelectionGrid>
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '12px' }}>
                {selectedReleve && studentReleves.find(r => r.id === selectedReleve)?.verified 
                  ? `✓ Vous pouvez procéder avec la série ${studentReleves.find(r => r.id === selectedReleve)?.series}`
                  : 'Sélectionnez un relevé vérifié pour continuer'}
              </p>
            </ReleveSelectionCard>
          )}

          {studentReleves.length === 0 && (
            <WarningAlert variant="warning" style={{ marginBottom: '2rem' }}>
              <AlertCircle size={20} style={{ marginRight: '12px' }} />
              <div>
                <strong>Aucun relevé de notes uploadé</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  Vous devez d'abord uploader un relevé de notes depuis votre profil avant de pouvoir vous inscrire à un concours.
                </p>
              </div>
            </WarningAlert>
          )}

          <FormSection>
            <SectionTitle>
              <FileText size={20} style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
              Documents requis
            </SectionTitle>

            <FormGroup>
              <Label>
                Bordereau de versement (Payment receipt)
                <span className="required">*</span>
              </Label>
              <HintText>Téléchargez votre bordereau de versement/reçu de paiement. Format accepté: PDF, JPG, PNG</HintText>
              <FileUploadArea
                as="label"
                $hasFile={!!bordereauFile}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleBordereauUpload}
                />
                <FileUploadIcon>
                  <Upload size={24} />
                </FileUploadIcon>
                <div>
                  <strong>Cliquez pour sélectionner</strong> ou déposez un fichier
                </div>
              </FileUploadArea>
              {bordereauFile && (
                <UploadedFile>
                  <FileName>
                    <CheckCircle />
                    {bordereauFile.name}
                  </FileName>
                  <RemoveButton onClick={() => setBordereauFile(null)}>×</RemoveButton>
                </UploadedFile>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                Numéro du bordereau
                <span className="required">*</span>
              </Label>
              <HintText>Entrez le numéro de référence du bordereau de versement</HintText>
              <Input
                {...register('numeroBordereau', {
                  required: 'Le numéro du bordereau est requis',
                  minLength: { value: 3, message: 'Le numéro doit contenir au moins 3 caractères' }
                })}
                placeholder="Ex: BR-2024-001234"
                error={errors.numeroBordereau?.message}
              />
            </FormGroup>
          </FormSection>

          <ActionButtons>
            <Button
              variant="outline"
              onClick={() => navigate('/student/registrations')}
              style={{ flex: 1 }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? 'Enregistrement en cours...' : 'S\'inscrire'}
            </Button>
          </ActionButtons>
        </form>
      </PageContainer>
    </StudentLayout>
  );
};

export default StudentEventRegister;
