import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Mail, Lock, User, Phone, Calendar, GraduationCap, 
  MapPin, Eye, EyeOff, FileText, ArrowLeft, ArrowRight,
  CheckCircle, Upload, Plus, Trash2, CreditCard
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Select, Alert, Card } from '../../components/common';

// ============ Styled Components ============
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding: 40px 20px;
`;

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #111;
  margin-bottom: 24px;
  text-decoration: none;

  svg {
    width: 40px;
    height: 40px;
  }

  span {
    font-size: 24px;
    font-weight: 700;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

// Stepper
const Stepper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
`;

const StepCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  background: ${({ $active, $completed }) => 
    $completed ? '#111' : $active ? '#111' : '#e5e5e5'};
  color: ${({ $active, $completed }) => 
    $completed || $active ? '#fff' : '#999'};
`;

const StepLabel = styled.span`
  font-size: 14px;
  color: ${({ $active }) => ($active ? '#111' : '#999')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  margin-left: 4px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const StepDivider = styled.div`
  width: 60px;
  height: 2px;
  background: ${({ $completed }) => ($completed ? '#111' : '#e5e5e5')};
  margin: 0 8px;

  @media (max-width: 640px) {
    width: 30px;
  }
`;

// Form
const FormCard = styled(Card)`
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
`;

const LoginPrompt = styled.p`
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 14px;

  a {
    color: #111;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 38px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #111;
  }
`;

// Success
const SuccessContainer = styled.div`
  text-align: center;
  padding: 48px 24px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0fdf4;
  border: 2px solid #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #22c55e;
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
`;

const SuccessText = styled.p`
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

// Upload du fichier
const FileUploadArea = styled.div`
  border: 2px dashed ${({ $hasFile }) => ($hasFile ? '#22c55e' : '#d1d5db')};
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $hasFile }) => ($hasFile ? '#f0fdf4' : '#fafafa')};

  &:hover {
    border-color: ${({ $hasFile }) => ($hasFile ? '#22c55e' : '#111')};
    background: ${({ $hasFile }) => ($hasFile ? '#f0fdf4' : '#f5f5f5')};
  }
`;

const FileUploadInput = styled.input`
  display: none;
`;

const FileUploadIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ $hasFile }) => ($hasFile ? '#dcfce7' : '#f3f4f6')};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${({ $hasFile }) => ($hasFile ? '#22c55e' : '#6b7280')};
`;

const FileUploadText = styled.p`
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const FileUploadHint = styled.span`
  color: #9ca3af;
  font-size: 13px;
`;

const FileName = styled.p`
  color: #111;
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
`;

// Séries de bac multiples
const BacSeriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BacSeriesItem = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
`;

const BacSeriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const BacSeriesTitle = styled.span`
  font-weight: 600;
  color: #374151;
  font-size: 15px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  &:disabled {
    color: #d1d5db;
    cursor: not-allowed;
    background: none;
  }
`;

const AddBacButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #111;
    color: #111;
    background: #fafafa;
  }
`;

// Champ téléphone formaté
const PhoneInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PhoneInputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #111;
  
  span {
    color: #ef4444;
    margin-left: 2px;
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#e5e7eb')};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: #111;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const PhonePrefix = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f3f4f6;
  border-right: 1px solid #e5e7eb;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  
  svg {
    color: #6b7280;
  }
`;

const PhoneInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111;
  background: transparent;
  letter-spacing: 1px;
  
  &::placeholder {
    color: #9ca3af;
    letter-spacing: 0;
  }
`;

const PhoneError = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

// Champ CIN formaté
const CinInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CinInputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #111;
`;

const CinInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#e5e7eb')};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: #111;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const CinIcon = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f3f4f6;
  border-right: 1px solid #e5e7eb;
  color: #6b7280;
`;

const CinInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111;
  background: transparent;
  letter-spacing: 2px;
  
  &::placeholder {
    color: #9ca3af;
    letter-spacing: 1px;
  }
`;

