import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <Box className="auth-shell">
      <Card className="auth-card page-entrance">
        <CardContent>
          <Box className="auth-header">
            <Typography className="auth-app-name">Lean Manufacturing</Typography>
            <Typography component="h1" className="auth-heading">
              Connexion
            </Typography>
            <Typography className="auth-subtitle">
              Accédez à votre espace.
            </Typography>
          </Box>

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

          <Box component="form" className="auth-form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((current) => !current)}
                      edge="end"
                      aria-label="Afficher le mot de passe"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box className="auth-options-row">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                  />
                }
                label="Se souvenir de moi"
              />
              <Button type="button" variant="text" size="small" className="auth-inline-link">
                Mot de passe oublié ?
              </Button>
            </Box>

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
          </Box>

          <Box className="auth-secondary-action">
            <Typography variant="body2">Vous n’avez pas de compte ?</Typography>
            <Button component={RouterLink} to="/register" color="primary" size="small" sx={{ fontWeight: 700 }}>
              S’inscrire
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
