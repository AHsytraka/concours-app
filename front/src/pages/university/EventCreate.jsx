import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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
  AlertTriangle
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

const FileUploadText = styled.div`
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0;
  }
`;

const UploadedFile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const FileName = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const RemoveFileButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.error}15;
  }
`;

const SubjectsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
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

const EventCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [decreeFile, setDecreeFile] = useState(null);
  const [subjects, setSubjects] = useState([{ name: '', coefficient: 1 }]);
  const [locations, setLocations] = useState(['']);
  const [eliminatorySubjects, setEliminatorySubjects] = useState([]);

  const { 
    register, 
    handleSubmit, 
    control,
    watch,
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
      // Deliberation rules for CONTEST
      noteEliminatoire: 5,
      moyenneMinimum: 10,
      criteresSpecifiques: '',
      waitlistPercentage: 20,
      // Selection criteria for SELECTION
      criteresTexte: '',
      minSelectionScore: 50
    }
  });

  const selectedEventType = watch('eventType');

  // Toggle eliminatory subject
  const toggleEliminatorySubject = (subjectName) => {
    if (eliminatorySubjects.includes(subjectName)) {
      setEliminatorySubjects(eliminatorySubjects.filter(s => s !== subjectName));
    } else {
      setEliminatorySubjects([...eliminatorySubjects, subjectName]);
    }
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('level', data.level);
      formData.append('maxRegistrations', data.maxRegistrations);
      formData.append('registrationFee', data.registrationFee);
      formData.append('deadline', data.deadline);
      formData.append('eventType', data.eventType);
      
      // Deliberation rules
      const deliberationRules = {
        eventType: data.eventType,
        moyenneMinimum: data.moyenneMinimum,
        nombrePlaces: data.maxRegistrations,
        waitlistPercentage: data.waitlistPercentage
      };

      // Only add exam fields for CONTEST type
      if (data.eventType === 'CONTEST') {
        formData.append('examDate', data.examDate);
        formData.append('examEndDate', data.examEndDate);
        formData.append('locations', JSON.stringify(locations.filter(l => l.trim())));
        formData.append('subjects', JSON.stringify(subjects.filter(s => s.name)));
        
        // Contest-specific deliberation rules
        deliberationRules.noteEliminatoire = data.noteEliminatoire;
        deliberationRules.criteresSpecifiques = data.criteresSpecifiques;
        deliberationRules.matieresEliminatoires = eliminatorySubjects;
      } else {
        // Selection-specific criteria
        deliberationRules.criteresTexte = data.criteresTexte;
        deliberationRules.minSelectionScore = data.minSelectionScore;
      }
      
      formData.append('deliberationRules', JSON.stringify(deliberationRules));
      
      if (decreeFile) {
        formData.append('decreeFile', decreeFile);
      }

      await eventService.create(formData);
      navigate('/university/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversityLayout pageTitle="Créer un événement">
      <PageHeader>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
        <PageTitle>Créer un nouvel événement</PageTitle>
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
                  <Label>Nombre de places *</Label>
                  <Input
                    type="number"
                    {...register('maxRegistrations', { 
                      required: 'Le nombre de places est requis',
                      min: { value: 1, message: 'Minimum 1 place' }
                    })}
                    error={errors.maxRegistrations?.message}
                  />
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

            {/* Deliberation Rules Section */}
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

              <FileUploadArea $hasFile={!!decreeFile}>
                <input 
                  type="file" 
                  id="decreeFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="decreeFile" style={{ cursor: 'pointer', display: 'block' }}>
                  <FileUploadIcon>
                    <Upload size={24} />
                  </FileUploadIcon>
                  <FileUploadText>
                    <h4>Importer l'arrêté</h4>
                    <p>PDF, DOC ou DOCX</p>
                  </FileUploadText>
                </label>
              </FileUploadArea>

              {decreeFile && (
                <UploadedFile>
                  <FileName>
                    <FileText size={18} />
                    {decreeFile.name}
                  </FileName>
                  <RemoveFileButton onClick={removeFile}>
                    <X size={18} />
                  </RemoveFileButton>
                </UploadedFile>
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
                    <li>Ajoutez toutes les matières du concours avec leurs coefficients</li>
                    <li>Ajoutez tous les lieux d'examen disponibles</li>
                    <li>La date limite d'inscription doit être avant la date de l'examen</li>
                  </>
                ) : (
                  <li>Les candidats seront sélectionnés sur dossier</li>
                )}
                <li>L'événement sera créé en mode "Brouillon" par défaut</li>
              </InfoList>
            </InfoCard>

            <ActionButtons>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size="sm" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Créer
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

export default EventCreate;
