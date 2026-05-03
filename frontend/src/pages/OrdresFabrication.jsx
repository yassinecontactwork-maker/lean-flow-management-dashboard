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
  Fab,
  Tooltip,
  Alert,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  PendingActions as PendingActionsIcon,
  RocketLaunch as RocketLaunchIcon,
} from '@mui/icons-material';
import { ordresFabricationAPI, articlesAPI, postesTravailAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import { useSearch } from '../context/SearchContext';
import { matchesSearch } from '../utils/search';

function OrdresFabrication() {
  const { searchQuery } = useSearch();
  const [ordres, setOrdres] = useState([]);
  const [articles, setArticles] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    numero: '',
    article: '',
    poste: '',
    quantite: '',
    priorite: 3,
    source: 'MANUEL',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordresRes, articlesRes, postesRes] = await Promise.all([
        ordresFabricationAPI.getAll(),
        articlesAPI.getAll(),
        postesTravailAPI.getAll(),
      ]);
      setOrdres(ordresRes.data);
      setArticles(articlesRes.data);
      setPostes(postesRes.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des ordres' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    setFormData({
      numero: `OF-${timestamp}`,
      article: '',
      poste: '',
      quantite: '',
      priorite: 3,
      source: 'MANUEL',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await ordresFabricationAPI.create(formData);
      setAlert({ severity: 'success', message: 'Ordre de fabrication créé avec succès' });
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la création de l\'ordre' });
    }
  };

  const handleDemarrer = async (id) => {
    try {
      await ordresFabricationAPI.demarrer(id);
      setAlert({ severity: 'success', message: 'Ordre démarré avec succès' });
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: error.response?.data?.error || 'Erreur lors du démarrage' });
    }
  };

  const handleTerminer = async (id) => {
    try {
      await ordresFabricationAPI.terminer(id);
      setAlert({ severity: 'success', message: 'Ordre terminé et stock mis à jour' });
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: error.response?.data?.error || 'Erreur lors de la terminaison' });
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'warning';
      case 'EN_COURS':
        return 'primary';
      case 'TERMINE':
        return 'success';
      case 'ANNULE':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminé';
      case 'ANNULE':
        return 'Annulé';
      default:
        return statut;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'KANBAN':
        return 'primary';
      case 'CONWIP':
        return 'secondary';
      case 'DDMRP':
        return 'success';
      case 'MANUEL':
        return 'default';
      default:
        return 'default';
    }
  };

  const tabFilteredOrdres = ordres.filter((ordre) => {
    if (tabValue === 0) return ordre.statut === 'EN_ATTENTE';
    if (tabValue === 1) return ordre.statut === 'EN_COURS';
    if (tabValue === 2) return ordre.statut === 'TERMINE';
    return true;
  });

  const filteredOrdres = tabFilteredOrdres.filter((ordre) =>
    matchesSearch(ordre, searchQuery, [
      'numero',
      'source',
      'statut',
      'priorite',
      'quantite',
      (item) => item.article_detail?.sku,
      (item) => item.article_detail?.designation,
      (item) => item.poste_detail?.nom,
      (item) => getStatutLabel(item.statut),
    ]),
  );

  const stats = {
    enAttente: ordres.filter(o => o.statut === 'EN_ATTENTE').length,
    enCours: ordres.filter(o => o.statut === 'EN_COURS').length,
    termines: ordres.filter(o => o.statut === 'TERMINE').length,
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Ordres de fabrication"
        subtitle="Suivi des OF et de leur état d'avancement."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
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
        <KpiCard
          label="En attente"
          value={stats.enAttente}
          icon={<PendingActionsIcon />}
          tone="warning"
        />
        <KpiCard
          label="En cours"
          value={stats.enCours}
          icon={<RocketLaunchIcon />}
        />
        <KpiCard
          label="Terminés"
          value={stats.termines}
          icon={<PlaylistAddCheckIcon />}
          tone="success"
        />
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}
      >
        <Tab label={`En Attente (${stats.enAttente})`} />
        <Tab label={`En Cours (${stats.enCours})`} />
        <Tab label={`Terminés (${stats.termines})`} />
        <Tab label={`Tous (${ordres.length})`} />
      </Tabs>

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro OF</TableCell>
                <TableCell>Article</TableCell>
                <TableCell>Poste</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrdres.map((ordre) => (
                <TableRow key={ordre.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {ordre.numero}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {ordre.article_detail?.sku || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ordre.article_detail?.designation || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {ordre.poste_detail?.nom || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="700">
                      {ordre.quantite}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`P${ordre.priorite}`}
                      color={ordre.priorite <= 2 ? 'error' : 'default'}
                      size="medium"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ordre.source}
                      color={getSourceColor(ordre.source)}
                      size="medium"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatutLabel(ordre.statut)}
                      color={getStatutColor(ordre.statut)}
                      size="medium"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {ordre.statut === 'EN_ATTENTE' && (
                      <Tooltip title="Démarrer l'ordre">
                        <IconButton
                          size="large"
                          color="success"
                          onClick={() => handleDemarrer(ordre.id)}
                          sx={{ bgcolor: 'rgba(22, 163, 74, 0.1)' }}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {ordre.statut === 'EN_COURS' && (
                      <Tooltip title="Terminer l'ordre">
                        <IconButton
                          size="large"
                          color="primary"
                          onClick={() => handleTerminer(ordre.id)}
                          sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                        >
                          <StopIcon />
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

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 64,
          height: 64,
        }}
        onClick={handleOpenDialog}
      >
        <AddIcon fontSize="large" />
      </Fab>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: '#ffffff' }}>
          Nouvel Ordre de Fabrication
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Numéro OF"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Article"
                name="article"
                value={formData.article}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {articles.map((article) => (
                  <MenuItem key={article.id} value={article.id}>
                    {article.sku} - {article.designation}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Poste de Travail"
                name="poste"
                value={formData.poste}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {postes.map((poste) => (
                  <MenuItem key={poste.id} value={poste.id}>
                    {poste.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantité"
                name="quantite"
                type="number"
                value={formData.quantite}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Priorité"
                name="priorite"
                value={formData.priorite}
                onChange={handleChange}
                variant="outlined"
              >
                <MenuItem value={1}>1 - Très haute</MenuItem>
                <MenuItem value={2}>2 - Haute</MenuItem>
                <MenuItem value={3}>3 - Normale</MenuItem>
                <MenuItem value={4}>4 - Basse</MenuItem>
                <MenuItem value={5}>5 - Très basse</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                variant="outlined"
              >
                <MenuItem value="MANUEL">Manuel</MenuItem>
                <MenuItem value="KANBAN">Kanban</MenuItem>
                <MenuItem value="CONWIP">CONWIP</MenuItem>
                <MenuItem value="DDMRP">DDMRP</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} size="large">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="large"
          >
            Créer l'Ordre
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrdresFabrication;
