 import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
  ordresFabricationAPI,
  cartesKanbanAPI,
  alertesAPI,
  conflitsAPI,
  buffersDDMRPAPI,
} from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordres: null,
    cartes: null,
    alertes: null,
    conflits: null,
    buffers: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [ordresRes, cartesRes, alertesRes, conflitsRes, buffersRes] = await Promise.all([
        ordresFabricationAPI.statistiques(),
        cartesKanbanAPI.statistiques(),
        alertesAPI.statistiques(),
        conflitsAPI.statistiques(),
        buffersDDMRPAPI.statistiques(),
      ]);

      setStats({
        ordres: ordresRes.data,
        cartes: cartesRes.data,
        alertes: alertesRes.data,
        conflits: conflitsRes.data,
        buffers: buffersRes.data,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={80} thickness={5} color="primary" />
      </Box>
    );
  }

  const ordresChartData = {
    labels: ['En attente', 'En cours', 'Terminés'],
    datasets: [
      {
        data: [
          stats.ordres?.en_attente || 0,
          stats.ordres?.en_cours || 0,
          stats.ordres?.termines || 0,
        ],
        backgroundColor: ['#D97706', '#2563EB', '#16A34A'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const buffersChartData = {
    labels: ['Zone Rouge', 'Zone Jaune', 'Zone Verte'],
    datasets: [
      {
        label: 'Nombre de Buffers',
        data: [
          stats.buffers?.par_niveau?.rouge || 0,
          stats.buffers?.par_niveau?.jaune || 0,
          stats.buffers?.par_niveau?.vert || 0,
        ],
        backgroundColor: ['#DC2626', '#D97706', '#16A34A'],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
        maxBarThickness: 46,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 18,
          color: '#64748B',
          font: { size: 13, weight: '600' },
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 12,
        titleFont: { size: 14, weight: '700' },
        bodyFont: { size: 14 },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { size: 13, weight: '600' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
        ticks: { color: '#64748B', precision: 0 },
      },
    },
  };

  const statusBlocks = [
    {
      label: 'Alertes résolues',
      value: stats.alertes?.resolues || 0,
      color: 'success.main',
    },
    {
      label: 'Alertes actives',
      value: stats.alertes?.actives || 0,
      color: 'error.main',
    },
    {
      label: 'Conflits résolus',
      value: stats.conflits?.resolus || 0,
      color: 'success.main',
    },
    {
      label: 'Conflits en attente',
      value: stats.conflits?.en_attente || 0,
      color: 'warning.main',
    },
  ];

  return (
    <Box className="page-shell">
      <PageHeader
        title="Tableau de bord Lean Manufacturing"
        subtitle="Vue globale sur l'exécution, les flux Kanban/CONWIP et la santé DDMRP."
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip label="Système OK" color="success" variant="outlined" />
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadStats}
            >
              Actualiser
            </Button>
          </Stack>
        }
      />

      <Box className="kpi-grid">
        <KpiCard
          label="Ordres de fabrication"
          value={stats.ordres?.total || 0}
          icon={<AssignmentIcon />}
          foot={`${stats.ordres?.en_cours || 0} en cours`}
        />
        <KpiCard
          label="Cartes Kanban actives"
          value={stats.cartes?.total || 0}
          icon={<InventoryIcon />}
          tone="warning"
          foot={`${stats.cartes?.vides || 0} cartes vides`}
        />
        <KpiCard
          label="Alertes actives"
          value={stats.alertes?.actives || 0}
          icon={<WarningIcon />}
          tone="danger"
          foot={`${stats.alertes?.resolues || 0} résolues`}
        />
        <KpiCard
          label="Conflits en attente"
          value={stats.conflits?.en_attente || 0}
          icon={<ReportIcon />}
          tone="warning"
          foot={`${stats.conflits?.resolus || 0} résolus`}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card className="panel" sx={{ height: '100%' }}>
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Box className="panel-header">
                <Box>
                  <Typography className="panel-title">Répartition des ordres</Typography>
                  <Typography className="panel-subtitle">Attente, exécution et clôture</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <Pie data={ordresChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card className="panel" sx={{ height: '100%' }}>
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Box className="panel-header">
                <Box>
                  <Typography className="panel-title">État des buffers DDMRP</Typography>
                  <Typography className="panel-subtitle">Zones rouge, jaune et verte</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar data={buffersChartData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="panel">
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Typography className="panel-title">Situation Kanban</Typography>
              <Box className="tag-group" sx={{ mt: 1 }}>
                <Chip
                  label={`Pleines: ${stats.cartes?.pleines || 0}`}
                  color="success"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Vides: ${stats.cartes?.vides || 0}`}
                  color="error"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Taux de remplissage: ${stats.cartes?.taux_remplissage || 0}%`}
                  color="primary"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="panel">
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Typography className="panel-title">Alertes et conflits</Typography>
              <Box className="status-grid">
                {statusBlocks.map((block) => (
                  <Box key={block.label} className="status-card">
                    <Typography variant="caption" color="text.secondary" fontWeight="800">
                      {block.label}
                    </Typography>
                    <Typography variant="h5" color={block.color} fontWeight="800">
                      {block.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
