  import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Cancel as CancelIcon,
  AutoAwesome as AutoAwesomeIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  PendingActions as PendingActionsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { recommandationsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';

function Recommandations() {
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadRecommandations();
  }, []);

  const loadRecommandations = async () => {
    try {
      setLoading(true);
      const response = await recommandationsAPI.getAll();
      setRecommandations(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des recommandations' });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuter = async (id) => {
    try {
      const response = await recommandationsAPI.executer(id);
      setAlert({ severity: 'success', message: response.data.message || 'Recommandation exécutée avec succès' });
      loadRecommandations();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: error.response?.data?.error || 'Erreur lors de l\'exécution' });
    }
  };

  const handleRejeter = async (id) => {
    try {
      await recommandationsAPI.rejeter(id);
      setAlert({ severity: 'info', message: 'Recommandation rejetée' });
      loadRecommandations();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du rejet' });
    }
  };

  const handleGenererAutomatiques = async () => {
    try {
      const response = await recommandationsAPI.genererAutomatiques();
      setAlert({ severity: 'success', message: response.data.message || 'Recommandations générées automatiquement' });
      loadRecommandations();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la génération automatique' });
    }
  };

  const stats = {
    total: recommandations.length,
    enAttente: recommandations.filter(r => r.statut === 'EN_ATTENTE').length,
    executees: recommandations.filter(r => r.statut === 'EXECUTEE').length,
    rejetees: recommandations.filter(r => r.statut === 'REJETEE').length,
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'warning';
      case 'EXECUTEE':
        return 'success';
      case 'REJETEE':
        return 'error';
      case 'VALIDEE':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'REAPPRO':
        return 'primary';
      case 'ACCELERER':
        return 'warning';
      case 'RALENTIR':
        return 'info';
      case 'ANNULER':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatRecommandationLabel = (value) => {
    const labels = {
      EN_ATTENTE: 'En attente',
      EXECUTEE: 'Exécutée',
      REJETEE: 'Rejetée',
      VALIDEE: 'Validée',
      REAPPRO: 'Réapprovisionnement',
      ACCELERER: 'Accélérer',
      RALENTIR: 'Ralentir',
      ANNULER: 'Annuler',
    };
    return labels[value] || String(value || '').replaceAll('_', ' ');
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Recommandations DDMRP"
        subtitle="Priorisation des actions de réapprovisionnement et arbitrage des buffers."
        actions={
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleGenererAutomatiques}>
              Générer automatiquement
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadRecommandations}>
              Actualiser
            </Button>
          </Box>
        }
      />

      {alert && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert(null)}
          sx={{ borderRadius: 3, fontSize: '1rem' }}
        >
          {alert.message}
        </Alert>
      )}

      {loading && <LinearProgress />}

      <Box className="kpi-grid">
        <KpiCard label="Total" value={stats.total} icon={<PlaylistAddCheckIcon />} />
        <KpiCard label="En attente" value={stats.enAttente} icon={<PendingActionsIcon />} tone="warning" />
        <KpiCard label="Exécutées" value={stats.executees} icon={<PlaylistAddCheckIcon />} tone="success" />
        <KpiCard label="Rejetées" value={stats.rejetees} icon={<CloseIcon />} tone="danger" />
      </Box>

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Buffer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Justification</TableCell>
                <TableCell>Date création</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recommandations.map((reco) => (
                <TableRow key={reco.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {reco.buffer_detail?.article_sku || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @ {reco.buffer_detail?.poste_nom || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatRecommandationLabel(reco.type_recommandation)}
                      color={getTypeColor(reco.type_recommandation)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="700">
                      {reco.quantite}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`P${reco.priorite}`}
                      color={reco.priorite <= 2 ? 'error' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatRecommandationLabel(reco.statut)}
                      color={getStatutColor(reco.statut)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{reco.justification}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(reco.date_creation).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {reco.statut === 'EN_ATTENTE' && (
                      <>
                        <Tooltip title="Exécuter la recommandation">
                          <IconButton
                            size="large"
                            color="success"
                            onClick={() => handleExecuter(reco.id)}
                            sx={{ bgcolor: 'rgba(22, 163, 74, 0.1)' }}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rejeter la recommandation">
                          <IconButton
                            size="large"
                            color="error"
                            onClick={() => handleRejeter(reco.id)}
                            sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)' }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Recommandations;
