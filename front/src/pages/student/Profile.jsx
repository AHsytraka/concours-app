import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, CreditCard, 
  GraduationCap, FileText, Edit2, Save, X, Loader2,
  Download, CheckCircle, Clock, AlertCircle, Upload
} from 'lucide-react';
import { StudentLayout } from '../../components/layout';
import { Card, Button, Loader, Alert } from '../../components/common';
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

const ReleveSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ReleveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ReleveCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const ReleveSeriesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ReleveSeries = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ReleveVerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  background: ${({ $verified, theme }) => $verified ? '#f0fdf4' : '#fef3c7'};
  color: ${({ $verified, theme }) => $verified ? '#22c55e' : '#f59e0b'};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ReleveInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ReleveInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ReleveInfoLabel = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ReleveInfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const ReleveActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReleveActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}05`};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const NoReleveContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
`;

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [releveDeNotes, setReleveDeNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profileRes, transcriptRes, relevesRes] = await Promise.all([
          studentService.getProfile(),
          studentService.getTranscript(),
          fetch('/api/students/releve-de-notes', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(r => r.json()).catch(() => ({ data: [] }))
        ]);
        
        setProfile(profileRes.data);
        if (transcriptRes.data && !transcriptRes.data.message) {
          setTranscript(transcriptRes.data);
        }
        
        if (relevesRes.data && Array.isArray(relevesRes.data)) {
          setReleveDeNotes(relevesRes.data);
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

  const downloadReleve = async (releveId, filename) => {
    try {
      const response = await fetch(`/api/students/releve-de-notes/download/${releveId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading releve:', err);
      alert('Erreur lors du téléchargement du fichier');
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

      {/* Relevés de notes par série */}
      <ReleveSection>
        <Card>
          <Card.Body style={{ padding: '32px' }}>
            <CardHeader>
              <CardTitle>
                <FileText size={24} />
                Relevés de notes
              </CardTitle>
            </CardHeader>

            {releveDeNotes.length > 0 ? (
              <>
                <Alert variant="info" style={{ marginBottom: '20px' }}>
                  Vos relevés de notes par série de baccalauréat. Les documents doivent être vérifiés par l'administration avant utilisation lors de l'inscription aux concours.
                </Alert>
                <ReleveGrid>
                  {releveDeNotes.map((releve) => (
                    <ReleveCard key={releve.id}>
                      <ReleveSeriesHeader>
                        <ReleveSeries>Série {releve.series}</ReleveSeries>
                        <ReleveVerificationBadge $verified={releve.verified}>
                          {releve.verified ? (
                            <>
                              <CheckCircle />
                              Vérifié
                            </>
                          ) : (
                            <>
                              <Clock />
                              En attente
                            </>
                          )}
                        </ReleveVerificationBadge>
                      </ReleveSeriesHeader>

                      <ReleveInfo>
                        <ReleveInfoRow>
                          <ReleveInfoLabel>Fichier:</ReleveInfoLabel>
                          <ReleveInfoValue>{releve.filename}</ReleveInfoValue>
                        </ReleveInfoRow>

                        <ReleveInfoRow>
                          <ReleveInfoLabel>Taille:</ReleveInfoLabel>
                          <ReleveInfoValue>
                            {releve.fileSize ? `${(releve.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                          </ReleveInfoValue>
                        </ReleveInfoRow>

                        <ReleveInfoRow>
                          <ReleveInfoLabel>Uploadé:</ReleveInfoLabel>
                          <ReleveInfoValue>
                            {releve.uploadDate ? new Date(releve.uploadDate).toLocaleDateString('fr-FR') : 'N/A'}
                          </ReleveInfoValue>
                        </ReleveInfoRow>

                        {releve.verified && releve.verifiedDate && (
                          <ReleveInfoRow>
                            <ReleveInfoLabel>Vérifié:</ReleveInfoLabel>
                            <ReleveInfoValue>
                              {new Date(releve.verifiedDate).toLocaleDateString('fr-FR')}
                            </ReleveInfoValue>
                          </ReleveInfoRow>
                        )}

                        {releve.verificationNotes && (
                          <ReleveInfoRow>
                            <ReleveInfoLabel>Remarques:</ReleveInfoLabel>
                            <ReleveInfoValue>{releve.verificationNotes}</ReleveInfoValue>
                          </ReleveInfoRow>
                        )}
                      </ReleveInfo>

                      <ReleveActions>
                        <ReleveActionButton 
                          onClick={() => downloadReleve(releve.id, releve.filename)}
                          title="Télécharger le fichier"
                        >
                          <Download />
                          Télécharger
                        </ReleveActionButton>
                      </ReleveActions>
                    </ReleveCard>
                  ))}
                </ReleveGrid>
              </>
            ) : (
              <NoReleveContainer>
                <Upload />
                <p>Aucun relevé de notes uploadé</p>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                  Vous pouvez en uploader lors de votre inscription ou depuis cette page
                </p>
              </NoReleveContainer>
            )}
          </Card.Body>
        </Card>
      </ReleveSection>

      {/* Relevé de notes (section ancienne - à conserver pour compatibilité) */}
      <TranscriptSection>
        <TranscriptCard>
          <CardHeader>
            <CardTitle>
              <FileText size={24} />
              Relevé de notes (ancien)
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
