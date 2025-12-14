import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, CreditCard, 
  GraduationCap, FileText, Edit2, Save, X, Loader2
} from 'lucide-react';
import { StudentLayout } from '../../components/layout';
import { Card, Button, Loader } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/api';

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => `${theme.colors.primary}10`};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InfoValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const BacEntriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BacEntry = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const BacEntryTitle = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BacEntryDetails = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

const TranscriptSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const TranscriptCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const TranscriptImage = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const NoTranscript = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.textLight};
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => `${theme.colors.error}10`};
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profileRes, transcriptRes] = await Promise.all([
          studentService.getProfile(),
          studentService.getTranscript()
        ]);
        
        setProfile(profileRes.data);
        if (transcriptRes.data && !transcriptRes.data.message) {
          setTranscript(transcriptRes.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCin = (cin) => {
    if (!cin) return 'Non renseigné';
    return cin;
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Non renseigné';
    return phone;
  };

  const formatDate = (date) => {
    if (!date) return 'Non renseigné';
    return date;
  };

  const parseBacEntries = (bacEntriesJson) => {
    if (!bacEntriesJson) return [];
    try {
      return JSON.parse(bacEntriesJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <LoadingContainer>
          <Loader text="Chargement du profil..." />
        </LoadingContainer>
      </StudentLayout>
    );
  }

  const bacEntries = parseBacEntries(profile?.bacEntries);

  return (
    <StudentLayout>
      <PageHeader>
        <Title>Mon Profil</Title>
        <Subtitle>Consultez et gérez vos informations personnelles</Subtitle>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ProfileGrid>
        {/* Informations personnelles */}
        <ProfileCard>
          <CardHeader>
            <CardTitle>
              <User size={24} />
              Informations personnelles
            </CardTitle>
          </CardHeader>

          <InfoGrid>
            <InfoItem>
              <InfoIcon>
                <User />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Nom complet</InfoLabel>
                <InfoValue>{profile?.firstName} {profile?.lastName}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <Mail />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{profile?.email}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <Phone />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Téléphone</InfoLabel>
                <InfoValue>{formatPhone(profile?.phone)}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <CreditCard />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>CIN</InfoLabel>
                <InfoValue>{formatCin(profile?.cin)}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <Calendar />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Date de naissance</InfoLabel>
                <InfoValue>{formatDate(profile?.birthDate)}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <MapPin />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Lieu de naissance</InfoLabel>
                <InfoValue>{profile?.birthPlace || 'Non renseigné'}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <MapPin />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Adresse</InfoLabel>
                <InfoValue>{profile?.address || 'Non renseigné'}</InfoValue>
              </InfoContent>
            </InfoItem>
          </InfoGrid>
        </ProfileCard>

        {/* Informations académiques */}
        <ProfileCard>
          <CardHeader>
            <CardTitle>
              <GraduationCap size={24} />
              Informations académiques
            </CardTitle>
          </CardHeader>

          {bacEntries.length > 0 ? (
            <BacEntriesContainer>
              {bacEntries.map((entry, index) => (
                <BacEntry key={index}>
                  <BacEntryTitle>
                    Baccalauréat {entry.type === 'malagasy' ? 'Malagasy' : 'Français'} - Série {entry.series}
                  </BacEntryTitle>
                  <BacEntryDetails>
                    Année: {entry.year} • N° {entry.number}
                  </BacEntryDetails>
                </BacEntry>
              ))}
            </BacEntriesContainer>
          ) : (
            <InfoGrid>
              {profile?.bacSeries && (
                <InfoItem>
                  <InfoIcon>
                    <GraduationCap />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Série du Bac</InfoLabel>
                    <InfoValue>{profile.bacSeries}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
              
              {profile?.bacYear && (
                <InfoItem>
                  <InfoIcon>
                    <Calendar />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Année du Bac</InfoLabel>
                    <InfoValue>{profile.bacYear}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {profile?.highSchool && (
                <InfoItem>
                  <InfoIcon>
                    <GraduationCap />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Établissement</InfoLabel>
                    <InfoValue>{profile.highSchool}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {profile?.averageGrade && (
                <InfoItem>
                  <InfoIcon>
                    <FileText />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Moyenne générale</InfoLabel>
                    <InfoValue>{profile.averageGrade}/20</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {!profile?.bacSeries && !profile?.bacYear && (
                <InfoItem>
                  <InfoContent>
                    <InfoValue style={{ color: '#64748b' }}>Aucune information académique disponible</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
            </InfoGrid>
          )}
        </ProfileCard>
      </ProfileGrid>

      {/* Relevé de notes */}
      <TranscriptSection>
        <TranscriptCard>
          <CardHeader>
            <CardTitle>
              <FileText size={24} />
              Relevé de notes
            </CardTitle>
          </CardHeader>

          {transcript ? (
            <>
              <InfoItem>
                <InfoIcon>
                  <FileText />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Fichier</InfoLabel>
                  <InfoValue>{transcript.fileName}</InfoValue>
                </InfoContent>
              </InfoItem>
              
              <TranscriptImage>
                <img 
                  src={`http://localhost:8080${transcript.url}`} 
                  alt="Relevé de notes"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <NoTranscript style={{ display: 'none' }}>
                  <FileText />
                  <p>Impossible de charger l'image</p>
                </NoTranscript>
              </TranscriptImage>
            </>
          ) : (
            <NoTranscript>
              <FileText />
              <p>Aucun relevé de notes téléchargé</p>
            </NoTranscript>
          )}
        </TranscriptCard>
      </TranscriptSection>
    </StudentLayout>
  );
};

export default StudentProfile;
