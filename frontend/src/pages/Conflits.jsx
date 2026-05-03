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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Gavel as GavelIcon,
  ReportProblem as ReportProblemIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { conflitsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import { useSearch } from '../context/SearchContext';
import { matchesSearch } from '../utils/search';

function Conflits() {
  const { searchQuery } = useSearch();
  const [conflits, setConflits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConflit, setSelectedConflit] = useState(null);
  const [formData, setFormData] = useState({
    methode: '',
    decision: '',
  });

  useEffect(() => {
    loadConflits();
  }, []);

  const loadConflits = async () => {
    try {
      setLoading(true);
      const response = await conflitsAPI.getAll();
      setConflits(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des conflits' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResolution = (conflit) => {
    setSelectedConflit(conflit);
    setFormData({
      methode: '',
      decision: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedConflit(null);
  };

  const handleResoudre = async () => {
    try {
      await conflitsAPI.resoudre(selectedConflit.id, formData.methode, formData.decision);
      setAlert({ severity: 'success', message: 'Conflit résolu avec succès' });
      handleCloseDialog();
      loadConflits();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: error.response?.data?.error || 'Erreur lors de la résolution' });
    }
  };

  const stats = {
    total: conflits.length,
    enAttente: conflits.filter(c => c.statut === 'EN_ATTENTE').length,
    resolus: conflits.filter(c => c.statut.startsWith('RESOLU')).length,
  };

  const getStatutColor = (statut) => {
    if (statut === 'EN_ATTENTE') return 'error';
    if (statut.startsWith('RESOLU')) return 'success';
    if (statut === 'IGNORE') return 'default';
    return 'default';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'KANBAN_CONWIP':
        return 'primary';
      case 'KANBAN_DDMRP':
        return 'secondary';
      case 'CONWIP_DDMRP':
        return 'warning';
      case 'MULTI':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatConflitLabel = (value) => {
    const labels = {
      EN_ATTENTE: 'En attente',
      RESOLU_KANBAN: 'Résolu Kanban',
      RESOLU_CONWIP: 'Résolu CONWIP',
      RESOLU_DDMRP: 'Résolu DDMRP',
      RESOLU_MANUEL: 'Résolu manuel',
      IGNORE: 'Ignoré',
      KANBAN_CONWIP: 'Kanban / CONWIP',
      KANBAN_DDMRP: 'Kanban / DDMRP',
      CONWIP_DDMRP: 'CONWIP / DDMRP',
      MULTI: 'Multi-signaux',
    };
    return labels[value] || String(value || '').replaceAll('_', ' ');
  };

  const filteredConflits = conflits.filter((conflit) =>
    matchesSearch(conflit, searchQuery, [
      'description',
      'type_conflit',
      'statut',
      'priorite',
      (item) => item.article_detail?.sku,
      (item) => item.article_detail?.designation,
      (item) => item.poste_detail?.nom,
      (item) => formatConflitLabel(item.type_conflit),
      (item) => formatConflitLabel(item.statut),
    ]),
  );

  return (
    <Box className="page-shell">
      <PageHeader
        title="Conflits"
        subtitle="Arbitrage entre signaux Kanban, CONWIP et DDMRP."
        actions={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadConflits}>
            Actualiser
          </Button>
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
        <KpiCard label="Total conflits" value={stats.total} icon={<ReportProblemIcon />} />
        <KpiCard label="En attente" value={stats.enAttente} icon={<ReportProblemIcon />} tone="danger" />
        <KpiCard label="Résolus" value={stats.resolus} icon={<TaskAltIcon />} tone="success" />
      </Box>

      {stats.enAttente > 0 && (
        <Alert severity="warning" sx={{ borderRadius: 3, fontSize: '1.05rem', py: 2 }}>
          <strong>Attention :</strong> {stats.enAttente} conflit(s) en attente de décision immédiate.
        </Alert>
      )}

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type Conflit</TableCell>
                <TableCell>Article / Poste</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date création</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConflits.map((conflit) => (
                <TableRow key={conflit.id}>
                  <TableCell>
                    <Chip
                      label={formatConflitLabel(conflit.type_conflit)}
                      color={getTypeColor(conflit.type_conflit)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {conflit.article_detail?.sku || '-'}
                    </Typography>
                    {conflit.poste_detail && (
                      <Typography variant="body2" color="text.secondary">
                        @ {conflit.poste_detail.nom}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">{conflit.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`P${conflit.priorite}`}
                      color={conflit.priorite <= 2 ? 'error' : conflit.priorite <= 4 ? 'warning' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatConflitLabel(conflit.statut)}
                      color={getStatutColor(conflit.statut)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(conflit.date_creation).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {conflit.statut === 'EN_ATTENTE' && (
                      <Tooltip title="Résoudre le conflit">
                        <IconButton
                          size="large"
                          color="primary"
                          onClick={() => handleOpenResolution(conflit)}
                          sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                        >
                          <GavelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: '#ffffff' }}>
          Résoudre le conflit - {selectedConflit?.article_detail?.sku}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          {selectedConflit && (
            <Box>
              <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
                <Typography variant="body1" fontWeight="600">
                  {selectedConflit.description}
                </Typography>
              </Alert>

              <TextField
                select
                fullWidth
                label="Méthode de résolution"
                value={formData.methode}
                onChange={(e) => setFormData({ ...formData, methode: e.target.value })}
                required
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <MenuItem value="KANBAN">Priorité Kanban</MenuItem>
                <MenuItem value="CONWIP">Priorité CONWIP</MenuItem>
                <MenuItem value="DDMRP">Priorité DDMRP</MenuItem>
                <MenuItem value="MANUEL">Décision manuelle</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Justification de la décision"
                value={formData.decision}
                onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                multiline
                rows={4}
                placeholder="Expliquez votre choix et les impacts..."
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} size="large">
            Annuler
          </Button>
          <Button
            onClick={handleResoudre}
            variant="contained"
            color="primary"
            size="large"
            disabled={!formData.methode}
          >
            Résoudre le conflit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Conflits;
