import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  Activity
} from 'lucide-react';
import UniversityLayout from '../../components/layout/UniversityLayout';
import { Card, Button, Loader, Select } from '../../components/common';
import { institutionService, eventService } from '../../services/api';

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
`;

const FilterSelect = styled(Select)`
  width: 200px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const StatCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ $positive, $negative, theme }) => 
    $positive ? `${theme.colors.success}15` : 
    $negative ? `${theme.colors.error}15` : 
    theme.colors.backgroundAlt};
  color: ${({ $positive, $negative, theme }) => 
    $positive ? theme.colors.success : 
    $negative ? theme.colors.error : 
    theme.colors.textLight};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BarLabel = styled.span`
  width: 150px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 24px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${({ $color }) => $color};
  width: ${({ $percentage }) => $percentage}%;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing.sm};
`;

const BarValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: white;
`;

const PieChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PieChartSvg = styled.svg`
  width: 200px;
  height: 200px;
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const LegendColor = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

const LegendValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const TableSection = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  th {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textLight};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ProgressCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MiniProgress = styled.div`
  width: 100px;
  height: 6px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
`;

const MiniProgressFill = styled.div`
  height: 100%;
  background: ${({ $percentage, theme }) => 
    $percentage > 80 ? theme.colors.success : 
    $percentage > 50 ? theme.colors.warning : 
    theme.colors.primary};
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
`;

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    admissionRate: 0,
    averageScore: 0,
    passed: 0,
    waitingList: 0,
    failed: 0
  });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        institutionService.getStatistics(),
        eventService.getMyEvents()
      ]);
      setStats(statsRes.data || { totalEvents: 0, totalRegistrations: 0, admissionRate: 0, averageScore: 0, passed: 0, waitingList: 0, failed: 0 });
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats({ totalEvents: 0, totalRegistrations: 0, admissionRate: 0, averageScore: 0, passed: 0, waitingList: 0, failed: 0 });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pie chart data from actual stats
  const statusData = [
    { label: 'Admis', value: stats.passed || 0, color: '#10b981' },
    { label: 'Liste d\'attente', value: stats.waitingList || 0, color: '#f59e0b' },
    { label: 'Non admis', value: stats.failed || 0, color: '#ef4444' }
  ];
  const total = statusData.reduce((sum, d) => sum + d.value, 0);

  // Generate pie chart path - handle case where total is 0
  let currentAngle = 0;
  const pieSlices = total > 0 ? statusData.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    return {
      ...item,
      path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: Math.round(percentage * 100)
    };
  }) : [];

  const barColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const maxRegistrations = Math.max(...events.map(e => e.registrations || 0));

  if (loading) {
    return (
      <UniversityLayout pageTitle="Statistiques">
        <Loader text="Chargement des statistiques..." />
      </UniversityLayout>
    );
  }

  return (
    <UniversityLayout pageTitle="Statistiques">
      <PageHeader>
        <PageTitle>Statistiques et analyses</PageTitle>
        <HeaderActions>
          <FilterSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
            <option value="all">Tout</option>
          </FilterSelect>
          <Button variant="outline">
            <Download size={18} />
            Exporter rapport
          </Button>
        </HeaderActions>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <StatCardHeader>
            <StatIcon $color="#3b82f6">
              <Calendar />
            </StatIcon>
          </StatCardHeader>
          <StatValue>{stats.totalEvents}</StatValue>
          <StatLabel>Concours organisés</StatLabel>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon $color="#10b981">
              <Users />
            </StatIcon>
          </StatCardHeader>
          <StatValue>{stats.totalRegistrations}</StatValue>
          <StatLabel>Inscriptions totales</StatLabel>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon $color="#8b5cf6">
              <TrendingUp />
            </StatIcon>
          </StatCardHeader>
          <StatValue>{stats.admissionRate?.toFixed(1) || 0}%</StatValue>
          <StatLabel>Taux d'admission</StatLabel>
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatIcon $color="#f59e0b">
              <Activity />
            </StatIcon>
          </StatCardHeader>
          <StatValue>{stats.averageScore?.toFixed(2) || 0}/20</StatValue>
          <StatLabel>Moyenne générale</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Inscriptions par concours</ChartTitle>
          <BarChartContainer>
            {events.slice(0, 5).map((event, index) => (
              <BarItem key={event.id}>
                <BarLabel title={event.name}>{event.name}</BarLabel>
                <BarTrack>
                  <BarFill 
                    $color={barColors[index % barColors.length]}
                    $percentage={(event.registrations / maxRegistrations) * 100}
                  >
                    <BarValue>{event.registrations}</BarValue>
                  </BarFill>
                </BarTrack>
              </BarItem>
            ))}
          </BarChartContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Répartition des résultats</ChartTitle>
          <PieChartContainer>
            <PieChartSvg viewBox="0 0 200 200">
              {pieSlices.map((slice, index) => (
                <path
                  key={index}
                  d={slice.path}
                  fill={slice.color}
                />
              ))}
              <circle cx="100" cy="100" r="50" fill="white" />
              <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
                {total}
              </text>
              <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6b7280">
                candidats
              </text>
            </PieChartSvg>
            <PieLegend>
              {pieSlices.map((item, index) => (
                <LegendItem key={index}>
                  <LegendColor $color={item.color}>{item.label}</LegendColor>
                  <LegendValue>{item.value} ({item.percentage}%)</LegendValue>
                </LegendItem>
              ))}
            </PieLegend>
          </PieChartContainer>
        </ChartCard>
      </ChartsGrid>

      <TableSection>
        <TableHeader>
          <ChartTitle style={{ margin: 0 }}>Performance par concours</ChartTitle>
        </TableHeader>
        <Table>
          <TableHead>
            <tr>
              <th>Concours</th>
              <th>Inscriptions</th>
              <th>Taux de remplissage</th>
              <th>Taux d'admission</th>
            </tr>
          </TableHead>
          <TableBody>
            {events.map(event => {
              const fillRate = Math.round((event.registrations / event.maxRegistrations) * 100);
              return (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.registrations} / {event.maxRegistrations}</td>
                  <td>
                    <ProgressCell>
                      <MiniProgress>
                        <MiniProgressFill $percentage={fillRate} />
                      </MiniProgress>
                      <span>{fillRate}%</span>
                    </ProgressCell>
                  </td>
                  <td>{event.admissionRate}%</td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </TableSection>
    </UniversityLayout>
  );
};

export default Statistics;
