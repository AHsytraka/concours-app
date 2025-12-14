import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FolderOpen, 
  Search, 
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Filter,
  ChevronRight,
  X,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Badge, Loader } from '../../components/common';
import api from '../../services/api';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
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

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
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
    width: 18px;
    height: 18px;
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tab = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.textLight};
  background: ${({ theme, $active }) => $active ? `${theme.colors.primary}10` : 'transparent'};
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DossiersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const DossierCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const DossierHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, $status }) => {
    switch($status) {
      case 'validated': return `${theme.colors.success}10`;
      case 'rejected': return `${theme.colors.error}10`;
      default: return `${theme.colors.warning}10`;
    }
  }};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DossierTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CandidateName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const DossierBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme }) => theme.colors.primaryLight}20;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const DossierFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &.success:hover {
    background: ${({ theme }) => theme.colors.success};
    border-color: ${({ theme }) => theme.colors.success};
  }

  &.error:hover {
    background: ${({ theme }) => theme.colors.error};
    border-color: ${({ theme }) => theme.colors.error};
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

// Modal styles
const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.xl};
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    margin: 0;
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const DetailSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};

  label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textLight};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const getStatusConfig = (status) => {
  const configs = {
    pending: { variant: 'warning', label: 'En attente', color: '#f59e0b' },
    validated: { variant: 'success', label: 'Validé', color: '#10b981' },
    rejected: { variant: 'error', label: 'Rejeté', color: '#ef4444' }
  };
  return configs[status] || configs.pending;
};

