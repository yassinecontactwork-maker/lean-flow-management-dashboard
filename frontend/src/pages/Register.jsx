import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const roles = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'RESP_PROD', label: 'Responsable production' },
  { value: 'SUPPLY_CHAIN_MANAGER', label: 'Responsable supply chain' },
  { value: 'OPERATEUR', label: 'Opérateur' },
];

const splitFullName = (value) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { prenom: '', nom: parts[0] || '' };
  }

  return {
    prenom: parts.slice(0, -1).join(' '),
    nom: parts[parts.length - 1],
  };
};

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'OPERATEUR',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nom complet requis';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.role) newErrors.role = 'Rôle requis';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const { prenom, nom } = splitFullName(formData.fullName);
      await authAPI.register({
        nom,
        prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Compte créé avec succès. Connectez-vous.' } });
      }, 1200);
    } catch (error) {
      setServerError(error.response?.data?.error || 'Erreur lors de la création du compte');
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
              Créer un compte
            </Typography>
            <Typography className="auth-subtitle">
              Créez votre accès à la plateforme.
            </Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Compte créé avec succès. Redirection vers la connexion...
            </Alert>
          )}

          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" className="auth-form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom complet"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              autoComplete="name"
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              autoComplete="email"
              required
            />

            <TextField
              select
              fullWidth
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={!!errors.role}
              helperText={errors.role}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              autoComplete="new-password"
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

            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Button
              className="auth-submit-button"
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le compte'}
            </Button>
          </Box>

          <Box className="auth-secondary-action">
            <Typography variant="body2">Déjà inscrit ?</Typography>
            <Button color="primary" onClick={() => navigate('/login')} size="small" sx={{ fontWeight: 700 }}>
              Se connecter
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Register;
