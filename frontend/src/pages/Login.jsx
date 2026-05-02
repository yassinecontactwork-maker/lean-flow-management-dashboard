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
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Factory as FactoryIcon,
  VerifiedUser as VerifiedUserIcon,
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
        alignItems: 'center',
        gap: { xs: 4, md: 0 },
        px: { xs: 3, md: 8 },
        py: { xs: 6, md: 8 },
      }}
    >
      <Box className="page-entrance" sx={{ pr: { md: 6 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.26)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FactoryIcon sx={{ fontSize: 38, color: '#2563EB' }} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={700} sx={{ fontFamily: 'var(--font-display)' }}>
              Lean Manufacturing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Suite de supervision industrielle pour Kanban, CONWIP et DDMRP
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Accès sécurisé aux flux de production
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Pilotez les buffers, orchestrez les lignes et sécurisez les décisions atelier avec une
          interface d'ingénierie moderne.
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip icon={<VerifiedUserIcon />} label="Session sécurisée" color="primary" variant="outlined" />
          <Chip label="KPIs temps réel" color="secondary" variant="outlined" />
          <Chip label="Pilotage industriel" color="secondary" variant="outlined" />
        </Stack>
      </Box>

      <Card className="panel page-entrance" sx={{ maxWidth: 520, ml: { md: 'auto' } }}>
        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Connexion
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connectez-vous pour accéder au tableau de bord
          </Typography>

          <Divider sx={{ mb: 3 }} />

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

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
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
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !email || !password}
              sx={{
                mt: 4,
                py: 2,
                fontSize: '1.05rem',
                fontWeight: 700,
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Pas de compte ?{' '}
              <Button component={RouterLink} to="/register" color="primary" sx={{ fontWeight: 600 }}>
                S'inscrire
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
