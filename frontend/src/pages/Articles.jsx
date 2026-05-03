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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Inventory2 as InventoryIcon,
  Warning as WarningIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { articlesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import { useSearch } from '../context/SearchContext';
import { matchesSearch } from '../utils/search';

function Articles() {
  const { searchQuery } = useSearch();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    designation: '',
    adu: '',
    lead_time: '',
    stock_physique: '0',
    stock_securite: '0',
    prix_unitaire: '0',
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getAll();
      setArticles(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement des articles' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        sku: article.sku,
        designation: article.designation,
        adu: article.adu,
        lead_time: article.lead_time,
        stock_physique: article.stock_physique,
        stock_securite: article.stock_securite,
        prix_unitaire: article.prix_unitaire,
      });
    } else {
      setEditingArticle(null);
      setFormData({
        sku: '',
        designation: '',
        adu: '',
        lead_time: '',
        stock_physique: '0',
        stock_securite: '0',
        prix_unitaire: '0',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingArticle(null);
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
      if (editingArticle) {
        await articlesAPI.update(editingArticle.id, formData);
        setAlert({ severity: 'success', message: 'Article mis à jour avec succès' });
      } else {
        await articlesAPI.create(formData);
        setAlert({ severity: 'success', message: 'Article créé avec succès' });
      }
      handleCloseDialog();
      loadArticles();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setAlert({
        severity: 'error',
        message: error.response?.data?.sku?.[0] || 'Erreur lors de la sauvegarde',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet article ?')) return;

    try {
      await articlesAPI.delete(id);
      setAlert({ severity: 'success', message: 'Article supprimé avec succès' });
      loadArticles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setAlert({ severity: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const getStockStatus = (article) => {
    const stock = parseFloat(article.stock_physique);
    const securite = parseFloat(article.stock_securite);

    if (stock < securite) {
      return { label: 'Stock bas', color: 'error' };
    }
    if (stock < securite * 1.5) {
      return { label: 'Attention', color: 'warning' };
    }
    return { label: 'Stock OK', color: 'success' };
  };

  const stats = {
    total: articles.length,
    stockBas: articles.filter(a => parseFloat(a.stock_physique) < parseFloat(a.stock_securite)).length,
    valeurStock: articles
      .reduce((sum, a) => sum + (parseFloat(a.stock_physique) * parseFloat(a.prix_unitaire)), 0)
      .toFixed(2),
  };

  const filteredArticles = articles.filter((article) =>
    matchesSearch(article, searchQuery, [
      'sku',
      'designation',
      'stock_physique',
      'stock_securite',
      (item) => getStockStatus(item).label,
    ]),
  );

  return (
    <Box className="page-shell">
      <PageHeader
        title="Articles"
        subtitle="Catalogue, niveaux de stock et valorisation des composants."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadArticles}
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
          label="Total articles"
          value={stats.total}
          icon={<InventoryIcon />}
        />
        <KpiCard
          label="Stocks critiques"
          value={stats.stockBas}
          icon={<WarningIcon />}
          tone="danger"
        />
        <KpiCard
          label="Valeur stock"
          value={`${stats.valeurStock} EUR`}
          icon={<PaymentsIcon />}
          tone="success"
        />
      </Box>

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Désignation</TableCell>
                <TableCell align="right">ADU</TableCell>
                <TableCell align="right">Lead Time (j)</TableCell>
                <TableCell align="right">Stock physique</TableCell>
                <TableCell align="right">Stock sécurité</TableCell>
                <TableCell align="right">Prix (EUR)</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.map((article) => {
                const status = getStockStatus(article);
                return (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="600">
                        {article.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {article.designation}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="600">
                        {article.adu}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{article.lead_time}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="600">
                        {article.stock_physique}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{article.stock_securite}</TableCell>
                    <TableCell align="right">{article.prix_unitaire} EUR</TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="medium" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Modifier">
                        <IconButton
                          size="large"
                          color="primary"
                          onClick={() => handleOpenDialog(article)}
                          sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="large"
                          color="error"
                          onClick={() => handleDelete(article.id)}
                          sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          {editingArticle ? 'Modifier l\'Article' : 'Nouvel Article'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                disabled={!!editingArticle}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Désignation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ADU"
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
                name="lead_time"
                type="number"
                value={formData.lead_time}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock physique"
                name="stock_physique"
                type="number"
                value={formData.stock_physique}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock de sécurité"
                name="stock_securite"
                type="number"
                value={formData.stock_securite}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prix unitaire (EUR)"
                name="prix_unitaire"
                type="number"
                inputProps={{ step: 0.01 }}
                value={formData.prix_unitaire}
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
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="large"
          >
            {editingArticle ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Articles;
