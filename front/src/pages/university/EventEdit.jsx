import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  Calendar, 
  FileText, 
  Users, 
  Clock,
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  GraduationCap,
  MapPin,
  Info,
  ClipboardList,
  Scale,
  AlertTriangle,
  Loader as LoaderIcon
} from 'lucide-react';
import { format } from 'date-fns';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Input, Select, Loader } from '../../components/common';
import { eventService } from '../../services/api';

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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled(Card).attrs({ overflow: 'visible' })`
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns || '1fr'};
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

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

const HintText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
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

const SubjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SubjectItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-end;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight}20;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primaryLight}10;
  border-color: ${({ theme }) => theme.colors.primary}30;
`;

const InfoCardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const InfoList = styled.ul`
  list-style: disc;
  padding-left: ${({ theme }) => theme.spacing.lg};
  margin: 0;

  li {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const SeriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SeriesCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $checked }) => $checked ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $checked }) => $checked ? `${theme.colors.primary}10` : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }

  input {
    cursor: pointer;
  }
`;

const SeriesLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const eventLevels = [
  { value: 'L1', label: 'Licence 1 (L1)' },
  { value: 'L2', label: 'Licence 2 (L2)' },
  { value: 'L3', label: 'Licence 3 (L3)' },
  { value: 'M1', label: 'Master 1 (M1)' },
  { value: 'M2', label: 'Master 2 (M2)' },
  { value: 'D', label: 'Doctorat' }
];

const eventTypes = [
  { value: 'CONTEST', label: 'Concours (avec examen)' },
  { value: 'SELECTION', label: 'Sélection de dossier' }
];

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', coefficient: 1 }]);
  const [locations, setLocations] = useState(['']);
  const [eliminatorySubjects, setEliminatorySubjects] = useState([]);
  const [decreeFile, setDecreeFile] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(new Set());

  const { 
    register, 
    handleSubmit, 
    control,
    watch,
    setValue,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      level: 'L1',
      eventType: 'CONTEST',
      maxRegistrations: 100,
      registrationFee: 0,
      examDate: '',
      examEndDate: '',
      deadline: '',
      noteEliminatoire: 5,
      moyenneMinimum: 10,
      criteresSpecifiques: '',
      waitlistPercentage: 20,
      criteresTexte: '',
      minSelectionScore: 50
    }
  });

  const selectedEventType = watch('eventType');

