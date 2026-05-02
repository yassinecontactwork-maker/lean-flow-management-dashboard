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

const drawerWidth = 272;

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
    RESP_PROD: 'Responsable production',
    SUPPLY_CHAIN_MANAGER: 'Responsable supply chain',
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
    { header: 'PILOTAGE', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER', 'RESP_PROD'] },
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/', roles: ['ADMIN', 'RESP_PROD', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Articles', icon: <InventoryIcon />, path: '/articles', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Postes de travail', icon: <PrecisionManufacturingIcon />, path: '/postes-travail', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Ordres de fabrication', icon: <AssignmentIcon />, path: '/ordres-fabrication', roles: ['ADMIN'] },

    { divider: true },
    { header: 'KANBAN', expandable: true, key: 'kanban', roles: ['ADMIN', 'RESP_PROD', 'OPERATEUR'] },
    { text: 'Configuration flux', icon: <ViewKanbanIcon />, path: '/kanban/flux', parent: 'kanban', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Cartes Kanban', icon: <ViewKanbanIcon />, path: '/kanban/cartes', parent: 'kanban', roles: ['ADMIN', 'RESP_PROD', 'OPERATEUR'] },
    { text: 'Scanner QR', icon: <QrCodeScannerIcon />, path: '/kanban/scanner', parent: 'kanban', roles: ['ADMIN', 'RESP_PROD', 'OPERATEUR'] },

    { divider: true },
    { header: 'CONWIP', expandable: true, key: 'conwip', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Lignes de production', icon: <AccountTreeIcon />, path: '/conwip/lignes', parent: 'conwip', roles: ['ADMIN', 'RESP_PROD'] },
    { text: 'Tickets CONWIP', icon: <ShowChartIcon />, path: '/conwip/tickets', parent: 'conwip', roles: ['ADMIN', 'RESP_PROD'] },

    { divider: true },
    { header: 'DDMRP', expandable: true, key: 'ddmrp', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Buffers DDMRP', icon: <TrendingUpIcon />, path: '/ddmrp/buffers', parent: 'ddmrp', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Recommandations', icon: <LightbulbIcon />, path: '/ddmrp/recommandations', parent: 'ddmrp', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },

    { divider: true },
    { header: 'RISQUES & ARBITRAGES', roles: ['ADMIN', 'RESP_PROD', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Alertes', icon: <WarningIcon />, path: '/alertes', roles: ['ADMIN', 'RESP_PROD', 'SUPPLY_CHAIN_MANAGER'] },
    { text: 'Conflits', icon: <ReportIcon />, path: '/conflits', roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'] },
  ];

  const currentTitle = menuItems.find((item) => item.path === location.pathname)?.text || 'Lean Manufacturing';
  const sidebarBg = isDark ? '#0F172A' : '#FFFFFF';
  const sidebarText = isDark ? '#E5E7EB' : '#111827';
  const sidebarMuted = isDark ? '#94A3B8' : '#64748B';
  const sidebarSubtle = isDark ? '#1E293B' : '#F8FAFC';
  const sidebarBorder = isDark ? 'rgba(148, 163, 184, 0.18)' : '#E2E8F0';
  const sidebarActiveBg = isDark ? '#1E3A8A' : '#EAF2FF';
  const sidebarActiveText = isDark ? '#FFFFFF' : '#2563EB';
  const sidebarHoverBg = isDark ? '#1E293B' : '#F1F5F9';
  const sidebarInactiveText = isDark ? '#CBD5E1' : '#475569';
  const drawerBackground = isDark
    ? 'linear-gradient(180deg, #0F172A 0%, #111827 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)';
  const drawerPaperSx = {
    width: drawerWidth,
    backgroundColor: sidebarBg,
    backgroundImage: drawerBackground,
    borderRight: `1px solid ${sidebarBorder}`,
    color: sidebarText,
    boxShadow: isDark ? '12px 0 36px rgba(0, 0, 0, 0.26)' : '12px 0 36px rgba(37, 99, 235, 0.06)',
  };

  const drawer = (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: sidebarText,
        backgroundImage: drawerBackground,
      }}
    >
      <Toolbar sx={{ px: 2.5, py: 2.5, minHeight: 84 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark ? 'rgba(37, 99, 235, 0.32)' : 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.18)',
            }}
          >
            <FactoryIcon sx={{ color: '#2563EB' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color={sidebarText} sx={{ fontSize: 17, lineHeight: 1.2 }}>
              Lean Manufacturing
            </Typography>
            <Typography variant="caption" color={sidebarMuted} sx={{ fontSize: 12.5 }}>
              Industrial Control Suite
            </Typography>
          </Box>
        </Stack>
      </Toolbar>

      <Divider sx={{ borderColor: sidebarBorder }} />

      <List
        sx={{
          flexGrow: 1,
          px: 1.5,
          py: 2,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(148, 163, 184, 0.32)', borderRadius: 999 },
        }}
      >
        {menuItems.map((item, index) => {
          if (item.divider) return <Divider key={index} sx={{ my: 2, borderColor: sidebarBorder }} />;

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
                  <ListItemButton onClick={() => handleToggle(item.key)} sx={{ borderRadius: 2, py: 0.9 }}>
                    <ListItemText
                      primary={item.header}
                      primaryTypographyProps={{
                        variant: 'caption',
                        fontWeight: 800,
                        fontSize: 12.5,
                        color: sidebarMuted,
                        letterSpacing: 0,
                      }}
                    />
                    {isOpen ? <ExpandLess sx={{ color: sidebarMuted }} /> : <ExpandMore sx={{ color: sidebarMuted }} />}
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
                    fontWeight: 800,
                    fontSize: 12.5,
                    color: sidebarMuted,
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
                    borderRadius: 2.5,
                    pl: item.parent ? 4.5 : 2.5,
                    py: 1.15,
                    color: isActive ? sidebarActiveText : sidebarInactiveText,
                    '&.Mui-selected': {
                      bgcolor: sidebarActiveBg,
                      color: sidebarActiveText,
                      '& .MuiListItemIcon-root': { color: sidebarActiveText },
                      boxShadow: isDark ? '0 10px 24px rgba(30, 58, 138, 0.26)' : 'none',
                    },
                    '&:hover': { bgcolor: isActive ? sidebarActiveBg : sidebarHoverBg, color: isActive ? sidebarActiveText : '#2563EB' },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      width: 3,
                      height: '60%',
                      transform: 'translateY(-50%)',
                      borderRadius: 999,
                      background: isActive ? '#2563EB' : 'transparent',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    },
                    '& > *': {
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 42, color: isActive ? sidebarActiveText : sidebarMuted }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 600, fontSize: 15.5 }}
                  />
                </ListItemButton>
              </ListItem>
            </Collapse>
          );
        })}
      </List>

      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ mb: 2, borderColor: sidebarBorder }} />
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            mb: 1.5,
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: sidebarSubtle,
            border: `1px solid ${sidebarBorder}`,
          }}
        >
          <Avatar sx={{ bgcolor: '#2563EB' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography fontWeight={700} noWrap color={sidebarText} sx={{ maxWidth: 158 }}>
              {displayName}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563EB',
                border: '1px solid rgba(37, 99, 235, 0.18)',
              }}
            />
          </Box>
        </Stack>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2.5, py: 1.2, color: sidebarMuted, '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' } }}
          >
            <ListItemIcon sx={{ minWidth: 42, color: '#DC2626' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontWeight: 700 }} />
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
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.78)',
          color: isDark ? '#E5E7EB' : '#111827',
          boxShadow: isDark ? '0 14px 30px rgba(0, 0, 0, 0.24)' : '0 8px 20px rgba(15, 23, 42, 0.06)',
          borderBottom: isDark ? '1px solid rgba(203, 213, 225, 0.16)' : '1px solid rgba(226, 232, 240, 0.72)',
          backdropFilter: 'blur(12px)',
          backgroundImage: 'none',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, minHeight: 64 }}>
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
              <Typography variant="h6" noWrap fontWeight={700} sx={{ letterSpacing: 0, fontSize: 19 }}>
                {currentTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
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
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563EB', fontWeight: 800 }}>
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} noWrap sx={{ fontSize: 14.5, lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Typography color="text.secondary" noWrap sx={{ fontSize: 12.5, lineHeight: 1.2 }}>
                  {roleLabel}
                </Typography>
              </Box>
            </Stack>
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
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 10, md: 11 } }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
