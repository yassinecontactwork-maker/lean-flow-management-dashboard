import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Assignment as AssignmentIcon,
  QrCodeScanner as QrCodeScannerIcon,
  ViewKanban as ViewKanbanIcon,
  AccountTree as AccountTreeIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Factory as FactoryIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { authAPI } from '../services/api';

const drawerWidth = 294;

function Layout({ children, mode = 'light', onToggleMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openKanban, setOpenKanban] = useState(true);
  const [openConwip, setOpenConwip] = useState(true);
  const [openDDMRP, setOpenDDMRP] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const isDark = mode === 'dark';

  const savedUser = localStorage.getItem('authUser');
  const user = savedUser
    ? JSON.parse(savedUser)
    : { nom: 'Utilisateur', prenom: '', role: 'OPERATEUR' };

  const roleLabels = {
    ADMIN: 'Administrateur',
    RESP_PROD: 'Responsable Production',
    SUPPLY_CHAIN_MANAGER: 'Supply Chain Manager',
    OPERATEUR: 'Opérateur',
  };
  const roleKey = user.role || 'OPERATEUR';
  const roleLabel = roleLabels[roleKey] || roleKey.replace('_', ' ');
  const displayName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleToggle = (key) => {
    if (key === 'kanban') setOpenKanban(!openKanban);
    if (key === 'conwip') setOpenConwip(!openConwip);
    if (key === 'ddmrp') setOpenDDMRP(!openDDMRP);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
                                   
    } finally {
      localStorage.removeItem('authUser');
      navigate('/login');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['ADMIN', 'RESP_PROD', 'SUPPLY_CHAIN_MANAGER'] },
    { divider: true },

    { header: 'CORE', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER', 'RESP_PROD'] },
    { text: 'Articles', icon: <InventoryIcon />, path: '/articles', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Postes de Travail', icon: <PrecisionManufacturingIcon />, path: '/postes-travail', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Ordres de Fabrication', icon: <AssignmentIcon />, path: '/ordres-fabrication', roles: ['ADMIN'] },

    { divider: true },
    { header: 'KANBAN', expandable: true, key: 'kanban', roles: ['ADMIN', 'RESP_PROD', 'OPERATEUR'] },
    { text: 'Configuration Flux', icon: <ViewKanbanIcon />, path: '/kanban/flux', parent: 'kanban', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Cartes Kanban', icon: <ViewKanbanIcon />, path: '/kanban/cartes', parent: 'kanban', roles: ['ADMIN', 'RESP_PROD', 'OPERATEUR'] },
    { text: 'Scanner QR', icon: <QrCodeScannerIcon />, path: '/kanban/scanner', parent: 'kanban', roles: ['ADMIN', 'RESP_PROD', 'OPERATEUR'] },

    { divider: true },
    { header: 'CONWIP', expandable: true, key: 'conwip', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Lignes de Production', icon: <AccountTreeIcon />, path: '/conwip/lignes', parent: 'conwip', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Tickets CONWIP', icon: <ShowChartIcon />, path: '/conwip/tickets', parent: 'conwip', roles: ['ADMIN', 'RESP_PROD'] },

    { divider: true },
    { header: 'DDMRP', expandable: true, key: 'ddmrp', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Buffers DDMRP', icon: <TrendingUpIcon />, path: '/ddmrp/buffers', parent: 'ddmrp', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Recommandations', icon: <LightbulbIcon />, path: '/ddmrp/recommandations', parent: 'ddmrp', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },

    { divider: true },
    { header: 'ALERTES & CONFLITS', roles: ['ADMIN', 'RESP_PROD', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Alertes', icon: <WarningIcon />, path: '/alertes', roles: ['ADMIN', 'RESP_PROD', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Conflits', icon: <ReportIcon />, path: '/conflits', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
  ];

  const currentTitle = menuItems.find((item) => item.path === location.pathname)?.text || 'Lean Manufacturing';
  const drawerBackground =
    'linear-gradient(180deg, #0F172A 0%, #111827 100%), repeating-linear-gradient(0deg, rgba(203, 213, 225, 0.035) 0 1px, transparent 1px 32px)';
  const drawerPaperSx = {
    width: drawerWidth,
    backgroundColor: '#0F172A',
    backgroundImage: drawerBackground,
    borderRight: '1px solid rgba(203, 213, 225, 0.16)',
    color: '#E5E7EB',
  };

  const drawer = (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: '#E5E7EB',
        backgroundImage: drawerBackground,
      }}
    >
      <Toolbar sx={{ px: 3, py: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(37, 99, 235, 0.16)',
              border: '1px solid rgba(96, 165, 250, 0.32)',
            }}
          >
            <FactoryIcon sx={{ color: '#60A5FA' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#F8FAFC">
              Lean Manufacturing
            </Typography>
            <Typography variant="caption" color="rgba(226, 232, 240, 0.72)">
              Industrial Control Suite
            </Typography>
          </Box>
        </Stack>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(203, 213, 225, 0.16)' }} />

      <List sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto' }}>
        {menuItems.map((item, index) => {
          if (item.divider) return <Divider key={index} sx={{ my: 2, borderColor: 'rgba(203, 213, 225, 0.14)' }} />;

          if (item.header) {
            const visible = !item.roles || item.roles.includes(user.role);
            if (!visible) return null;

            if (item.expandable) {
              const isOpen =
                (item.key === 'kanban' && openKanban) ||
                (item.key === 'conwip' && openConwip) ||
                (item.key === 'ddmrp' && openDDMRP);

              return (
                <ListItem key={item.key} disablePadding>
                  <ListItemButton onClick={() => handleToggle(item.key)} sx={{ borderRadius: 2 }}>
                    <ListItemText
                      primary={item.header}
                      primaryTypographyProps={{
                        variant: 'caption',
                        fontWeight: 'bold',
                        color: 'rgba(226, 232, 240, 0.66)',
                        letterSpacing: 0,
                      }}
                    />
                    {isOpen ? <ExpandLess sx={{ color: 'rgba(226, 232, 240, 0.66)' }} /> : <ExpandMore sx={{ color: 'rgba(226, 232, 240, 0.66)' }} />}
                  </ListItemButton>
                </ListItem>
              );
            }

            return (
              <ListItem key={index} disablePadding sx={{ my: 1 }}>
                <ListItemText
                  primary={item.header}
                  primaryTypographyProps={{
                    variant: 'caption',
                    fontWeight: 'bold',
                    color: 'rgba(226, 232, 240, 0.66)',
                    letterSpacing: 0,
                  }}
                />
              </ListItem>
            );
          }

          const hasAccess = !item.roles || item.roles.includes(user.role);
          if (!hasAccess) return null;

          const isActive = location.pathname === item.path;
          const visible =
            !item.parent ||
            (item.parent === 'kanban' && openKanban) ||
            (item.parent === 'conwip' && openConwip) ||
            (item.parent === 'ddmrp' && openDDMRP);

          if (!visible) return null;

          return (
            <Collapse in={visible} timeout="auto" unmountOnExit key={item.text}>
              <ListItem disablePadding sx={{ my: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    if (mobileOpen) setMobileOpen(false);
                  }}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 3,
                    pl: item.parent ? 5 : 3,
                    py: 1.15,
                    color: isActive ? '#FFFFFF' : 'rgba(226, 232, 240, 0.86)',
                    '&.Mui-selected': {
                      bgcolor: '#1E3A8A',
                      color: '#FFFFFF',
                      '& .MuiListItemIcon-root': { color: '#FFFFFF' },
                      boxShadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.18)',
                    },
                    '&:hover': { bgcolor: isActive ? '#1E3A8A' : 'rgba(37, 99, 235, 0.16)', color: '#FFFFFF' },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      width: 3,
                      height: '60%',
                      transform: 'translateY(-50%)',
                      borderRadius: 999,
                      background: isActive ? '#60A5FA' : 'transparent',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    },
                    '& > *': {
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 42, color: isActive ? '#FFFFFF' : 'rgba(203, 213, 225, 0.7)' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            </Collapse>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(203, 213, 225, 0.16)' }} />
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: '#2563EB' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography fontWeight={600} noWrap color="#F8FAFC">
              {displayName}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                bgcolor: 'rgba(37, 99, 235, 0.14)',
                color: '#BFDBFE',
                border: '1px solid rgba(96, 165, 250, 0.28)',
              }}
            />
          </Box>
        </Stack>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 3, py: 1.4, '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.14)' } }}
          >
            <ListItemIcon sx={{ minWidth: 42, color: '#F87171' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" primaryTypographyProps={{ color: '#FCA5A5', fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.94)',
          color: isDark ? '#E5E7EB' : '#111827',
          boxShadow: isDark ? '0 14px 30px rgba(0, 0, 0, 0.24)' : '0 8px 20px rgba(15, 23, 42, 0.06)',
          borderBottom: isDark ? '1px solid rgba(203, 213, 225, 0.16)' : '1px solid #CBD5E1',
          backdropFilter: 'blur(12px)',
          backgroundImage: 'none',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" noWrap fontWeight={600} sx={{ letterSpacing: 0 }}>
                {currentTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supervision temps réel et décisions terrain
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label="Système OK"
              color="success"
              size="small"
              variant={isDark ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
            <Tooltip title={isDark ? 'Mode clair' : 'Mode sombre'}>
              <IconButton
                color="inherit"
                onClick={() => {
                  if (onToggleMode) onToggleMode();
                }}
              >
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': drawerPaperSx }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': drawerPaperSx }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="page-entrance"
        sx={{ flexGrow: 1, p: { xs: 3, md: 4 }, pt: { xs: 10, md: 12 } }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