const Dossiers = () => {
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dossiersRes, eventsRes] = await Promise.all([
        api.get('/institution/dossiers'),
        api.get('/institution/events')
      ]);
      setDossiers(dossiersRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDossierDetail = async (dossierId) => {
    try {
      const response = await api.get(`/institution/dossiers/${dossierId}`);
      setSelectedDossier(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching dossier detail:', error);
    }
  };

  const handleValidate = async (dossierId) => {
    setActionLoading(true);
    try {
      await api.put(`/institution/dossiers/${dossierId}/validate`);
      // Update local state
      setDossiers(dossiers.map(d => 
        d.id === dossierId ? { ...d, status: 'validated' } : d
      ));
      if (selectedDossier?.id === dossierId) {
        setSelectedDossier({ ...selectedDossier, status: 'validated' });
      }
    } catch (error) {
      console.error('Error validating dossier:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (dossierId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter ce dossier ?')) return;
    
    setActionLoading(true);
    try {
      await api.put(`/institution/dossiers/${dossierId}/reject`);
      // Update local state
      setDossiers(dossiers.map(d => 
        d.id === dossierId ? { ...d, status: 'rejected' } : d
      ));
      if (selectedDossier?.id === dossierId) {
        setSelectedDossier({ ...selectedDossier, status: 'rejected' });
      }
    } catch (error) {
      console.error('Error rejecting dossier:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReceipt = async (dossierId) => {
    try {
      const response = await api.get(`/institution/dossiers/${dossierId}/payment-receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bordereau_paiement.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const filteredDossiers = dossiers.filter(dossier => {
    const matchesTab = activeTab === 'all' || dossier.status === activeTab;
    const fullName = `${dossier.user?.firstName || ''} ${dossier.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         dossier.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dossier.event?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: dossiers.length,
    pending: dossiers.filter(d => d.status === 'pending').length,
    validated: dossiers.filter(d => d.status === 'validated').length,
    rejected: dossiers.filter(d => d.status === 'rejected').length
  };

  if (loading) {
    return (
      <UniversityLayout pageTitle="Sélection de dossiers">
        <Loader text="Chargement des dossiers..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Sélection de dossiers">
      <PageHeader>
        <PageTitle>Sélection de dossiers</PageTitle>
        <HeaderActions>
          <SearchBar>
            <Search />
            <input 
              type="text" 
              placeholder="Rechercher un candidat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
        </HeaderActions>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#3b82f6">
            <FolderOpen />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total dossiers</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#f59e0b">
            <Clock />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>En attente</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#10b981">
            <CheckCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.validated}</StatValue>
            <StatLabel>Validés</StatLabel>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $color="#ef4444">
            <XCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>Rejetés</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          Tous ({stats.total})
        </Tab>
        <Tab $active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
          En attente ({stats.pending})
        </Tab>
        <Tab $active={activeTab === 'validated'} onClick={() => setActiveTab('validated')}>
          Validés ({stats.validated})
        </Tab>
        <Tab $active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>
          Rejetés ({stats.rejected})
        </Tab>
      </TabsContainer>

      {filteredDossiers.length === 0 ? (
        <Card>
          <EmptyState>
            <FolderOpen />
            <h3>Aucun dossier</h3>
            <p>
              {dossiers.length === 0 
                ? "Aucune inscription n'a été reçue pour vos concours."
                : "Aucun dossier ne correspond à vos critères de recherche."
              }
            </p>
          </EmptyState>
        </Card>
      ) : (
        <DossiersGrid>
          {filteredDossiers.map(dossier => {
            const statusConfig = getStatusConfig(dossier.status);
            return (
              <DossierCard key={dossier.id} onClick={() => fetchDossierDetail(dossier.id)}>
                <DossierHeader $status={dossier.status}>
                  <DossierTitle>
                    <CandidateName>
                      {dossier.user?.firstName} {dossier.user?.lastName}
                    </CandidateName>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </DossierTitle>
                  <EventBadge>
                    <Calendar size={12} />
                    {dossier.event?.name || 'Concours'}
                  </EventBadge>
                </DossierHeader>
                
                <DossierBody>
                  <InfoRow>
                    <Mail />
                    {dossier.user?.email || 'Email non renseigné'}
                  </InfoRow>
                  <InfoRow>
                    <Clock />
                    Inscrit le {dossier.createdAt 
                      ? format(new Date(dossier.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })
                      : 'N/A'
                    }
                  </InfoRow>
                  <InfoRow>
                    <FileText />
                    {dossier.hasPaymentReceipt ? 'Bordereau de paiement fourni' : 'Pas de bordereau'}
                  </InfoRow>
                </DossierBody>

                <DossierFooter>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    N° {dossier.registrationNumber || dossier.id}
                  </span>
                  <ActionButtons onClick={(e) => e.stopPropagation()}>
                    <IconButton title="Voir détails" onClick={() => fetchDossierDetail(dossier.id)}>
                      <Eye size={16} />
                    </IconButton>
                    {dossier.status === 'pending' && (
                      <>
                        <IconButton 
                          className="success" 
                          title="Valider"
                          onClick={() => handleValidate(dossier.id)}
                        >
                          <CheckCircle size={16} />
                        </IconButton>
                        <IconButton 
                          className="error" 
                          title="Rejeter"
                          onClick={() => handleReject(dossier.id)}
                        >
                          <XCircle size={16} />
                        </IconButton>
                      </>
                    )}
                  </ActionButtons>
                </DossierFooter>
              </DossierCard>
            );
          })}
        </DossiersGrid>
      )}

      {/* Detail Modal */}
      {showModal && selectedDossier && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Détail du dossier</h2>
              <IconButton onClick={() => setShowModal(false)}>
                <X size={20} />
              </IconButton>
            </ModalHeader>
            
            <ModalBody>
              <DetailSection>
                <SectionTitle>
                  <User size={18} />
                  Informations du candidat
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <label>Nom complet</label>
                    <span>{selectedDossier.user?.firstName} {selectedDossier.user?.lastName}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Email</label>
                    <span>{selectedDossier.user?.email}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Téléphone</label>
                    <span>{selectedDossier.user?.phone || 'Non renseigné'}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Date d'inscription</label>
                    <span>
                      {selectedDossier.createdAt 
                        ? format(new Date(selectedDossier.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })
                        : 'N/A'
                      }
                    </span>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <SectionTitle>
                  <Calendar size={18} />
                  Concours
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <label>Nom du concours</label>
                    <span>{selectedDossier.event?.name}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>N° d'inscription</label>
                    <span>{selectedDossier.registrationNumber || selectedDossier.id}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Statut</label>
                    <Badge variant={getStatusConfig(selectedDossier.status).variant}>
                      {getStatusConfig(selectedDossier.status).label}
                    </Badge>
                  </DetailItem>
                  <DetailItem>
                    <label>Date limite</label>
                    <span>
                      {selectedDossier.event?.deadline 
                        ? format(new Date(selectedDossier.event.deadline), 'dd/MM/yyyy', { locale: fr })
                        : 'N/A'
                      }
                    </span>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <SectionTitle>
                  <CreditCard size={18} />
                  Paiement
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <label>Référence paiement</label>
                    <span>{selectedDossier.paymentReference || 'Non renseignée'}</span>
                  </DetailItem>
                  <DetailItem>
                    <label>Statut vérification</label>
                    <Badge variant={selectedDossier.isPaymentVerified ? 'success' : 'warning'}>
                      {selectedDossier.isPaymentVerified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                  </DetailItem>
                </DetailGrid>
                
                {selectedDossier.hasPaymentReceipt && (
                  <DocumentItem style={{ marginTop: '16px' }}>
                    <DocumentInfo>
                      <FileText size={20} />
                      <div>
                        <div style={{ fontWeight: 500 }}>Bordereau de paiement</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {selectedDossier.paymentReceiptFilename || 'bordereau.pdf'}
                        </div>
                      </div>
                    </DocumentInfo>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadReceipt(selectedDossier.id)}
                    >
                      <Download size={14} />
                      Télécharger
                    </Button>
                  </DocumentItem>
                )}
              </DetailSection>

              {selectedDossier.formData && (
                <DetailSection>
                  <SectionTitle>
                    <FileText size={18} />
                    Informations supplémentaires
                  </SectionTitle>
                  <DetailGrid>
                    {Object.entries(selectedDossier.formData).map(([key, value]) => (
                      <DetailItem key={key}>
                        <label>{key.replace(/_/g, ' ')}</label>
                        <span>{value?.toString() || 'N/A'}</span>
                      </DetailItem>
                    ))}
                  </DetailGrid>
                </DetailSection>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Fermer
              </Button>
              {selectedDossier.status === 'pending' && (
                <ModalActions>
                  <Button 
                    variant="outline" 
                    onClick={() => handleReject(selectedDossier.id)}
                    disabled={actionLoading}
                  >
                    <XCircle size={16} />
                    Rejeter
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => handleValidate(selectedDossier.id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={16} />
                    Valider le dossier
                  </Button>
                </ModalActions>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </UniversityLayout>
  );
};

export default Dossiers;
