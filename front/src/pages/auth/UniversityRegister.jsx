import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Mail, Lock, Building, Phone, Globe, MapPin, 
  Eye, EyeOff, FileText, ArrowLeft, ArrowRight,
  CheckCircle, GraduationCap, User
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Select, FileUpload, Alert, Card } from '../../components/common';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['2xl']};
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Logo = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  svg {
    width: 40px;
    height: 40px;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
`;

const Stepper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.default};

  ${({ $active, $completed, theme }) => {
    if ($completed) {
      return `
        background: ${theme.colors.success};
        color: ${theme.colors.textInverse};
      `;
    }
    if ($active) {
      return `
        background: ${theme.colors.primary};
        color: ${theme.colors.textInverse};
      `;
    }
    return `
      background: ${theme.colors.backgroundDark};
      color: ${theme.colors.textLight};
    `;
  }}
`;

const StepLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textLight};

  @media (max-width: 640px) {
    display: none;
  }
`;

const StepConnector = styled.div`
  width: 60px;
  height: 2px;
  background: ${({ $completed, theme }) => 
    $completed ? theme.colors.success : theme.colors.border};

  @media (max-width: 640px) {
    width: 30px;
  }
`;

const FormCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textLight};
  padding: ${({ theme }) => theme.spacing.xs};
  margin-top: 12px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const LoginPrompt = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: ${({ theme }) => theme.spacing.lg};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SuccessPage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.success}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};

  svg {
    width: 48px;
    height: 48px;
    color: ${({ theme }) => theme.colors.success};
  }
`;

const SuccessTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SuccessMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const INSTITUTION_TYPES = [
  { value: 'university', label: 'Université' },
  { value: 'grande_ecole', label: 'Grande École' },
  { value: 'institut', label: 'Institut' },
  { value: 'ecole_superieure', label: 'École Supérieure' },
  { value: 'centre_formation', label: 'Centre de Formation' }
];

