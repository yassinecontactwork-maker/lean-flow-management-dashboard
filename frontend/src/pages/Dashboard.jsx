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
          padding: 20,
          font: { size: 13, weight: '600' },
        },
      },
    },
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Tableau de bord Lean Manufacturing"
        subtitle="Vue globale sur l'exécution, les flux Kanban/CONWIP et la santé DDMRP."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStats}
          >
            Actualiser
          </Button>
        }
      />

      <Box className="kpi-grid">
        <KpiCard
          label="Ordres de fabrication"
          value={stats.ordres?.total || 0}
          icon={<AssignmentIcon />}
        />
        <KpiCard
          label="Cartes Kanban actives"
          value={stats.cartes?.total || 0}
          icon={<InventoryIcon />}
          tone="warning"
        />
        <KpiCard
          label="Alertes actives"
          value={stats.alertes?.actives || 0}
          icon={<WarningIcon />}
          tone="danger"
        />
        <KpiCard
          label="Conflits en attente"
          value={stats.conflits?.en_attente || 0}
          icon={<ReportIcon />}
          tone="neutral"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card className="panel" sx={{ height: '100%' }}>
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600">
                Répartition des ordres de fabrication
              </Typography>
              <Box sx={{ height: 320 }}>
                <Pie data={ordresChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card className="panel" sx={{ height: '100%' }}>
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600">
                État des buffers DDMRP
              </Typography>
              <Box sx={{ height: 320 }}>
                <Bar data={buffersChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="panel">
            <CardContent className="section-stack" sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600">
                Situation Kanban
              </Typography>
              <Box className="tag-group" sx={{ mt: 1 }}>
                <Chip
                  label={`Cartes Pleines: ${stats.cartes?.pleines || 0}`}
                  color="success"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Cartes Vides: ${stats.cartes?.vides || 0}`}
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
              <Typography variant="h6" fontWeight="600">
                Alertes et Conflits
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                    Alertes
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight="700">
                    {stats.alertes?.resolues || 0} Résolues
                  </Typography>
                  <Typography variant="h5" color="error.main" fontWeight="700">
                    {stats.alertes?.actives || 0} Actives
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                    Conflits
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight="700">
                    {stats.conflits?.resolus || 0} Résolus
                  </Typography>
                  <Typography variant="h5" color="warning.main" fontWeight="700">
                    {stats.conflits?.en_attente || 0} En attente
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
