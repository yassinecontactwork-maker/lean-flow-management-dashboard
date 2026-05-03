import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { authAPI } from './services/api';
import Layout from './components/Layout';
import { SearchProvider } from './context/SearchContext';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Articles = lazy(() => import('./pages/Articles'));
const PostesTravail = lazy(() => import('./pages/PostesTravail'));
const OrdresFabrication = lazy(() => import('./pages/OrdresFabrication'));
const ConfigFluxKanban = lazy(() => import('./pages/ConfigFluxKanban'));
const CartesKanban = lazy(() => import('./pages/CartesKanban'));
const ScannerKanban = lazy(() => import('./pages/ScannerKanban'));
const LignesProduction = lazy(() => import('./pages/LignesProduction'));
const TicketsConwip = lazy(() => import('./pages/TicketsConwip'));
const BuffersDDMRP = lazy(() => import('./pages/BuffersDDMRP'));
const Recommandations = lazy(() => import('./pages/Recommandations'));
const Alertes = lazy(() => import('./pages/Alertes'));
const Conflits = lazy(() => import('./pages/Conflits'));

const buildTheme = (mode) => {
  const isDark = mode === 'dark';
  const borderColor = isDark ? 'rgba(148, 163, 184, 0.28)' : '#CBD5E1';
  const surface = isDark ? '#0F172A' : '#FFFFFF';
  const background = isDark ? '#020617' : '#F8FAFC';
  const textPrimary = isDark ? '#E5E7EB' : '#111827';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const chipStyles = {
    primary: { bg: 'rgba(37, 99, 235, 0.1)', fg: '#1D4ED8', border: 'rgba(37, 99, 235, 0.28)' },
    secondary: { bg: 'rgba(15, 118, 110, 0.1)', fg: '#0F766E', border: 'rgba(15, 118, 110, 0.28)' },
    info: { bg: 'rgba(2, 132, 199, 0.1)', fg: '#0284C7', border: 'rgba(2, 132, 199, 0.28)' },
    success: { bg: 'rgba(22, 163, 74, 0.1)', fg: '#15803D', border: 'rgba(22, 163, 74, 0.28)' },
    warning: { bg: 'rgba(217, 119, 6, 0.12)', fg: '#B45309', border: 'rgba(217, 119, 6, 0.3)' },
    error: { bg: 'rgba(220, 38, 38, 0.1)', fg: '#B91C1C', border: 'rgba(220, 38, 38, 0.28)' },
    default: { bg: isDark ? 'rgba(148, 163, 184, 0.12)' : '#F1F5F9', fg: textSecondary, border: borderColor },
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563EB',
        light: '#3B82F6',
        dark: '#1E3A8A',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#0F766E',
        light: '#0D9488',
        dark: '#115E59',
        contrastText: '#FFFFFF',
      },
      background: {
        default: background,
        paper: surface,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: borderColor,
      info: { main: '#0284C7', contrastText: '#FFFFFF' },
      success: { main: '#16A34A', contrastText: '#FFFFFF' },
      warning: { main: '#D97706', contrastText: '#FFFFFF' },
      error: { main: '#DC2626', contrastText: '#FFFFFF' },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: 'var(--font-body)',
      htmlFontSize: 16,
      h1: { fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1.2, fontWeight: 800, letterSpacing: 0 },
      h2: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', lineHeight: 1.25, fontWeight: 700, letterSpacing: 0 },
      h3: { fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1.2, fontWeight: 800, letterSpacing: 0 },
      h4: { fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1.2, fontWeight: 800, letterSpacing: 0 },
      h5: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', lineHeight: 1.25, fontWeight: 700, letterSpacing: 0 },
      h6: { fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.35, fontWeight: 700, letterSpacing: 0 },
      subtitle1: { fontSize: '1rem', fontWeight: 650, letterSpacing: 0 },
      subtitle2: { fontSize: '0.94rem', fontWeight: 650, letterSpacing: 0 },
      body1: { fontSize: '0.98rem', lineHeight: 1.65, letterSpacing: 0 },
      body2: { fontSize: '0.92rem', lineHeight: 1.55, letterSpacing: 0 },
      caption: { fontSize: '0.82rem', lineHeight: 1.45, letterSpacing: 0 },
      overline: { fontSize: '0.82rem', fontWeight: 700, letterSpacing: 0 },
      button: { fontSize: '0.94rem', textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: background,
          },
          '#root': {
            minHeight: '100vh',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${borderColor}`,
            backgroundImage: 'none',
            backgroundColor: surface,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${borderColor}`,
            backgroundImage: 'none',
            backgroundColor: surface,
            boxShadow: isDark ? '0 18px 42px rgba(0, 0, 0, 0.32)' : '0 12px 30px rgba(15, 23, 42, 0.07)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            minHeight: 44,
            padding: '10px 18px',
            fontWeight: 700,
            letterSpacing: 0,
            boxShadow: 'none',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            boxShadow: '0 10px 22px rgba(37, 99, 235, 0.22)',
            '&:hover': {
              background: '#1D4ED8',
              color: '#FFFFFF',
              boxShadow: '0 12px 26px rgba(37, 99, 235, 0.26)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
            color: '#FFFFFF',
            boxShadow: '0 10px 22px rgba(15, 118, 110, 0.2)',
            '&:hover': {
              background: '#0F766E',
              color: '#FFFFFF',
              boxShadow: '0 12px 26px rgba(15, 118, 110, 0.24)',
            },
          },
          outlinedPrimary: {
            borderColor: 'rgba(37, 99, 235, 0.38)',
            color: '#2563EB',
            '&:hover': {
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.06)',
            },
          },
          outlinedSecondary: {
            borderColor: 'rgba(15, 118, 110, 0.38)',
            color: '#0F766E',
            '&:hover': {
              borderColor: '#0F766E',
              backgroundColor: 'rgba(15, 118, 110, 0.06)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ ownerState }) => {
            const tone = chipStyles[ownerState.color] || chipStyles.default;
            return {
              minHeight: 30,
              paddingInline: 2,
              borderRadius: 999,
              border: `1px solid ${tone.border}`,
              backgroundColor: tone.bg,
              color: tone.fg,
              fontWeight: 700,
              letterSpacing: 0,
              fontSize: '0.8rem',
              '& .MuiChip-label': {
                paddingInline: 10,
              },
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            };
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: ({ theme, ownerState }) => ({
            borderRadius: 14,
            border: '1px solid',
            borderColor:
              (ownerState.severity && theme.palette[ownerState.severity]?.main) ||
              theme.palette.primary.main,
            boxShadow: 'none',
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: '#0F172A',
            border: '1px solid rgba(203, 213, 225, 0.22)',
            fontSize: '0.75rem',
            borderRadius: 10,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 6,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#111827' : '#F1F5F9',
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px 18px',
            fontSize: '0.96rem',
            color: textPrimary,
          },
          head: {
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0,
            fontSize: '0.84rem',
            color: textSecondary,
            borderBottom: `1px solid ${borderColor}`,
          },
          body: {
            borderBottom: isDark ? '1px solid rgba(148, 163, 184, 0.16)' : '1px solid #E2E8F0',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.045)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            minHeight: 48,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.72)' : '#FFFFFF',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.18)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.16)',
            },
          },
          notchedOutline: {
            borderColor,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: '0.98rem',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.92rem',
            fontWeight: 600,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: '0.86rem',
            marginTop: 6,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: 0,
            borderBottom: `1px solid ${borderColor}`,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: 24,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            height: 6,
            backgroundColor: isDark ? 'rgba(148, 163, 184, 0.18)' : '#E2E8F0',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
          },
          indicator: {
            backgroundColor: '#2563EB',
            height: 3,
            borderRadius: 999,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: 0,
            minHeight: 44,
            color: textSecondary,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: '0 14px 30px rgba(37, 99, 235, 0.24)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'background-color 0.2s ease, color 0.2s ease',
          },
        },
      },
    },
  });
};

