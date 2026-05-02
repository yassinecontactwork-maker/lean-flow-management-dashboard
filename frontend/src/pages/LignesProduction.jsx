 import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ConfirmationNumber as TicketIcon,
  Warning as WarningIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { lignesProductionAPI } from '../services/api';
import PageHeader from '../components/PageHeader';

function LignesProduction() {
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    wip_critique: '',
  });

  useEffect(() => {
    loadLignes();
  }, []);

  const loadLignes = async () => {
    try {
      setLoading(true);
      const response = await lignesProductionAPI.getAll();
      setLignes(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des lignes' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreerTickets = async (id) => {
    try {
      const response = await lignesProductionAPI.creerTickets(id);
      setAlert({ severity: 'success', message: response.data.message || 'Tickets créés avec succès' });
      loadLignes();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({
        severity: 'error',
        message: error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création des tickets',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      await lignesProductionAPI.create(formData);
      setAlert({ severity: 'success', message: 'Ligne de production créée avec succès' });
      setOpenDialog(false);
      loadLignes();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({
        severity: 'error',
        message: error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de la création de la ligne',
      });
    }
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Lignes de Production CONWIP"
        subtitle="Pilotage des flux, WIP critique et séquence des postes." 
        actions={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadLignes}>
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

      <Grid container spacing={3}>
        {lignes.map((ligne) => (
          <Grid item xs={12} lg={6} key={ligne.id}>
            <Card className="panel" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      {ligne.nom}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      {ligne.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  <Chip
                    label={ligne.active ? 'Active' : 'Inactive'}
                    color={ligne.active ? 'success' : 'default'}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight="600">
                      WIP Actuel
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color={ligne.est_saturee ? 'error.main' : 'text.primary'}>
                      {ligne.wip_actuel}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight="600">
                      WIP Critique
                    </Typography>
                    <Typography variant="h3" fontWeight="700">
                      {ligne.wip_critique}
                    </Typography>
                  </Grid>
                </Grid>

                {ligne.est_saturee && (
                  <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 3 }}>
                    <Typography variant="body1" fontWeight="600">
                      Ligne saturée - WIP critique atteint.
                    </Typography>
                  </Alert>
                )}

                {ligne.goulet && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                    <Typography variant="body1" fontWeight="600">
                      Goulet détecté : {ligne.goulet.nom}
                    </Typography>
                  </Alert>
                )}

                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                  Sequence de postes
                </Typography>
                <List>
                  {ligne.sequence?.map((seq, idx) => (
                    <ListItem key={idx} sx={{ py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 48, color: 'primary.main' }}>
                        <AccountTreeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="600">
                            {seq.ordre}. {seq.poste_detail?.nom}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Capacité : {seq.poste_detail?.capacite_horaire} unités/heure
                          </Typography>
                        }
                      />
                    </ListItem>
                  )) || (
                    <Typography color="text.secondary" sx={{ pl: 6 }}>
                      Aucune séquence définie
                    </Typography>
                  )}
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<TicketIcon />}
                  onClick={() => handleCreerTickets(ligne.id)}
                  sx={{ mt: 3, py: 2, fontSize: '1.05rem', fontWeight: 600 }}
                >
                  Créer les tickets manquants
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon fontSize="large" />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: '#ffffff' }}>
          Nouvelle Ligne de Production CONWIP
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de la ligne"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="WIP Critique"
                type="number"
                value={formData.wip_critique}
                onChange={(e) => setFormData({ ...formData, wip_critique: e.target.value })}
                required
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} size="large">
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" size="large">
            Créer la ligne
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LignesProduction;