const UniversityRegister = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authorizationDoc, setAuthorizationDoc] = useState(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const navigate = useNavigate();
  const { registerUniversity } = useAuth();

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({
    defaultValues: {
      institutionName: '',
      institutionType: '',
      registrationNumber: '',
      address: '',
      city: '',
      country: 'Madagascar',
      phone: '',
      website: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPhone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  const nextStep = async () => {
    let isValid = false;
    
    console.log('nextStep called, current step:', step);
    
    if (step === 1) {
      isValid = await trigger(['institutionName', 'institutionType', 'registrationNumber', 'address', 'city', 'phone']);
    } else if (step === 2) {
      isValid = await trigger(['adminFirstName', 'adminLastName', 'adminEmail', 'adminPhone', 'password', 'confirmPassword']);
    }

    console.log('isValid:', isValid, 'advancing to step:', step + 1);
    
    if (isValid) {
      // Only advance to next step, don't submit yet
      setStep(step + 1);
      console.log('Step set to:', step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Prevent Enter key from submitting form on steps 1 and 2
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
      nextStep();
    }
  };

  const onSubmit = async (data) => {
    // Only allow submission at step 3
    if (step !== 3) {
      console.log('Blocked submission - not at step 3, current step:', step);
      return;
    }
    if (!authorizationDoc) {
      setError("Le document d'autorisation est requis.");
      return;
    }
    console.log('onSubmit called! Current step:', step);
    console.log('Data:', data);
    setIsLoading(true);
    setError(null);

    try {
      await registerUniversity(data, { authorization: authorizationDoc });
      setRegistrationComplete(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <PageWrapper>
        <Container>
          <Header>
            <Logo to="/">
              <GraduationCap />
              <span>Inscription.univ</span>
            </Logo>
          </Header>

          <FormCard>
            <Card.Body>
              <SuccessPage>
                <SuccessIcon>
                  <CheckCircle />
                </SuccessIcon>
                <SuccessTitle>Demande d'inscription soumise !</SuccessTitle>
                <SuccessMessage>
                  Votre demande d'inscription a été soumise avec succès. Notre équipe va vérifier 
                  les informations fournies et l'autorisation d'exercice. Vous recevrez un email 
                  de confirmation sous 24 à 48 heures ouvrées.
                </SuccessMessage>
                <Button as={Link} to="/" variant="secondary">
                  Retour à l'accueil
                </Button>
              </SuccessPage>
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
            <span>Inscription.univ</span>
          </Logo>
          <Title>Inscription Établissement</Title>
          <Subtitle>Inscrivez votre établissement pour organiser des concours</Subtitle>
        </Header>

        <Stepper>
          <Step>
            <StepNumber $active={step === 1} $completed={step > 1}>
              {step > 1 ? '✓' : '1'}
            </StepNumber>
            <StepLabel $active={step === 1}>Établissement</StepLabel>
          </Step>
          <StepConnector $completed={step > 1} />
          <Step>
            <StepNumber $active={step === 2} $completed={step > 2}>
              {step > 2 ? '✓' : '2'}
            </StepNumber>
            <StepLabel $active={step === 2}>Administrateur</StepLabel>
          </Step>
          <StepConnector $completed={step > 2} />
          <Step>
            <StepNumber $active={step === 3} $completed={step > 3}>
              {step > 3 ? '✓' : '3'}
            </StepNumber>
            <StepLabel $active={step === 3}>Documents</StepLabel>
          </Step>
        </Stepper>

        {error && (
          <Alert variant="error" onClose={() => setError(null)} style={{ marginBottom: '1.5rem' }}>
            {error}
          </Alert>
        )}

        <FormCard>
          <Card.Body>
            <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
              {/* Step 1: Institution Information */}
              {step === 1 && (
                <FormSection>
                  <SectionTitle>Informations de l'établissement</SectionTitle>
                  
                  <FormGrid>
                    <Input
                      label="Nom de l'établissement"
                      placeholder="Université de..."
                      icon={<Building />}
                      required
                      error={errors.institutionName?.message}
                      {...register('institutionName', { required: 'Le nom est requis' })}
                    />
                    <Select
                      label="Type d'établissement"
                      placeholder="Sélectionnez le type"
                      required
                      error={errors.institutionType?.message}
                      options={INSTITUTION_TYPES}
                      {...register('institutionType', { required: 'Le type est requis' })}
                    />
                  </FormGrid>

                  <FormGrid>
                    <Input
                      label="Numéro d'enregistrement"
                      placeholder="N° d'agrément / autorisation"
                      icon={<FileText />}
                      required
                      error={errors.registrationNumber?.message}
                      {...register('registrationNumber', { required: 'Le numéro est requis' })}
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
                          onInput={(e) => {
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

                  <Input
                    label="Adresse"
                    placeholder="Adresse complète de l'établissement"
                    icon={<MapPin />}
                    required
                    error={errors.address?.message}
                    {...register('address', { required: 'L\'adresse est requise' })}
                  />

                  <FormGrid>
                    <Input
                      label="Ville"
                      placeholder="Antananarivo"
                      icon={<MapPin />}
                      required
                      error={errors.city?.message}
                      {...register('city', { required: 'La ville est requise' })}
                    />
                    <Input
                      label="Site web"
                      type="url"
                      placeholder="https://www.example.mg"
                      icon={<Globe />}
                      error={errors.website?.message}
                      {...register('website')}
                    />
                  </FormGrid>
                </FormSection>
              )}

              {/* Step 2: Administrator Information */}
              {step === 2 && (
                <FormSection>
                  <SectionTitle>Administrateur principal</SectionTitle>
                  
                  <Alert variant="info">
                    L'administrateur principal aura un accès complet au tableau de bord et pourra 
                    créer des sous-comptes pour les gestionnaires de concours.
                  </Alert>

                  <FormGrid>
                    <Input
                      label="Prénom"
                      placeholder="Prénom de l'administrateur"
                      icon={<User />}
                      required
                      error={errors.adminFirstName?.message}
                      {...register('adminFirstName', { required: 'Le prénom est requis' })}
                    />
                    <Input
                      label="Nom"
                      placeholder="Nom de l'administrateur"
                      icon={<User />}
                      required
                      error={errors.adminLastName?.message}
                      {...register('adminLastName', { required: 'Le nom est requis' })}
                    />
                  </FormGrid>

                  <FormGrid>
                    <Input
                      label="Email professionnel"
                      type="email"
                      placeholder="admin@universite.mg"
                      icon={<Mail />}
                      required
                      error={errors.adminEmail?.message}
                      {...register('adminEmail', {
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
                      <PhoneInputContainer $hasError={!!errors.adminPhone}>
                        <PhonePrefix>
                          <Phone size={18} />
                          +261
                        </PhonePrefix>
                        <PhoneInput
                          type="tel"
                          placeholder="32 11 234 56"
                          maxLength={12}
                          {...register('adminPhone', {
                            required: 'Le téléphone est requis',
                            pattern: {
                              value: /^\d{2}\s?\d{2}\s?\d{3}\s?\d{2}$/,
                              message: 'Format: XX XX XXX XX'
                            }
                          })}
                          onInput={(e) => {
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
                      {errors.adminPhone && <PhoneError>{errors.adminPhone.message}</PhoneError>}
                    </PhoneInputWrapper>
                  </FormGrid>

                  <PasswordWrapper>
                    <Input
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      icon={<Lock />}
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
                      icon={<Lock />}
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
                </FormSection>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <FormSection>
                  <SectionTitle>Documents justificatifs</SectionTitle>
                  
                  <Alert variant="warning">
                    Les documents fournis seront vérifiés par notre équipe avant validation 
                    de votre compte. Assurez-vous de fournir des documents lisibles et à jour.
                  </Alert>


                  <FileUpload
                    label="Autorisation d'exercice / Agrément *"
                    accept=".pdf,.jpg,.jpeg,.png"
                    hint="Document officiel attestant de l'autorisation d'exercer (PDF, JPG, PNG)"
                    value={authorizationDoc}
                    onChange={setAuthorizationDoc}
                    required
                    error={error && error.includes('autorisation') ? error : undefined}
                  />

                  <Alert variant="info">
                    En soumettant cette demande, vous certifiez que les informations fournies 
                    sont exactes et que vous êtes autorisé à représenter cet établissement.
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
                  <Button type="submit" isLoading={isLoading}>
                    Soumettre la demande
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

export default UniversityRegister;
