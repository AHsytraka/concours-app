import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Calendar, Users, Award, 
  ArrowRight, Shield, Zap, CheckCircle2, Star
} from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import { Button, Card } from '../../components/common';

// ShadcnUI-inspired minimalist styles
const HeroSection = styled.section`
  padding: 6rem 1.5rem;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;
`;

const HeroContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const StatsSection = styled.section`
  padding: 4rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.muted};
`;

const StatsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.p`
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FeaturesSection = styled.section`
  padding: 6rem 1.5rem;
  background: ${({ theme }) => theme.colors.background};
`;

const SectionContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.75rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 500px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.card};
  transition: all 150ms;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderDark};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const FeatureIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
`;

const CTASection = styled.section`
  padding: 6rem 1.5rem;
  background: ${({ theme }) => theme.colors.muted};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CTAGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CTACard = styled.div`
  background: ${({ $dark, theme }) => $dark ? theme.colors.primary : theme.colors.card};
  color: ${({ $dark, theme }) => $dark ? theme.colors.textInverse : theme.colors.text};
  border: 1px solid ${({ $dark, theme }) => $dark ? 'transparent' : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 2rem;
`;

const CTACardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: inherit;
`;

const CTACardDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const CTACardList = styled.ul`
  list-style: none;
  margin-bottom: 1.5rem;
`;

const CTACardListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  opacity: 0.9;

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
`;

const Home = () => {
  return (
    <PublicLayout>
      <HeroSection>
        <HeroContainer>
          <HeroBadge>
            <Star fill="currentColor" />
            Plateforme officielle d'inscription
          </HeroBadge>
          <HeroTitle>
            Inscrivez-vous aux concours d'entrée
          </HeroTitle>
          <HeroSubtitle>
            Simplifiez vos démarches d'inscription aux concours d'entrée dans les 
            établissements d'enseignement supérieur. Une plateforme sécurisée et efficace.
          </HeroSubtitle>
          <HeroButtons>
            <Button as={Link} to="/register/student" size="lg">
              Commencer l'inscription
              <ArrowRight size={16} />
            </Button>
            <Button as={Link} to="/events" variant="outline" size="lg">
              Voir les concours
            </Button>
          </HeroButtons>
        </HeroContainer>
      </HeroSection>

      <StatsSection>
        <StatsContainer>
          <StatItem>
            <StatValue>15K+</StatValue>
            <StatLabel>Candidats inscrits</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>45+</StatValue>
            <StatLabel>Établissements</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>120+</StatValue>
            <StatLabel>Concours organisés</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>8.5K+</StatValue>
            <StatLabel>Admissions réussies</StatLabel>
          </StatItem>
        </StatsContainer>
      </StatsSection>

      <FeaturesSection>
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Pourquoi nous choisir ?</SectionTitle>
            <SectionSubtitle>
              Une solution complète et sécurisée pour vos inscriptions
            </SectionSubtitle>
          </SectionHeader>

          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon><Shield /></FeatureIcon>
              <FeatureTitle>Sécurisé</FeatureTitle>
              <FeatureDescription>
                Vos données sont protégées par un chiffrement de bout en bout 
                conforme aux normes internationales.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon><Zap /></FeatureIcon>
              <FeatureTitle>Rapide</FeatureTitle>
              <FeatureDescription>
                Inscription en quelques minutes grâce à l'extraction automatique 
                des données de votre relevé de notes.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon><CheckCircle2 /></FeatureIcon>
              <FeatureTitle>Fiable</FeatureTitle>
              <FeatureDescription>
                Vérification automatique des documents par IA pour garantir 
                l'authenticité des dossiers.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContainer>
      </FeaturesSection>

      <CTASection>
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Prêt à commencer ?</SectionTitle>
            <SectionSubtitle>
              Choisissez votre profil pour démarrer
            </SectionSubtitle>
          </SectionHeader>

          <CTAGrid>
            <CTACard $dark>
              <CTACardTitle>Je suis candidat</CTACardTitle>
              <CTACardDescription>
                Créez votre compte et inscrivez-vous aux concours de votre choix.
              </CTACardDescription>
              <CTACardList>
                <CTACardListItem>
                  <CheckCircle2 />
                  Inscription simple et rapide
                </CTACardListItem>
                <CTACardListItem>
                  <CheckCircle2 />
                  Suivi de vos candidatures
                </CTACardListItem>
                <CTACardListItem>
                  <CheckCircle2 />
                  Convocations téléchargeables
                </CTACardListItem>
                <CTACardListItem>
                  <CheckCircle2 />
                  Résultats en ligne
                </CTACardListItem>
              </CTACardList>
              <Button 
                as={Link} 
                to="/register/student" 
                variant="outline"
                style={{ background: 'white', color: '#18181b', borderColor: 'white' }}
              >
                Créer mon compte
                <ArrowRight size={16} />
              </Button>
            </CTACard>

            <CTACard>
              <CTACardTitle>Je suis un établissement</CTACardTitle>
              <CTACardDescription>
                Gérez vos concours d'entrée depuis un tableau de bord dédié.
              </CTACardDescription>
              <CTACardList>
                <CTACardListItem>
                  <CheckCircle2 />
                  Création de concours
                </CTACardListItem>
                <CTACardListItem>
                  <CheckCircle2 />
                  Gestion des candidatures
                </CTACardListItem>
                <CTACardListItem>
                  <CheckCircle2 />
                  Saisie des notes
                </CTACardListItem>
                <CTACardListItem>
                  <CheckCircle2 />
                  Publication des résultats
                </CTACardListItem>
              </CTACardList>
              <Button as={Link} to="/register/university">
                Demander un accès
                <ArrowRight size={16} />
              </Button>
            </CTACard>
          </CTAGrid>
        </SectionContainer>
      </CTASection>
    </PublicLayout>
  );
};

export default Home;
