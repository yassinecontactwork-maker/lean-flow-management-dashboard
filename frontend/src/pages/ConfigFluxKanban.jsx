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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { configFluxKanbanAPI, articlesAPI, postesTravailAPI } from '../services/api';
import PageHeader from '../components/PageHeader';

function ConfigFluxKanban() {
  const [flux, setFlux] = useState([]);
  const [articles, setArticles] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlux, setEditingFlux] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    article: '',
    poste_fournisseur: '',
    poste_consommateur: '',
    demande_moyenne: '',
    lead_time_jours: '',
    capacite_conteneur: '',
    actif: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fluxRes, articlesRes, postesRes] = await Promise.all([
        configFluxKanbanAPI.getAll(),
        articlesAPI.getAll(),
        postesTravailAPI.getAll(),
      ]);
      setFlux(fluxRes.data);
      setArticles(articlesRes.data);
      setPostes(postesRes.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (f = null) => {
    if (f) {
      setEditingFlux(f);
      setFormData({
        article: f.article,
        poste_fournisseur: f.poste_fournisseur,
        poste_consommateur: f.poste_consommateur,
        demande_moyenne: f.demande_moyenne,
        lead_time_jours: f.lead_time_jours,
        capacite_conteneur: f.capacite_conteneur,
        actif: f.actif,
      });
    } else {
      setEditingFlux(null);
      setFormData({
        article: '',
        poste_fournisseur: '',
        poste_consommateur: '',
        demande_moyenne: '',
        lead_time_jours: '',
        capacite_conteneur: '',
        actif: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFlux(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingFlux) {
        await configFluxKanbanAPI.update(editingFlux.id, formData);
        setAlert({ severity: 'success', message: 'Flux mis à jour avec succès' });
      } else {
        await configFluxKanbanAPI.create(formData);
        setAlert({ severity: 'success', message: 'Flux créé avec succès' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce flux ?')) return;
    try {
      await configFluxKanbanAPI.delete(id);
      setAlert({ severity: 'success', message: 'Flux supprimé avec succès' });
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const handleCreerCartes = async (id) => {
    try {
      const response = await configFluxKanbanAPI.creerCartes(id);
      setAlert({ severity: 'success', message: response.data.message || 'Cartes créées avec succès' });
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la création des cartes' });
    }
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Configuration Flux Kanban"
        subtitle="Paramétrage des flux, conteneurs et capacités par article."
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

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Article</TableCell>
                <TableCell>Fournisseur</TableCell>
                <TableCell>Consommateur</TableCell>
                <TableCell align="right">Demande Moy.</TableCell>
                <TableCell align="right">Lead Time</TableCell>
                <TableCell align="right">Capacité</TableCell>
                <TableCell align="right">Nb Cartes</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flux.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {f.article_detail?.sku}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.article_detail?.designation}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {f.poste_fournisseur_detail?.nom || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {f.poste_consommateur_detail?.nom || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="600">
                      {f.demande_moyenne}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{f.lead_time_jours} j</TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="600">
                      {f.capacite_conteneur}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${f.nombre_cartes_actuelles}/${f.nombre_cartes_optimal}`}
                      color={f.nombre_cartes_actuelles >= f.nombre_cartes_optimal ? 'success' : 'warning'}
                      size="medium"
                      sx={{ fontWeight: 600, minWidth: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={f.actif ? 'Actif' : 'Inactif'}
                      color={f.actif ? 'success' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Créer les cartes">
                      <IconButton
                        size="large"
                        color="primary"
                        onClick={() => handleCreerCartes(f.id)}
                        sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                      >
                        <QrCodeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="large"
                        color="primary"
                        onClick={() => handleOpenDialog(f)}
                        sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => handleDelete(f.id)}
                        sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
        onClick={() => handleOpenDialog()}
      >
        <AddIcon fontSize="large" />
      </Fab>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: '#ffffff' }}>
          {editingFlux ? 'Modifier le Flux Kanban' : 'Nouveau Flux Kanban'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
                {articles.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.sku} - {a.designation}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Poste Fournisseur"
                name="poste_fournisseur"
                value={formData.poste_fournisseur}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {postes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Poste Consommateur"
                name="poste_consommateur"
                value={formData.poste_consommateur}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {postes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Demande Moyenne"
                name="demande_moyenne"
                type="number"
                value={formData.demande_moyenne}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Lead Time (jours)"
                name="lead_time_jours"
                type="number"
                value={formData.lead_time_jours}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Capacité conteneur"
                name="capacite_conteneur"
                type="number"
                value={formData.capacite_conteneur}
                onChange={handleChange}
                required
                variant="outlined"
              />
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
            {editingFlux ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConfigFluxKanban;