const LoadingScreen = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  gap: theme.spacing(3),
}));

const DEFAULT_ROUTE_BY_ROLE = {
  ADMIN: '/',
  RESP_PROD: '/',
  SUPPLY_CHAIN_MANAGER: '/',
  OPERATEUR: '/kanban/scanner',
};

const getStoredRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    return user.role || 'OPERATEUR';
  } catch (error) {
    return 'OPERATEUR';
  }
};

const RoleRoute = ({ allowedRoles = [], children }) => {
  const role = getStoredRole();
  const hasAccess = role === 'ADMIN' || allowedRoles.includes(role);

  if (hasAccess) {
    return children;
  }

  const fallback = DEFAULT_ROUTE_BY_ROLE[role] || '/';
  return <Navigate to={fallback} replace />;
};

const RoleRedirect = () => {
  const role = getStoredRole();
  const fallback = DEFAULT_ROUTE_BY_ROLE[role] || '/';
  return <Navigate to={fallback} replace />;
};

const PrivateRoute = ({ children }) => {
  const [status, setStatus] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const response = await authAPI.checkAuth();
        if (!isMounted) return;
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        setStatus({ loading: false, authenticated: true });
      } catch (error) {
        if (!isMounted) return;
        localStorage.removeItem('authUser');
        setStatus({ loading: false, authenticated: false });
      }
    };
    check();
    return () => {
      isMounted = false;
    };
  }, []);

  if (status.loading) {
    return (
      <LoadingScreen>
        <CircularProgress size={70} thickness={4} color="primary" />
        <Typography variant="h6" color="text.secondary">
          Chargement de l'application...
        </Typography>
      </LoadingScreen>
    );
  }

  return status.authenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('uiMode') || 'light');
  const theme = useMemo(() => buildTheme(mode), [mode]);

  useEffect(() => {
    document.body.dataset.theme = mode;
    localStorage.setItem('uiMode', mode);
  }, [mode]);

  useEffect(() => {
    authAPI.csrf().catch(() => {});
  }, []);

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense
          fallback={
            <LoadingScreen>
              <LinearProgress color="primary" sx={{ width: '30%' }} />
              <Typography variant="h6" color="text.secondary" mt={3}>
                Chargement des modules...
              </Typography>
            </LoadingScreen>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <SearchProvider>
                    <Layout mode={mode} onToggleMode={handleToggleMode}>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD', 'SUPPLY_CHAIN_MANAGER']}>
                              <Dashboard />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/articles"
                          element={
                            <RoleRoute allowedRoles={['SUPPLY_CHAIN_MANAGER']}>
                              <Articles />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/postes-travail"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD']}>
                              <PostesTravail />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/ordres-fabrication"
                          element={
                            <RoleRoute>
                              <OrdresFabrication />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/kanban/flux"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD']}>
                              <ConfigFluxKanban />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/kanban/cartes"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD', 'OPERATEUR']}>
                              <CartesKanban />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/kanban/scanner"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD', 'OPERATEUR']}>
                              <ScannerKanban />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/conwip/lignes"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD']}>
                              <LignesProduction />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/conwip/tickets"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD']}>
                              <TicketsConwip />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/ddmrp/buffers"
                          element={
                            <RoleRoute allowedRoles={['SUPPLY_CHAIN_MANAGER']}>
                              <BuffersDDMRP />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/ddmrp/recommandations"
                          element={
                            <RoleRoute allowedRoles={['SUPPLY_CHAIN_MANAGER']}>
                              <Recommandations />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/alertes"
                          element={
                            <RoleRoute allowedRoles={['RESP_PROD', 'SUPPLY_CHAIN_MANAGER']}>
                              <Alertes />
                            </RoleRoute>
                          }
                        />
                        <Route
                          path="/conflits"
                          element={
                            <RoleRoute allowedRoles={['SUPPLY_CHAIN_MANAGER']}>
                              <Conflits />
                            </RoleRoute>
                          }
                        />
                        <Route path="*" element={<RoleRedirect />} />
                      </Routes>
                    </Layout>
                  </SearchProvider>
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
