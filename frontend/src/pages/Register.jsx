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
  Divider,
  Chip,
  Grid,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Badge as BadgeIcon,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const roles = [
  { value: 'ADMIN', label: 'Administrateur', color: 'error' },
  { value: 'RESP_PROD', label: 'Responsable Production', color: 'warning' },
  { value: 'SUPPLY_CHAIN_MANAGER', label: 'Supply Chain Manager', color: 'info' },
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
    role: '',
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
    if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 caracteres';
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
      await authAPI.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Compte créé avec succès. Connectez-vous.' } });
      }, 1200);
    } catch (error) {
      setServerError(error.response?.data?.error || 'Erreur lors de la creation du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
        alignItems: 'center',
        gap: { xs: 4, md: 0 },
        px: { xs: 3, md: 8 },
        py: { xs: 6, md: 8 },
      }}
    >
      <Card className="panel page-entrance" sx={{ maxWidth: 620 }}>
        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Créer un compte
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configurez votre profil pour acceder au pilotage industriel
          </Typography>

          <Divider sx={{ mb: 3 }} />

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
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prenom"
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email || 'Ex: prenom.nom@entreprise.com'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Role dans l'entreprise"
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
                      <Chip label={role.label} color={role.color} size="small" sx={{ minWidth: 180 }} />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 2,
                    fontSize: '1.05rem',
                    fontWeight: 700,
                  }}
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Déjà un compte ?{' '}
                <Button color="primary" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
                  Se connecter
                </Button>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box className="page-entrance" sx={{ pl: { md: 6 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: 'rgba(15, 118, 110, 0.1)',
              border: '1px solid rgba(15, 118, 110, 0.26)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EngineeringIcon sx={{ fontSize: 38, color: '#0F766E' }} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={700} sx={{ fontFamily: 'var(--font-display)' }}>
              Profil Industriel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accès par rôle aux flux Kanban, CONWIP et DDMRP
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Un contrôle de production adapté à chaque fonction
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Définissez votre rôle et exploitez les outils d'amélioration continue pour piloter les
          stocks, les flux et les alertes de l'atelier.
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="Segmentation par rôle" color="primary" variant="outlined" />
          <Chip label="Processus tracés" color="secondary" variant="outlined" />
          <Chip label="Actions rapides" color="secondary" variant="outlined" />
        </Stack>
      </Box>
    </Box>
  );
}

export default Register;
