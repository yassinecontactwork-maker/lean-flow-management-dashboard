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
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { buffersDDMRPAPI, articlesAPI, postesTravailAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import { useSearch } from '../context/SearchContext';
import { matchesSearch } from '../utils/search';

function BuffersDDMRP() {
  const { searchQuery } = useSearch();
  const [buffers, setBuffers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBuffer, setEditingBuffer] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    article: '',
    poste: '',
    adu: '',
    lead_time_jours: '',
    facteur_lead_time: '0.5',
    facteur_variabilite: '0.5',
    stock_minimum_commande: '0',
    stock_disponible: '0',
    actif: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [buffersRes, articlesRes, postesRes] = await Promise.all([
        buffersDDMRPAPI.getAll(),
        articlesAPI.getAll(),
        postesTravailAPI.getAll(),
      ]);
      setBuffers(buffersRes.data);
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

  const handleOpenDialog = (buffer = null) => {
    if (buffer) {
      setEditingBuffer(buffer);
      setFormData({
        article: buffer.article,
        poste: buffer.poste,
        adu: buffer.adu,
        lead_time_jours: buffer.lead_time_jours,
        facteur_lead_time: buffer.facteur_lead_time,
        facteur_variabilite: buffer.facteur_variabilite,
        stock_minimum_commande: buffer.stock_minimum_commande,
        stock_disponible: buffer.stock_disponible,
        actif: buffer.actif,
      });
    } else {
      setEditingBuffer(null);
      setFormData({
        article: '',
        poste: '',
        adu: '',
        lead_time_jours: '',
        facteur_lead_time: '0.5',
        facteur_variabilite: '0.5',
        stock_minimum_commande: '0',
        stock_disponible: '0',
        actif: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBuffer(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingBuffer) {
        await buffersDDMRPAPI.update(editingBuffer.id, formData);
        setAlert({ severity: 'success', message: 'Buffer mis à jour avec succès' });
      } else {
        await buffersDDMRPAPI.create(formData);
        setAlert({ severity: 'success', message: 'Buffer créé avec succès' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce buffer ?')) return;

    try {
      await buffersDDMRPAPI.delete(id);
      setAlert({ severity: 'success', message: 'Buffer supprimé avec succès' });
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const handleRecalculerZones = async (id) => {
    try {
      await buffersDDMRPAPI.recalculerZones(id);
      setAlert({ severity: 'success', message: 'Zones recalculées avec succès' });
      loadData();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Erreur lors du recalcul' });
    }
  };

  const handleRecalculerTous = async () => {
    try {
      const response = await buffersDDMRPAPI.recalculerTous();
      setAlert({ severity: 'success', message: response.data.message || 'Tous les buffers recalculés' });
      loadData();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Erreur lors du recalcul global' });
    }
  };

  const getNiveauColor = (niveau) => {
    switch (niveau) {
      case 'ROUGE':
        return 'error';
      case 'JAUNE':
        return 'warning';
      case 'VERT':
        return 'success';
      default:
        return 'default';
    }
  };

  const getProgressColor = (pourcentage) => {
    if (pourcentage < 30) return 'error';
    if (pourcentage < 60) return 'warning';
    return 'success';
  };

  const filteredBuffers = buffers.filter((buffer) =>
    matchesSearch(buffer, searchQuery, [
      'niveau_actuel',
      'stock_disponible',
      'zone_rouge',
      'zone_jaune',
      'zone_verte',
      (item) => item.article_detail?.sku,
      (item) => item.article_detail?.designation,
      (item) => item.poste_detail?.nom,
      (item) => (item.actif ? 'Actif Oui' : 'Inactif Non'),
    ]),
  );

  return (
    <Box className="page-shell">
      <PageHeader
        title="Buffers DDMRP"
        subtitle="Gestion des zones, seuils et remplissage des buffers critiques."
        actions={
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<CalculateIcon />} onClick={handleRecalculerTous}>
              Recalculer Tous
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
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

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Article</TableCell>
                <TableCell>Poste</TableCell>
                <TableCell align="right">Stock Disponible</TableCell>
                <TableCell align="right">Zone Rouge</TableCell>
                <TableCell align="right">Zone Jaune</TableCell>
                <TableCell align="right">Zone Verte</TableCell>
                <TableCell>Niveau Actuel</TableCell>
                <TableCell align="right">% Remplissage</TableCell>
                <TableCell>Actif</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBuffers.map((buffer) => (
                <TableRow key={buffer.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {buffer.article_detail?.sku}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {buffer.article_detail?.designation}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="600">
                      {buffer.poste_detail?.nom || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="700">
                      {buffer.stock_disponible}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={buffer.zone_rouge} color="error" size="medium" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={buffer.zone_jaune} color="warning" size="medium" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={buffer.zone_verte} color="success" size="medium" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={buffer.niveau_actuel}
                      color={getNiveauColor(buffer.niveau_actuel)}
                      size="medium"
                      sx={{ fontWeight: 600, minWidth: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 120 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(buffer.pourcentage_remplissage, 100)}
                          color={getProgressColor(buffer.pourcentage_remplissage)}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body1" fontWeight="600">
                        {buffer.pourcentage_remplissage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={buffer.actif ? 'Oui' : 'Non'}
                      color={buffer.actif ? 'success' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Recalculer les zones">
                      <IconButton
                        size="large"
                        color="primary"
                        onClick={() => handleRecalculerZones(buffer.id)}
                        sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                      >
                        <CalculateIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="large"
                        color="primary"
                        onClick={() => handleOpenDialog(buffer)}
                        sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => handleDelete(buffer.id)}
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
          {editingBuffer ? 'Modifier le Buffer DDMRP' : 'Nouveau Buffer DDMRP'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ADU (Average Daily Usage)"
                name="adu"
                type="number"
                value={formData.adu}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facteur Lead Time"
                name="facteur_lead_time"
                type="number"
                inputProps={{ step: 0.1, min: 0 }}
                value={formData.facteur_lead_time}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facteur variabilité"
                name="facteur_variabilite"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                value={formData.facteur_variabilite}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MOQ (Minimum Order Quantity)"
                name="stock_minimum_commande"
                type="number"
                value={formData.stock_minimum_commande}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock Disponible"
                name="stock_disponible"
                type="number"
                value={formData.stock_disponible}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} size="large">
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" size="large">
            {editingBuffer ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BuffersDDMRP;
