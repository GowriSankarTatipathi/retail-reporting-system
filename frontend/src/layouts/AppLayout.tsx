import { useState } from 'react';
import { Link as RouterLink, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { NAV_ITEMS } from '@/constants/navigation';

const DRAWER_WIDTH = 240;

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

  if (!user) return null;

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user.role)
  );

  const handleLogout = () => {
    setUserMenuAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
          Retail Reporting
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              '&.active': {
                bgcolor: 'action.selected',
                fontWeight: 600,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <item.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleMode} aria-label="Toggle color mode">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Account">
            <IconButton
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              aria-label="Open account menu"
              aria-controls={userMenuAnchor ? 'account-menu' : undefined}
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                {initialsOf(user.fullName)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="account-menu"
            anchorEl={userMenuAnchor}
            open={!!userMenuAnchor}
            onClose={() => setUserMenuAnchor(null)}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                {user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email} &middot; {user.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={RouterLink} to="/profile" onClick={() => setUserMenuAnchor(null)}>
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/change-password"
              onClick={() => setUserMenuAnchor(null)}
            >
              <ListItemIcon>
                <LockOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Change password
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
