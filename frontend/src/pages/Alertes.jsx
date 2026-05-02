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
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AutoAwesome as AutoAwesomeIcon,
  Warning as WarningIcon,
  DoneAll as DoneAllIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { alertesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';

function Alertes() {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadAlertes();
  }, []);

  const loadAlertes = async () => {
    try {
      setLoading(true);
      const response = await alertesAPI.getAll();
      setAlertes(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des alertes' });
    } finally {
      setLoading(false);
    }
  };

  const handleResoudre = async (id) => {
    try {
      await alertesAPI.resoudre(id);
      setAlert({ severity: 'success', message: 'Alerte résolue avec succès' });
      loadAlertes();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Erreur lors de la résolution' });
    }
  };

  const handleIgnorer = async (id) => {
    try {
      await alertesAPI.ignorer(id);
      setAlert({ severity: 'info', message: 'Alerte ignorée' });
      loadAlertes();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Erreur lors de l\'ignorance' });
    }
  };

  const handleGenererAutomatiques = async () => {
    try {
      const response = await alertesAPI.genererAutomatiques();
      setAlert({ severity: 'success', message: response.data.message || 'Alertes générées automatiquement' });
      loadAlertes();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Erreur lors de la génération automatique' });
    }
  };

  const stats = {
    total: alertes.length,
    actives: alertes.filter(a => a.statut === 'ACTIVE').length,
    resolues: alertes.filter(a => a.statut === 'RESOLUE').length,
    ignorees: alertes.filter(a => a.statut === 'IGNOREE').length,
  };

  const getSeveriteColor = (severite) => {
    switch (severite) {
      case 'CRITIQUE':
        return 'error';
      case 'HAUTE':
        return 'warning';
      case 'MOYENNE':
        return 'primary';
      case 'BASSE':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'ACTIVE':
        return 'error';
      case 'RESOLUE':
        return 'success';
      case 'IGNOREE':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatAlerteLabel = (value) => {
    const labels = {
      ACTIVE: 'Active',
      RESOLUE: 'Résolue',
      IGNOREE: 'Ignorée',
      CRITIQUE: 'Critique',
      HAUTE: 'Haute',
      MOYENNE: 'Moyenne',
      BASSE: 'Basse',
      STOCK_BAS: 'Stock bas',
      WIP_ELEVE: 'WIP élevé',
      GOULET: 'Goulet',
      BUFFER_ROUGE: 'Buffer rouge',
      KANBAN_VIDE: 'Kanban vide',
    };
    return labels[value] || String(value || '').replaceAll('_', ' ');
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Alertes système"
        subtitle="Suivi des alertes actives, résolues et ignorées en temps réel."
        actions={
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleGenererAutomatiques}>
              Générer automatiquement
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadAlertes}>
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
        <KpiCard label="Total alertes" value={stats.total} icon={<WarningIcon />} />
        <KpiCard label="Actives" value={stats.actives} icon={<WarningIcon />} tone="danger" />
        <KpiCard label="Résolues" value={stats.resolues} icon={<DoneAllIcon />} tone="success" />
        <KpiCard label="Ignorées" value={stats.ignorees} icon={<RemoveCircleIcon />} tone="neutral" />
      </Box>

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Sévérité</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Article / Poste</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alertes.map((alerte) => (
                <TableRow key={alerte.id}>
                  <TableCell>
                    <Chip label={formatAlerteLabel(alerte.type_alerte)} size="medium" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatAlerteLabel(alerte.severite)}
                      color={getSeveriteColor(alerte.severite)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">
                      {alerte.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {alerte.article_detail && (
                      <Typography variant="body2" fontWeight="600">
                        {alerte.article_detail.sku}
                      </Typography>
                    )}
                    {alerte.poste_detail && (
                      <Typography variant="body2" fontWeight="600">
                        {alerte.poste_detail.nom}
                      </Typography>
                    )}
                    {!alerte.article_detail && !alerte.poste_detail && '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatAlerteLabel(alerte.statut)}
                      color={getStatutColor(alerte.statut)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(alerte.date_creation).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {alerte.statut === 'ACTIVE' && (
                      <>
                        <Tooltip title="Résoudre">
                          <IconButton
                            size="large"
                            color="success"
                            onClick={() => handleResoudre(alerte.id)}
                            sx={{ bgcolor: 'rgba(22, 163, 74, 0.1)' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ignorer">
                          <IconButton
                            size="large"
                            onClick={() => handleIgnorer(alerte.id)}
                            sx={{ bgcolor: 'rgba(100, 116, 139, 0.12)' }}
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

export default Alertes;