const CinError = styled.span`
  font-size: 12px;
  color: #ef4444;
`;

// ============ Constantes ============
const BAC_SERIES = {
  litteraire: [
    { value: 'L', label: 'Série L' },
    { value: 'OSE', label: 'Série OSE' },
    { value: 'A', label: 'Série A' },
    { value: 'A2', label: 'Série A2' }
  ],
  scientifique: [
    { value: 'C', label: 'Série C' },
    { value: 'D', label: 'Série D' },
    { value: 'S', label: 'Série S' },
    { value: 'Technique', label: 'Série Technique' }
  ]
};

const STEPS = [
  { number: 1, label: 'Informations' },
  { number: 2, label: 'Baccalauréat' },
  { number: 3, label: 'Sécurité' }
];

// ============ Composant Principal ============
const StudentRegister = () => {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // État pour les séries de bac multiples
  const [bacEntries, setBacEntries] = useState([
    { id: 1, type: '', series: '', year: '', number: '' }
  ]);
  
  // État pour le fichier relevé de notes
  const [releveFile, setReleveFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    mode: 'onChange'
  });

  const password = watch('password');

  // Gestion des séries de bac
  const addBacEntry = () => {
    const newId = Math.max(...bacEntries.map(e => e.id)) + 1;
    setBacEntries([...bacEntries, { id: newId, type: '', series: '', year: '', number: '' }]);
  };

  const removeBacEntry = (id) => {
    if (bacEntries.length > 1) {
      setBacEntries(bacEntries.filter(entry => entry.id !== id));
    }
  };

  const updateBacEntry = (id, field, value) => {
    setBacEntries(bacEntries.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        // Reset series if type changes
        if (field === 'type') {
          updated.series = '';
        }
        return updated;
      }
      return entry;
    }));
  };

  const getAvailableSeriesForEntry = (type) => {
    if (!type) return [];
    return BAC_SERIES[type] || [];
  };

  // Gestion de l'upload du relevé (simple, sans IA)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou PDF.');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10MB).');
      return;
    }

    setReleveFile(file);
    setError(null);
  };

  // Validation avant de passer à l'étape suivante
  const validateCurrentStep = async () => {
    setError(null);
    
    if (step === 1) {
      // Valider les champs du formulaire de l'étape 1
      const isValid = await trigger(['firstName', 'lastName', 'email', 'phone', 'birthDate', 'birthPlace', 'address', 'cin']);
      return isValid;
    }
    
    if (step === 2) {
      // Vérifier que chaque entrée de bac est complète
      const incompleteEntries = bacEntries.filter(
        entry => !entry.type || !entry.series || !entry.year || !entry.number
      );
      if (incompleteEntries.length > 0) {
        setError('Veuillez compléter toutes les informations du baccalauréat.');
        return false;
      }
      
      // Vérifier les années
      // Si on est en janvier, l'année max valide est l'année précédente
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0 = January
      const maxValidYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const invalidYears = bacEntries.filter(
        entry => entry.year < 1990 || entry.year > maxValidYear
      );
      if (invalidYears.length > 0) {
        setError('L\'année d\'obtention doit être entre 1990 et ' + maxValidYear + '.');
        return false;
      }
      
      // Le relevé est optionnel mais recommandé
      if (!releveFile) {
        // On peut quand même continuer, juste avertir
        console.warn('Pas de relevé uploadé');
      }
      
      return true;
    }
    
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Préparer les données pour l'inscription
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        address: data.address,
        cin: data.cin || null,
        password: data.password,
        // Données du baccalauréat (format JSON pour les séries multiples)
        bacEntries: JSON.stringify(bacEntries)
      };

      // 1. Créer le compte utilisateur
      const authResponse = await registerStudent(registrationData, releveFile);
      
      setIsSuccess(true);
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage du succès
  if (isSuccess) {
    return (
      <PageWrapper>
        <Container>
          <FormCard>
            <Card.Body>
              <SuccessContainer>
                <SuccessIcon>
                  <CheckCircle size={40} />
                </SuccessIcon>
                <SuccessTitle>Inscription réussie !</SuccessTitle>
                <SuccessText>
                  Votre compte a été créé avec succès. Un email de confirmation 
                  vous a été envoyé. Vérifiez votre boîte de réception pour 
                  activer votre compte.
                </SuccessText>
                <Button as={Link} to="/login" size="lg">
                  Se connecter
                </Button>
              </SuccessContainer>
            </Card.Body>
          </FormCard>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Logo to="/">
            <GraduationCap />
            <span>inscription.univ</span>
          </Logo>
          <Title>Inscription Étudiant</Title>
          <Subtitle>Créez votre compte pour postuler à l'université</Subtitle>
        </Header>

        {/* Stepper */}
        <Stepper>
          {STEPS.map((s, index) => (
            <div key={s.number} style={{ display: 'flex', alignItems: 'center' }}>
              <StepCircle
                $active={step === s.number}
                $completed={step > s.number}
              >
                {step > s.number ? <CheckCircle size={18} /> : s.number}
              </StepCircle>
              <StepLabel $active={step === s.number}>{s.label}</StepLabel>
              {index < STEPS.length - 1 && (
                <StepDivider $completed={step > s.number} />
              )}
            </div>
          ))}
        </Stepper>

        <FormCard>
          <Card.Body>
            {error && (
              <Alert variant="error" style={{ marginBottom: '20px' }}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <FormSection>
                  <SectionTitle>Informations personnelles</SectionTitle>
                  <SectionDescription>
                    Renseignez vos informations personnelles pour créer votre dossier.
                  </SectionDescription>

                  <FormGrid>
                    <Input
                      label="Prénom"
                      placeholder="Votre prénom"
                      icon={<User size={18} />}
                      required
                      error={errors.firstName?.message}
                      {...register('firstName', { required: 'Le prénom est requis' })}
                    />
                    <Input
                      label="Nom"
                      placeholder="Votre nom"
                      icon={<User size={18} />}
                      required
                      error={errors.lastName?.message}
                      {...register('lastName', { required: 'Le nom est requis' })}
                    />
                  </FormGrid>

                  <FormGrid>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="votre@email.com"
                      icon={<Mail size={18} />}
                      required
                      error={errors.email?.message}
                      {...register('email', {
                        required: 'L\'email est requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Adresse email invalide'
                        }
                      })}
                    />
                    <PhoneInputWrapper>
                      <PhoneInputLabel>
                        Téléphone<span>*</span>
                      </PhoneInputLabel>
                      <PhoneInputContainer $hasError={!!errors.phone}>
                        <PhonePrefix>
                          <Phone size={18} />
                          +261
                        </PhonePrefix>
                        <PhoneInput
                          type="tel"
                          placeholder="32 11 234 56"
                          maxLength={12}
                          {...register('phone', {
                            required: 'Le téléphone est requis',
                            pattern: {
                              value: /^\d{2}\s?\d{2}\s?\d{3}\s?\d{2}$/,
                              message: 'Format: XX XX XXX XX'
                            }
                          })}
                          onChange={(e) => {
                            // Auto-format: XX XX XXX XX
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 9) value = value.slice(0, 9);
                            if (value.length > 7) {
                              value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
                            } else if (value.length > 4) {
                              value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4);
                            } else if (value.length > 2) {
                              value = value.slice(0, 2) + ' ' + value.slice(2);
                            }
                            e.target.value = value;
                          }}
                        />
                      </PhoneInputContainer>
                      {errors.phone && <PhoneError>{errors.phone.message}</PhoneError>}
                    </PhoneInputWrapper>
                  </FormGrid>

                  <FormGrid>
                    <Input
                      label="Date de naissance"
                      type="date"
                      icon={<Calendar size={18} />}
                      required
                      error={errors.birthDate?.message}
                      {...register('birthDate', { required: 'La date de naissance est requise' })}
                    />
                    <Input
                      label="Lieu de naissance"
                      placeholder="Ville, Pays"
                      icon={<MapPin size={18} />}
                      required
                      error={errors.birthPlace?.message}
                      {...register('birthPlace', { required: 'Le lieu de naissance est requis' })}
                    />
                  </FormGrid>

                  <Input
                    label="Adresse"
                    placeholder="Votre adresse complète"
                    icon={<MapPin size={18} />}
                    required
                    error={errors.address?.message}
                    {...register('address', { required: 'L\'adresse est requise' })}
                  />

                  <CinInputWrapper>
                    <CinInputLabel>
                      CIN (Carte d'Identité Nationale) - Optionnel
                    </CinInputLabel>
                    <CinInputContainer $hasError={!!errors.cin}>
                      <CinIcon>
                        <CreditCard size={18} />
                      </CinIcon>
                      <CinInput
                        type="text"
                        placeholder="103 011 014 897"
                        maxLength={15}
                        {...register('cin', {
                          validate: (value) => {
                            if (!value) return true; // Optional field
                            const digits = value.replace(/\s/g, '');
                            if (!/^\d{12}$/.test(digits)) {
                              return 'Format: XXX XXX XXX XXX (12 chiffres)';
                            }
                            const sixthDigit = digits[5];
                            if (sixthDigit !== '1' && sixthDigit !== '2') {
                              return 'Le 6ème chiffre doit être 1 (homme) ou 2 (femme)';
                            }
                            return true;
                          }
                        })}
                        onInput={(e) => {
                          // Auto-format: XXX XXX XXX XXX
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 12) value = value.slice(0, 12);
                          if (value.length > 9) {
                            value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 9) + ' ' + value.slice(9);
                          } else if (value.length > 6) {
                            value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
                          } else if (value.length > 3) {
                            value = value.slice(0, 3) + ' ' + value.slice(3);
                          }
                          e.target.value = value;
                        }}
                      />
                    </CinInputContainer>
                    {errors.cin && <CinError>{errors.cin.message}</CinError>}
                  </CinInputWrapper>
                </FormSection>
              )}

              {/* Step 2: Baccalaureate Information */}
              {step === 2 && (
                <FormSection>
                  <SectionTitle>Informations du Baccalauréat</SectionTitle>
                  <SectionDescription>
                    Renseignez vos informations de baccalauréat. Vous pouvez ajouter 
                    plusieurs séries si vous avez obtenu le bac plusieurs fois.
                  </SectionDescription>

                  <BacSeriesContainer>
                    {bacEntries.map((entry, index) => (
                      <BacSeriesItem key={entry.id}>
                        <BacSeriesHeader>
                          <BacSeriesTitle>
                            <GraduationCap size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Baccalauréat #{index + 1}
                          </BacSeriesTitle>
                          <RemoveButton
                            type="button"
                            onClick={() => removeBacEntry(entry.id)}
                            disabled={bacEntries.length === 1}
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </RemoveButton>
                        </BacSeriesHeader>

                        <FormGrid>
                          <Select
                            label="Type de série"
                            placeholder="Sélectionnez le type"
                            required
                            value={entry.type}
                            onChange={(e) => updateBacEntry(entry.id, 'type', e.target.value)}
                            options={[
                              { value: '', label: 'Sélectionnez...' },
                              { value: 'litteraire', label: 'Série Littéraire' },
                              { value: 'scientifique', label: 'Série Scientifique' }
                            ]}
                          />
                          <Select
                            label="Série du Baccalauréat"
                            placeholder="Sélectionnez la série"
                            required
                            disabled={!entry.type}
                            value={entry.series}
                            onChange={(e) => updateBacEntry(entry.id, 'series', e.target.value)}
                            options={[
                              { value: '', label: entry.type ? 'Sélectionnez...' : 'Choisissez d\'abord le type' },
                              ...getAvailableSeriesForEntry(entry.type)
                            ]}
                          />
                        </FormGrid>

                        <FormGrid style={{ marginTop: '16px' }}>
                          <Input
                            label="Année d'obtention"
                            type="number"
                            placeholder="2024"
                            icon={<Calendar size={18} />}
                            required
                            value={entry.year}
                            onChange={(e) => updateBacEntry(entry.id, 'year', e.target.value)}
                            min={1990}
                            max={new Date().getFullYear()}
                          />
                          <Input
                            label="Numéro du diplôme"
                            placeholder="N° du diplôme"
                            icon={<FileText size={18} />}
                            required
                            value={entry.number}
                            onChange={(e) => updateBacEntry(entry.id, 'number', e.target.value)}
                          />
                        </FormGrid>
                      </BacSeriesItem>
                    ))}

                    <AddBacButton type="button" onClick={addBacEntry}>
                      <Plus size={18} />
                      Ajouter une autre série
                    </AddBacButton>
                  </BacSeriesContainer>

                  {/* Upload du relevé de notes */}
                  <div style={{ marginTop: '32px' }}>
                    <SectionTitle>Relevé de notes</SectionTitle>
                    <SectionDescription>
                      Uploadez une copie de votre relevé de notes du baccalauréat. 
                      Ce document sera vérifié par l'administration.
                    </SectionDescription>
                    
                    <FileUploadArea 
                      $hasFile={!!releveFile}
                      onClick={() => document.getElementById('releveInput').click()}
                    >
                      <FileUploadInput
                        id="releveInput"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                      />
                      <FileUploadIcon $hasFile={!!releveFile}>
                        {releveFile ? <CheckCircle size={28} /> : <Upload size={28} />}
                      </FileUploadIcon>
                      {releveFile ? (
                        <>
                          <FileUploadText>Fichier sélectionné</FileUploadText>
                          <FileName>{releveFile.name}</FileName>
                          <FileUploadHint>Cliquez pour changer le fichier</FileUploadHint>
                        </>
                      ) : (
                        <>
                          <FileUploadText>Cliquez pour uploader votre relevé</FileUploadText>
                          <FileUploadHint>JPG, PNG, GIF ou PDF (max 10MB)</FileUploadHint>
                        </>
                      )}
                    </FileUploadArea>
                  </div>
                </FormSection>
              )}

              {/* Step 3: Security */}
              {step === 3 && (
                <FormSection>
                  <SectionTitle>Sécurité du compte</SectionTitle>
                  <SectionDescription>
                    Créez un mot de passe sécurisé pour protéger votre compte.
                  </SectionDescription>

                  <PasswordWrapper>
                    <Input
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      icon={<Lock size={18} />}
                      required
                      error={errors.password?.message}
                      {...register('password', {
                        required: 'Le mot de passe est requis',
                        minLength: {
                          value: 8,
                          message: 'Le mot de passe doit contenir au moins 8 caractères'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
                        }
                      })}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </PasswordToggle>
                  </PasswordWrapper>

                  <PasswordWrapper>
                    <Input
                      label="Confirmer le mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Répétez votre mot de passe"
                      icon={<Lock size={18} />}
                      required
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword', {
                        required: 'Veuillez confirmer le mot de passe',
                        validate: value => value === password || 'Les mots de passe ne correspondent pas'
                      })}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </PasswordToggle>
                  </PasswordWrapper>

                  <Alert variant="info">
                    En créant un compte, vous acceptez nos conditions d'utilisation 
                    et notre politique de confidentialité.
                  </Alert>
                </FormSection>
              )}

              <ButtonGroup>
                {step > 1 ? (
                  <Button type="button" variant="secondary" onClick={prevStep}>
                    <ArrowLeft size={18} />
                    Précédent
                  </Button>
                ) : (
                  <Button as={Link} to="/login" variant="ghost">
                    <ArrowLeft size={18} />
                    Retour
                  </Button>
                )}

                {step < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Suivant
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                  </Button>
                )}
              </ButtonGroup>
            </Form>
          </Card.Body>
        </FormCard>

        <LoginPrompt>
          Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
        </LoginPrompt>
      </Container>
    </PageWrapper>
  );
};

export default StudentRegister;
