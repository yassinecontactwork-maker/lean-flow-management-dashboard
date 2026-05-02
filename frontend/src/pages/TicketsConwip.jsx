import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayCircle as PlayCircleIcon,
  PauseCircle as PauseCircleIcon,
  Pending as PendingIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  PendingActions as PendingActionsIcon,
} from '@mui/icons-material';
import { ticketsConwipAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';

function TicketsConwip() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsConwipAPI.getAll();
      setTickets(response.data || []);
      setAlert(null);
    } catch (error) {
      console.error('Erreur chargement tickets CONWIP:', error);
      setAlert({
        severity: 'error',
        message: 'Impossible de charger les tickets CONWIP',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tickets.length,
    libres: tickets.filter(t => t.statut === 'LIBRE').length,
    enAttente: tickets.filter(t => t.statut === 'EN_ATTENTE').length,
    enCours: tickets.filter(t => t.statut === 'EN_COURS').length,
  };

  const getStatutConfig = (statut) => {
    switch (statut) {
      case 'LIBRE':
        return { color: 'success', icon: <PlayCircleIcon fontSize="small" />, label: 'Libre' };
      case 'EN_ATTENTE':
        return { color: 'warning', icon: <PendingIcon fontSize="small" />, label: 'En attente' };
      case 'EN_COURS':
        return { color: 'info', icon: <PauseCircleIcon fontSize="small" />, label: 'En cours' };
      default:
        return { color: 'default', icon: null, label: statut };
    }
  };

  return (
    <Box className="page-shell">
      <PageHeader
        title="Tickets CONWIP"
        subtitle="Vue d'ensemble des tickets libres, en attente et en cours."
        actions={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadTickets}>
            Actualiser
          </Button>
        }
      />

      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)} sx={{ borderRadius: 3 }}>
          {alert.message}
        </Alert>
      )}

      {loading && <LinearProgress />}

      <Box className="kpi-grid">
        <KpiCard label="Total" value={stats.total} icon={<ConfirmationNumberIcon />} />
        <KpiCard label="Libres" value={stats.libres} icon={<PlayCircleIcon />} tone="success" />
        <KpiCard label="En attente" value={stats.enAttente} icon={<PendingActionsIcon />} tone="warning" />
        <KpiCard label="En cours" value={stats.enCours} icon={<PauseCircleIcon />} tone="neutral" />
      </Box>

      <Paper className="table-panel">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° ticket</TableCell>
                <TableCell>Ligne</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>OF associé</TableCell>
                <TableCell>Poste Actuel</TableCell>
                <TableCell>Date Attribution</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="h6">Aucun ticket CONWIP pour le moment</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  const config = getStatutConfig(ticket.statut);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Typography fontWeight="600">
                          {ticket.numero}
                        </Typography>
                      </TableCell>
                      <TableCell>{ticket.ligne_detail?.nom || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={config.icon}
                          label={config.label}
                          color={config.color}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {ticket.ordre_fabrication_detail ? (
                          <Typography fontWeight="500">
                            {ticket.ordre_fabrication_detail.numero}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.poste_actuel_detail?.nom || <Typography color="text.secondary">-</Typography>}
                      </TableCell>
                      <TableCell>
                        {ticket.date_attribution ? (
                          <Typography variant="body2">
                            {new Date(ticket.date_attribution).toLocaleString('fr-FR')}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default TicketsConwip;