useEffect(() => {
  const fetchEvent = async () => {
    try {
      const res = await eventService.getById(id);
      const event = res.data;
      
      console.log('Fetched event data:', event); // Debug log
      console.log('Event type:', event.eventType);
      console.log('criteresSpecifiques:', event.criteresSpecifiques);
      console.log('matieresEliminatoires:', event.matieresEliminatoires);
      
      // Helper function to extract date from ISO string
      const extractDate = (dateString) => {
        if (!dateString) return '';
        if (typeof dateString === 'string') {
          return dateString.slice(0, 10);
        }
        return '';
      };
      
      // Set form values
      setValue('name', event.name || '');
      setValue('description', event.description || '');
      setValue('level', event.level || 'L1');
      setValue('eventType', event.eventType || 'CONTEST');
      setValue('maxRegistrations', event.maxRegistrations || 100);
      setValue('registrationFee', event.registrationFee || 0);
      setValue('examDate', extractDate(event.examDate));
      setValue('examEndDate', extractDate(event.examEndDate));
      setValue('deadline', extractDate(event.deadline));
      setValue('noteEliminatoire', event.noteEliminatoire || 5);
      setValue('moyenneMinimum', event.moyenneMinimum || 10);
      setValue('waitlistPercentage', event.waitlistPercentage || 20);
      setValue('minSelectionScore', event.minSelectionScore || 50);
      
      // Set eligible series
      if (event.eligibleSeries && Array.isArray(event.eligibleSeries)) {
        setSelectedSeries(new Set(event.eligibleSeries));
      } else if (event.eligibleSeries && typeof event.eligibleSeries === 'object') {
        setSelectedSeries(new Set(Object.values(event.eligibleSeries)));
      }
      
      // Set deliberation rules based on event type
      if (event.eventType === 'CONTEST') {
        // Set criteresSpecifiques - THIS WAS THE BUG!
        console.log('Setting criteresSpecifiques:', event.criteresSpecifiques);
        setValue('criteresSpecifiques', event.criteresSpecifiques || '');
        
        // Set eliminatory subjects from backend response - THIS WAS ALSO THE BUG!
        console.log('Setting matieresEliminatoires:', event.matieresEliminatoires);
        if (Array.isArray(event.matieresEliminatoires) && event.matieresEliminatoires.length > 0) {
          setEliminatorySubjects(event.matieresEliminatoires);
        } else if (event.matieresEliminatoires) {
          // Handle case where it might be a string or object
          setEliminatorySubjects([]);
        } else {
          setEliminatorySubjects([]);
        }
      } else {
        // Handle SELECTION events
        setValue('criteresTexte', event.criteresTexte || '');
      }
      
      // Set subjects - handle both array and object formats
      if (event.subjects && Array.isArray(event.subjects)) {
        const subjectArray = event.subjects.map(s => {
          if (typeof s === 'object' && s.name) {
            return { name: s.name, coefficient: s.coefficient || 1 };
          }
          return s;
        });
        setSubjects(subjectArray.length > 0 ? subjectArray : [{ name: '', coefficient: 1 }]);
      }
      
      // Set locations - handle both array and string values
      if (event.locations && Array.isArray(event.locations)) {
        const locationArray = event.locations.filter(l => l && l.trim());
        setLocations(locationArray.length > 0 ? locationArray : ['']);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError("Erreur lors du chargement du concours.");
    } finally {
      setLoading(false);
    }
  };
  fetchEvent();
}, [id, setValue]);

  const toggleEliminatorySubject = (subjectName) => {
    if (eliminatorySubjects.includes(subjectName)) {
      setEliminatorySubjects(eliminatorySubjects.filter(s => s !== subjectName));
    } else {
      setEliminatorySubjects([...eliminatorySubjects, subjectName]);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', coefficient: 1 }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const addLocation = () => {
    setLocations([...locations, '']);
  };

  const removeLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index, value) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDecreeFile(file);
    }
  };

  const removeFile = () => {
    setDecreeFile(null);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('level', data.level);
      formData.append('maxRegistrations', data.maxRegistrations);
      formData.append('registrationFee', data.registrationFee);
      formData.append('deadline', data.deadline);
      formData.append('eventType', data.eventType);
      formData.append('eligibleSeries', JSON.stringify(Array.from(selectedSeries)));
      
      const deliberationRules = {
        eventType: data.eventType,
        moyenneMinimum: data.moyenneMinimum,
        nombrePlaces: data.maxRegistrations,
        waitlistPercentage: data.waitlistPercentage
      };

      if (data.eventType === 'CONTEST') {
        formData.append('examDate', data.examDate);
        formData.append('examEndDate', data.examEndDate);
        formData.append('locations', JSON.stringify(locations.filter(l => l.trim())));
        formData.append('subjects', JSON.stringify(subjects.filter(s => s.name)));
        
        deliberationRules.noteEliminatoire = data.noteEliminatoire;
        deliberationRules.criteresSpecifiques = data.criteresSpecifiques;
        deliberationRules.matieresEliminatoires = eliminatorySubjects;
      } else {
        deliberationRules.criteresTexte = data.criteresTexte;
        deliberationRules.minSelectionScore = data.minSelectionScore;
      }
      
      formData.append('deliberationRules', JSON.stringify(deliberationRules));
      
      if (decreeFile) {
        formData.append('decreeFile', decreeFile);
      }

      await eventService.update(id, formData);
      navigate(`/university/events/${id}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError("Erreur lors de la modification du concours.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UniversityLayout pageTitle="Modifier un concours">
        <Loader text="Chargement du concours..." />
      </UniversityLayout>
    );
  }

  if (error && loading === false && error.includes('Erreur lors du chargement')) {
    return (
      <UniversityLayout pageTitle="Modifier un concours">
        <Card>
          <p style={{ color: '#ef4444' }}>{error}</p>
          <Button variant="outline" onClick={() => navigate('/university/events')}>
            Retour
          </Button>
        </Card>
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Modifier un concours">
      <PageHeader>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
        <PageTitle>Modifier le concours</PageTitle>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGrid>
          <div>
            <FormSection>
              <SectionTitle>
                <FileText size={20} />
                Informations générales
              </SectionTitle>

              <FormRow>
                <FormGroup>
                  <Label>Nom de l'événement *</Label>
                  <Input
                    {...register('name', { required: 'Le nom est requis' })}
                    placeholder={selectedEventType === 'CONTEST' ? "Ex: Concours d'entrée en L1 Informatique 2024" : "Ex: Sélection Master 2 Big Data 2024"}
                    error={errors.name?.message}
                  />
                </FormGroup>
              </FormRow>

              <FormRow $columns="1fr 1fr">
                <FormGroup>
                  <Label>Niveau *</Label>
                  <Controller
                    name="level"
                    control={control}
                    rules={{ required: 'Le niveau est requis' }}
                    render={({ field }) => (
                      <Select 
                        {...field} 
                        options={eventLevels}
                        error={errors.level?.message}
                      />
                    )}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Type d'événement *</Label>
                  <Controller
                    name="eventType"
                    control={control}
                    rules={{ required: "Le type d'événement est requis" }}
                    render={({ field }) => (
                      <Select 
                        {...field} 
                        options={eventTypes}
                        error={errors.eventType?.message}
                      />
                    )}
                  />
                </FormGroup>
              </FormRow>

              <FormRow $columns="1fr 1fr">
                <FormGroup>
                  <Label>Nombre de places (admissions) *</Label>
                  <Input
                    type="number"
                    {...register('maxRegistrations', { 
                      required: 'Le nombre de places est requis',
                      min: { value: 1, message: 'Minimum 1 place' }
                    })}
                    error={errors.maxRegistrations?.message}
                  />
                  <HintText>Nombre maximum d'étudiants admis après délibération</HintText>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    {...register('description')}
                    placeholder="Description détaillée du concours..."
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Séries du Baccalauréat autorisées</Label>
                  <HintText>Sélectionnez au moins une série pour les candidats éligibles</HintText>
                  <SeriesGrid>
                    {[
                      { value: 'L', label: 'Littéraire (L)' },
                      { value: 'OSE', label: 'OSE' },
                      { value: 'A', label: 'A' },
                      { value: 'A2', label: 'A2' },
                      { value: 'C', label: 'Scientifique (C)' },
                      { value: 'D', label: 'Scientifique (D)' },
                      { value: 'S', label: 'Scientifique (S)' },
                      { value: 'TECHNICAL', label: 'Technique' }
                    ].map(series => (
                      <SeriesCheckbox key={series.value} $checked={selectedSeries.has(series.value)}>
                        <input
                          type="checkbox"
                          checked={selectedSeries.has(series.value)}
                          onChange={(e) => {
                            const newSeries = new Set(selectedSeries);
                            if (e.target.checked) {
                              newSeries.add(series.value);
                            } else {
                              newSeries.delete(series.value);
                            }
                            setSelectedSeries(newSeries);
                          }}
                        />
                        <SeriesLabel>{series.label}</SeriesLabel>
                      </SeriesCheckbox>
                    ))}
                  </SeriesGrid>
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <Calendar size={20} />
                {selectedEventType === 'CONTEST' ? 'Dates et lieux d\'examen' : 'Date limite'}
              </SectionTitle>

              <FormRow $columns={selectedEventType === 'CONTEST' ? '1fr 1fr' : '1fr'}>
                <FormGroup>
                  <Label>Date limite d'inscription *</Label>
                  <Input
                    type="date"
                    {...register('deadline', { required: 'La date limite est requise' })}
                    error={errors.deadline?.message}
                  />
                </FormGroup>

                {selectedEventType === 'CONTEST' && (
                  <FormGroup>
                    <Label>Date de début de l'examen *</Label>
                    <Input
                      type="date"
                      {...register('examDate', { required: selectedEventType === 'CONTEST' ? "La date de début de l'examen est requise" : false })}
                      error={errors.examDate?.message}
                    />
                  </FormGroup>
                )}
              </FormRow>

              {selectedEventType === 'CONTEST' && (
                <>
                  <FormRow $columns="1fr">
                    <FormGroup>
                      <Label>Date de fin de l'examen</Label>
                      <Input
                        type="date"
                        {...register('examEndDate')}
                        error={errors.examEndDate?.message}
                      />
                    </FormGroup>
                  </FormRow>

                  <SectionTitle style={{ marginTop: '1.5rem' }}>
                    <MapPin size={20} />
                    Lieux d'examen
                  </SectionTitle>

                  <SubjectsList>
                    {locations.map((location, index) => (
                      <SubjectItem key={index}>
                        <FormGroup style={{ flex: 1 }}>
                          <Label>Lieu {index + 1}</Label>
                          <Input
                            value={location}
                            onChange={(e) => updateLocation(index, e.target.value)}
                            placeholder="Ex: Campus universitaire, Amphi A"
                          />
                        </FormGroup>
                        {locations.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeLocation(index)}
                          >
                            <X size={18} />
                          </Button>
                        )}
                      </SubjectItem>
                    ))}
                  </SubjectsList>

                  <AddButton type="button" onClick={addLocation}>
                    <Plus size={18} />
                    Ajouter un lieu
                  </AddButton>
                </>
              )}
            </FormSection>

            {selectedEventType === 'CONTEST' && (
              <FormSection>
                <SectionTitle>
                  <GraduationCap size={20} />
                  Matières et coefficients
                </SectionTitle>

                <SubjectsList>
                  {subjects.map((subject, index) => (
                    <SubjectItem key={index}>
                      <FormGroup style={{ flex: 2 }}>
                        <Label>Matière {index + 1}</Label>
                        <Input
                          value={subject.name}
                          onChange={(e) => updateSubject(index, 'name', e.target.value)}
                          placeholder="Nom de la matière"
                        />
                      </FormGroup>
                      <FormGroup style={{ flex: 1 }}>
                        <Label>Coefficient</Label>
                        <Input
                          type="number"
                          value={subject.coefficient}
                          onChange={(e) => updateSubject(index, 'coefficient', Number(e.target.value))}
                          min={1}
                        />
                      </FormGroup>
                      {subjects.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeSubject(index)}
                        >
                          <X size={18} />
                        </Button>
                      )}
                    </SubjectItem>
                  ))}
                </SubjectsList>

                <AddButton type="button" onClick={addSubject}>
                  <Plus size={18} />
                  Ajouter une matière
                </AddButton>
              </FormSection>
            )}

            <FormSection>
              <SectionTitle>
                <Scale size={20} />
                Critères de délibération
              </SectionTitle>

              {selectedEventType === 'CONTEST' ? (
                <>
                  <FormRow $columns="1fr 1fr">
                    <FormGroup>
                      <Label>Note éliminatoire</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...register('noteEliminatoire')}
                        placeholder="5"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Note en dessous de laquelle le candidat est éliminé
                      </span>
                    </FormGroup>

                    <FormGroup>
                      <Label>Moyenne minimum *</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...register('moyenneMinimum', { required: 'La moyenne minimum est requise' })}
                        placeholder="10"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Moyenne requise pour être admis
                      </span>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label>% Liste d'attente</Label>
                      <Input
                        type="number"
                        {...register('waitlistPercentage')}
                        placeholder="20"
                        min={0}
                        max={100}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Pourcentage de candidats en liste d'attente
                      </span>
                    </FormGroup>
                  </FormRow>

                  {subjects.filter(s => s.name).length > 0 && (
                    <FormGroup style={{ marginTop: '1rem' }}>
                      <Label>
                        <AlertTriangle size={16} style={{ marginRight: '0.5rem', color: '#f59e0b' }} />
                        Matières éliminatoires
                      </Label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {subjects.filter(s => s.name).map((subject, index) => (
                          <Button
                            key={index}
                            type="button"
                            size="sm"
                            variant={eliminatorySubjects.includes(subject.name) ? 'primary' : 'outline'}
                            onClick={() => toggleEliminatorySubject(subject.name)}
                          >
                            {subject.name}
                          </Button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', display: 'block' }}>
                        Cliquez sur les matières où une note sous le seuil élimine le candidat
                      </span>
                    </FormGroup>
                  )}

                  <FormRow style={{ marginTop: '1rem' }}>
                    <FormGroup>
                      <Label>Critères spécifiques (optionnel)</Label>
                      <TextArea
                        {...register('criteresSpecifiques')}
                        placeholder="Ex: Priorité aux candidats ayant plus de 12 en mathématiques, bonus pour les mentions..."
                        style={{ minHeight: '80px' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Critères supplémentaires que l'IA appliquera lors de la délibération
                      </span>
                    </FormGroup>
                  </FormRow>
                </>
              ) : (
                <>
                  <FormRow $columns="1fr 1fr">
                    <FormGroup>
                      <Label>Moyenne minimum *</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...register('moyenneMinimum', { required: 'La moyenne minimum est requise' })}
                        placeholder="10"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Score minimum (%)</Label>
                      <Input
                        type="number"
                        {...register('minSelectionScore')}
                        placeholder="50"
                        min={0}
                        max={100}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Score minimum pour être sélectionné
                      </span>
                    </FormGroup>
                  </FormRow>

                  <FormRow style={{ marginTop: '1rem' }}>
                    <FormGroup>
                      <Label>Critères de sélection</Label>
                      <TextArea
                        {...register('criteresTexte')}
                        placeholder="Ex: Bonne maîtrise des mathématiques, rigueur scientifique, expérience en programmation..."
                        style={{ minHeight: '100px' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Décrivez les critères que l'IA utilisera pour évaluer les dossiers
                      </span>
                    </FormGroup>
                  </FormRow>
                </>
              )}
            </FormSection>

            <FormSection>
              <SectionTitle>
                <Users size={20} />
                Frais d'inscription
              </SectionTitle>

              <FormRow $columns="1fr 1fr">
                <FormGroup>
                  <Label>Frais d'inscription (Ar)</Label>
                  <Input
                    type="number"
                    {...register('registrationFee')}
                    placeholder="0"
                  />
                </FormGroup>
              </FormRow>
            </FormSection>
          </div>

          <Sidebar>
            <FormSection>
              <SectionTitle>
                <Upload size={20} />
                Arrêté institutionnel
              </SectionTitle>

              {!decreeFile && (
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Laissez vide si vous ne souhaitez pas modifier le fichier
                </p>
              )}

              <div style={{
                border: `2px dashed ${decreeFile ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '0.5rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: decreeFile ? '#10b98115' : '#f9fafb',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="file" 
                  id="decreeFile"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="decreeFile" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={24} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>Importer l'arrêté</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>PDF, DOC, DOCX ou Image (JPG, PNG)</p>
                </label>
              </div>

              {decreeFile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  borderRadius: '0.375rem',
                  marginTop: '0.75rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1f2937' }}>
                    <FileText size={18} color="#3b82f6" />
                    {decreeFile.name}
                  </span>
                  <button 
                    onClick={removeFile}
                    style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </FormSection>

            <InfoCard>
              <InfoCardTitle>
                <Info />
                Conseils
              </InfoCardTitle>
              <InfoList>
                <li>Remplissez tous les champs obligatoires (*)</li>
                {selectedEventType === 'CONTEST' ? (
                  <>
                    <li>Modifiez les matières du concours et leurs coefficients</li>
                    <li>Modifiez tous les lieux d'examen disponibles</li>
                    <li>La date limite d'inscription doit être avant la date de l'examen</li>
                  </>
                ) : (
                  <li>Les critères de sélection s'appliqueront à l'évaluation des dossiers</li>
                )}
                <li>Les modifications seront appliquées au concours</li>
              </InfoList>
            </InfoCard>

            <ActionButtons>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderIcon size={18} />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer
                  </>
                )}
              </Button>
            </ActionButtons>
          </Sidebar>
        </FormGrid>
      </form>
    </UniversityLayout>
  );
};

export default EventEdit;
