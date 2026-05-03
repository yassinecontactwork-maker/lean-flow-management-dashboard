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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCode2 as QrCode2Icon,
  PlaylistAdd as PlaylistAddIcon,
  PlaylistRemove as PlaylistRemoveIcon,
} from '@mui/icons-material';
import { cartesKanbanAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import { useSearch } from '../context/SearchContext';
import { matchesSearch } from '../utils/search';

function CartesKanban() {
  const { searchQuery } = useSearch();
  const [cartes, setCartes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedCarte, setSelectedCarte] = useState(null);
  const [qrDialog, setQrDialog] = useState(false);

  useEffect(() => {
    loadCartes();
  }, []);

  const loadCartes = async () => {
    try {
      setLoading(true);
      const response = await cartesKanbanAPI.getAll();
      setCartes(response.data);
      setAlert(null);
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (carte) => {
    setSelectedCarte(carte);
    setQrDialog(true);
  };

  const handleChangerStatut = async (id, nouveauStatut) => {
    try {
      await cartesKanbanAPI.changerStatut(id, nouveauStatut);
      setAlert({ severity: 'success', message: 'Statut modifié' });
      loadCartes();
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ severity: 'error', message: 'Erreur' });
    }
  };

  const stats = {
    total: cartes.length,
    pleines: cartes.filter(c => c.statut === 'PLEIN').length,
    vides: cartes.filter(c => c.statut === 'VIDE').length,
  };

  const filteredCartes = cartes.filter((carte) =>
    matchesSearch(carte, searchQuery, [
      'code_unique',
      'statut',
      'quantite',
      (item) => item.flux_detail?.article_detail?.sku,
      (item) => item.flux_detail?.article_detail?.designation,
      (item) => item.flux_detail?.poste_fournisseur_detail?.nom,
      (item) => item.flux_detail?.poste_consommateur_detail?.nom,
    ]),
  );

  return (
    <Box className="page-shell">
      <PageHeader
        title="Cartes Kanban"
        subtitle="Suivi des cartes actives, statut des conteneurs et scans QR."
        actions={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadCartes}>
            Actualiser
          </Button>
        }
      />

      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {loading && <LinearProgress />}

      <Box className="kpi-grid">
        <KpiCard label="Total cartes" value={stats.total} icon={<QrCode2Icon />} />
        <KpiCard label="Cartes pleines" value={stats.pleines} icon={<PlaylistAddIcon />} tone="success" />
        <KpiCard label="Cartes vides" value={stats.vides} icon={<PlaylistRemoveIcon />} tone="danger" />
      </Box>

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code Unique</TableCell>
                <TableCell>Article</TableCell>
                <TableCell>Flux</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell>Dernier Scan</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCartes.map((carte) => (
                <TableRow key={carte.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {carte.code_unique}
                    </Typography>
                  </TableCell>
                  <TableCell>{carte.flux_detail?.article_detail?.sku}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {carte.flux_detail?.poste_fournisseur_detail?.nom} {" -> "} {carte.flux_detail?.poste_consommateur_detail?.nom}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={carte.statut}
                      color={carte.statut === 'PLEIN' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{carte.quantite}</TableCell>
                  <TableCell>
                    {carte.date_dernier_scan ? new Date(carte.date_dernier_scan).toLocaleString() : 'Jamais'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir QR Code">
                      <IconButton size="small" color="primary" onClick={() => handleShowQR(carte)}>
                        <QrCodeIcon />
                      </IconButton>
                    </Tooltip>
                    {carte.statut === 'VIDE' && (
                      <Tooltip title="Marquer PLEIN">
                        <IconButton size="small" color="success" onClick={() => handleChangerStatut(carte.id, 'PLEIN')}>
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {carte.statut === 'PLEIN' && (
                      <Tooltip title="Marquer VIDE">
                        <IconButton size="small" color="error" onClick={() => handleChangerStatut(carte.id, 'VIDE')}>
                          <CancelIcon />
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

      <Dialog open={qrDialog} onClose={() => setQrDialog(false)}>
        <DialogTitle>QR Code - {selectedCarte?.code_unique}</DialogTitle>
        <DialogContent>
          {selectedCarte?.qr_code_url && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img src={selectedCarte.qr_code_url} alt="QR Code" style={{ maxWidth: '100%' }} />
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Scannez ce code avec l'application mobile ou le scanner web
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CartesKanban;
