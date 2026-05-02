import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Badge as BadgeIcon,
  Factory as FactoryIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const roles = [
  { value: 'ADMIN', label: 'Administrateur', color: 'error' },
  { value: 'RESP_PROD', label: 'Responsable production', color: 'warning' },
  { value: 'SUPPLY_CHAIN_MANAGER', label: 'Responsable supply chain', color: 'info' },
  { value: 'OPERATEUR', label: 'Opérateur', color: 'success' },
];

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const accessPreview = [
    { label: 'Profils atelier', value: '4', tone: 'blue' },
    { label: 'Méthodes Lean', value: '3', tone: 'green' },
    { label: 'Droits actifs', value: 'Par rôle', tone: 'amber' },
  ];
  const valuePoints = [
    'Droits adaptés à chaque fonction terrain',
    'Traçabilité des actions de production',
    'Pilotage Kanban, CONWIP et DDMRP',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.role) newErrors.role = 'Veuillez choisir un rôle';
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
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      await authAPI.register(payload);
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
      <Box className="auth-brand page-entrance">
        <Box className="auth-brand-inner">
          <Box className="auth-brand-mark">
            <Box className="auth-logo">
              <FactoryIcon sx={{ fontSize: 38 }} />
            </Box>
            <Box>
              <Typography className="auth-eyebrow">Habilitations atelier</Typography>
              <Typography className="auth-system-state">Rôles métier et supervision Lean</Typography>
            </Box>
          </Box>

          <Typography component="h1" className="auth-title">
            Lean Manufacturing
          </Typography>
          <Typography className="auth-kicker">
            Industrial Control Suite
          </Typography>
          <Typography className="auth-copy">
            Créez un accès sécurisé pour piloter les flux, les encours et les alertes de production.
          </Typography>

          <Box className="auth-badges">
            <Chip label="Kanban" color="primary" variant="outlined" />
            <Chip label="CONWIP" color="secondary" variant="outlined" />
            <Chip label="DDMRP" color="info" variant="outlined" />
          </Box>

          <Box className="auth-preview-card">
            <Box className="auth-preview-header">
              <Box>
                <Typography className="auth-preview-title">Accès métier</Typography>
                <Typography className="auth-preview-subtitle">Production, supply chain et opérations</Typography>
              </Box>
              <Box className="auth-preview-icon">
                <AnalyticsIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>

            <Box className="auth-preview-grid">
              {accessPreview.map((item) => (
                <Box key={item.label} className={`auth-mini-kpi auth-mini-kpi--${item.tone}`}>
                  <Typography className="auth-mini-kpi-label">{item.label}</Typography>
                  <Typography className="auth-mini-kpi-value">{item.value}</Typography>
                </Box>
              ))}
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
        <Card className="auth-card auth-card--wide page-entrance">
          <CardContent>
            <Typography className="auth-form-eyebrow">Création de profil</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Créer un compte
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Rejoignez la plateforme de supervision industrielle.
            </Typography>

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

            <Box component="form" onSubmit={handleSubmit}>
              <Box className="auth-form-grid">
                <TextField
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  error={!!errors.prenom}
                  helperText={errors.prenom}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  error={!!errors.nom}
                  helperText={errors.nom}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  className="auth-field-full"
                  fullWidth
                  label="Adresse email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email || 'Ex. prenom.nom@entreprise.com'}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password || 'Minimum 6 caractères'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="Afficher le mot de passe">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirmation"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword || 'Confirmez le mot de passe'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="Afficher le mot de passe">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  className="auth-field-full"
                  select
                  fullWidth
                  label="Rôle dans l'entreprise"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  error={!!errors.role}
                  helperText={errors.role || 'Choisissez votre fonction'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Chip label={role.label} color={role.color} size="small" sx={{ minWidth: 190 }} />
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Button
                className="auth-submit-button"
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer un compte'}
              </Button>

              <Box className="auth-secondary-action">
                <Typography variant="body2">Déjà un compte ?</Typography>
                <Button color="primary" onClick={() => navigate('/login')} size="small" sx={{ fontWeight: 700 }}>
                  Se connecter
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Register;
