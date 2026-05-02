import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Factory as FactoryIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    authAPI
      .checkAuth()
      .then(() => {
        if (mounted) navigate('/');
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const successMessage = location.state?.message;
  const kpiPreview = [
    { label: 'OF actifs', value: '24', tone: 'blue' },
    { label: 'Kanban à traiter', value: '128', tone: 'amber' },
    { label: 'Buffers verts', value: '91%', tone: 'green' },
  ];
  const valuePoints = [
    'Pilotage des flux de production',
    'Suivi des encours et alertes',
    'Décisions alignées avec le terrain',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion impossible. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-shell">
      <Box className="auth-brand page-entrance">
        <Box className="auth-brand-inner">
          <Box className="auth-brand-mark">
            <Box className="auth-logo">
              <FactoryIcon sx={{ fontSize: 38 }} />
            </Box>
            <Box>
              <Typography className="auth-eyebrow">Poste de pilotage Lean</Typography>
              <Typography className="auth-system-state">Flux tirés, encours et buffers</Typography>
            </Box>
          </Box>

          <Typography component="h1" className="auth-title">
            Lean Manufacturing
          </Typography>
          <Typography className="auth-kicker">
            Industrial Control Suite
          </Typography>
          <Typography className="auth-copy">
            Supervision des flux Kanban, CONWIP et DDMRP en temps réel.
          </Typography>

          <Box className="auth-badges">
            <Chip label="Kanban" color="primary" variant="outlined" />
            <Chip label="CONWIP" color="secondary" variant="outlined" />
            <Chip label="DDMRP" color="info" variant="outlined" />
          </Box>

          <Box className="auth-preview-card">
            <Box className="auth-preview-header">
              <Box>
                <Typography className="auth-preview-title">Synthèse atelier</Typography>
                <Typography className="auth-preview-subtitle">Ordres, Kanban et buffers DDMRP</Typography>
              </Box>
              <Box className="auth-preview-icon">
                <AnalyticsIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>

            <Box className="auth-preview-grid">
              {kpiPreview.map((item) => (
                <Box key={item.label} className={`auth-mini-kpi auth-mini-kpi--${item.tone}`}>
                  <Typography className="auth-mini-kpi-label">{item.label}</Typography>
                  <Typography className="auth-mini-kpi-value">{item.value}</Typography>
                </Box>
              ))}
            </Box>

            <Box className="auth-flow-line" aria-hidden="true">
              <span />
              <span />
              <span />
            </Box>
          </Box>

          <Stack className="auth-value-list" spacing={1.25}>
            {valuePoints.map((point) => (
              <Box key={point} className="auth-value-item">
                <CheckCircleIcon sx={{ fontSize: 18 }} />
                <Typography>{point}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box className="auth-form-zone">
        <Card className="auth-card page-entrance">
          <CardContent>
            <Typography className="auth-form-eyebrow">Accès sécurisé</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Accédez à votre tableau de bord industriel.
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} aria-label="Afficher le mot de passe">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                className="auth-submit-button"
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !email || !password}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Stack>

            <Box className="auth-secondary-action">
              <Typography variant="body2">Pas de compte ?</Typography>
              <Button component={RouterLink} to="/register" color="primary" size="small" sx={{ fontWeight: 700 }}>
                Créer un compte
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;
