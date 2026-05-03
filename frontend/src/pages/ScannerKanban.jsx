import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Grid,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { cartesKanbanAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import { useSearch } from '../context/SearchContext';
import { matchesSearch } from '../utils/search';

function ScannerKanban() {
  const { searchQuery } = useSearch();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [alert, setAlert] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const handleScan = async (codeUnique) => {
    if (!codeUnique) return;

    try {
      setAlert({ severity: 'info', message: `Traitement du code : ${codeUnique}...` });

      const response = await cartesKanbanAPI.scanner(codeUnique);

      setResult(response.data);
      setAlert({
        severity: 'success',
        message: response.data.message || 'Carte scannée avec succès',
      });

      setScanHistory(prev => [{
        date: new Date(),
        code: codeUnique,
        statut: response.data.nouveau_statut,
        message: response.data.message,
      }, ...prev.slice(0, 9)]);

      setScanning(false);
      setManualCode('');
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setAlert({
        severity: 'error',
        message: error.response?.data?.error || 'Erreur lors du traitement du code',
      });
    }
  };

  const handleQRScan = (resultData) => {
    if (resultData && resultData[0]) {
      const code = resultData[0].rawValue;
      handleScan(code);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const handleStartScanning = () => {
    if (!window.isSecureContext) {
      setAlert({
        severity: 'error',
        message: 'La caméra est bloquée. Utilisez https ou http://localhost pour activer la webcam.',
      });
      return;
    }
    setScanning(true);
  };

  const filteredScanHistory = scanHistory.filter((scan) =>
    matchesSearch(scan, searchQuery, ['code', 'statut', 'message']),
  );

  return (
    <Box className="page-shell">
      <PageHeader
        title="Scanner QR Kanban"
        subtitle="Scan webcam ou saisie manuelle pour basculer le statut des cartes."
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

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card className="panel" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 4 }}>
                <QrCodeScannerIcon sx={{ fontSize: 32, verticalAlign: 'middle', mr: 1 }} />
                Scanner avec webcam
              </Typography>

              {!scanning ? (
                <Box sx={{ py: 8 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartScanning}
                    startIcon={<QrCodeScannerIcon fontSize="large" />}
                    sx={{
                      py: 2.5,
                      px: 6,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Démarrer le scanner
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Paper className="panel scanner-frame" sx={{ p: 2, mb: 3, overflow: 'hidden' }}>
                    <Scanner
                      onScan={handleQRScan}
                      onError={(error) => {
                        console.error('Erreur scanner:', error);
                        setAlert({
                          severity: 'error',
                          message: 'Erreur d\'accès à la webcam',
                        });
                      }}
                      constraints={{ facingMode: 'environment' }}
                      components={{ audio: false, finder: false }}
                      styles={{
                        container: { width: '100%' },
                        video: { width: '100%', borderRadius: '16px' },
                      }}
                    />
                  </Paper>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="large"
                    onClick={() => setScanning(false)}
                  >
                    Arrêter le scanner
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card className="panel" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 4 }}>
                Saisie manuelle
              </Typography>
              <form onSubmit={handleManualSubmit}>
                <TextField
                  fullWidth
                  label="Code Unique de la Carte"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: K-SKU-001-0001"
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  disabled={!manualCode.trim()}
                  sx={{ py: 2.3, fontSize: '1.1rem', fontWeight: 600 }}
                >
                  Scanner le code
                </Button>
              </form>

              {result && (
                <Box sx={{ mt: 5 }}>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Résultat du scan
                  </Typography>
                  <Paper className="panel" sx={{ p: 4 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Code :</strong> {result.carte.code_unique}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Article :</strong> {result.carte.flux_detail.article_detail.sku} - {result.carte.flux_detail.article_detail.designation}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1">
                          <strong>Ancien statut :</strong>
                        </Typography>
                        <Chip label={result.ancien_statut} size="medium" sx={{ ml: 1 }} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1">
                          <strong>Nouveau statut :</strong>
                        </Typography>
                        <Chip
                          label={result.nouveau_statut}
                          color={result.nouveau_statut === 'VIDE' ? 'error' : 'success'}
                          size="medium"
                          sx={{ ml: 1 }}
                        />
                      </Grid>
                      {result.ordre_cree && (
                        <Grid item xs={12}>
                          <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
                            <Typography variant="body1" fontWeight="600">
                              Ordre de fabrication créé : {result.ordre_cree.numero}
                            </Typography>
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="panel">
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Historique des scans (10 derniers)
              </Typography>
              {scanHistory.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucun scan effectué pour le moment
                </Typography>
              ) : (
                <List>
                  {filteredScanHistory.map((scan, index) => (
                    <ListItem
                      key={index}
                      divider={index < scanHistory.length - 1}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <QrCodeScannerIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" fontWeight="600">
                              {scan.code}
                            </Typography>
                            <Chip
                              label={scan.statut}
                              color={scan.statut === 'VIDE' ? 'error' : 'success'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {scan.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {scan.date.toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ScannerKanban;
