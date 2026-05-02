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
  Fab,
  Tooltip,
  Alert,
  LinearProgress,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  PrecisionManufacturing as PrecisionIcon,
} from '@mui/icons-material';
import { postesTravailAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';

function PostesTravail() {
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPoste, setEditingPoste] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    capacite_horaire: '',
    est_goulet: false,
  });

  useEffect(() => {
    loadPostes();
  }, []);

  const loadPostes = async () => {
    try {
      setLoading(true);
      const response = await postesTravailAPI.getAll();
      setPostes(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des postes de travail' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (poste = null) => {
    if (poste) {
      setEditingPoste(poste);
      setFormData({
        nom: poste.nom,
        capacite_horaire: poste.capacite_horaire,
        est_goulet: poste.est_goulet,
      });
    } else {
      setEditingPoste(null);
      setFormData({
        nom: '',
        capacite_horaire: '',
        est_goulet: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPoste(null);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingPoste) {
        await postesTravailAPI.update(editingPoste.id, formData);
        setAlert({ severity: 'success', message: 'Poste de travail mis à jour avec succès' });
      } else {
        await postesTravailAPI.create(formData);
        setAlert({ severity: 'success', message: 'Poste de travail créé avec succès' });
      }
      handleCloseDialog();
      loadPostes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la sauvegarde du poste' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce poste de travail ?')) return;

    try {
      await postesTravailAPI.delete(id);
      setAlert({ severity: 'success', message: 'Poste supprimé avec succès' });
      loadPostes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la suppression du poste' });
    }
  };

  const goulets = postes.filter(p => p.est_goulet);

  return (
    <Box className="page-shell">
      <PageHeader
        title="Postes de Travail"
        subtitle="Capacités, goulets et supervision des ressources de production."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPostes}
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
          label="Total postes"
          value={postes.length}
          icon={<PrecisionIcon />}
        />
        <KpiCard
          label="Goulets détectés"
          value={goulets.length}
          icon={<WarningIcon />}
          tone="danger"
        />
      </Box>

      {goulets.length > 0 && (
        <Alert
          severity="error"
          icon={<WarningIcon />}
          sx={{ borderRadius: 3, py: 3 }}
        >
          <Typography variant="h6" fontWeight="600">
            Attention : {goulets.length} goulet(s) détecté(s) - {goulets.map(g => g.nom).join(', ')}
          </Typography>
        </Alert>
      )}

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom du poste</TableCell>
                <TableCell align="right">Capacité horaire</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {postes.map((poste) => (
                <TableRow key={poste.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600" color={poste.est_goulet ? 'error.main' : 'inherit'}>
                      {poste.nom}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="700">
                      {poste.capacite_horaire} unités/h
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={poste.est_goulet ? <WarningIcon /> : undefined}
                      label={poste.est_goulet ? 'GOULET' : 'Normal'}
                      color={poste.est_goulet ? 'error' : 'success'}
                      size="medium"
                      sx={{ fontWeight: 600, minWidth: 120 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton
                        size="large"
                        color="primary"
                        onClick={() => handleOpenDialog(poste)}
                        sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => handleDelete(poste.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: '#ffffff' }}>
          {editingPoste ? 'Modifier le Poste de Travail' : 'Nouveau Poste de Travail'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du poste"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Capacité horaire (unités/h)"
                name="capacite_horaire"
                type="number"
                value={formData.capacite_horaire}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.est_goulet}
                    onChange={handleChange}
                    name="est_goulet"
                    color="error"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight="600">
                    Marquer comme goulet d'etranglement
                  </Typography>
                }
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
            {editingPoste ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PostesTravail;
