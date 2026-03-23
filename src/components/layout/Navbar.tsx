import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Box,
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navLinks = [
    { label: 'Events', path: '/', adminOnly: false },
    { label: 'My Tickets', path: '/dashboard', adminOnly: false },
    { label: 'Events Management', path: '/admin/events', adminOnly: true },
    { label: 'Users Management', path: '/admin/users', adminOnly: true },
  ].filter((link) => !link.adminOnly || user?.role === 'admin');

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 0, mr: 4, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
        >
           GoEvent
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              color="inherit"
              onClick={() => navigate(path)}
              sx={{
                borderBottom: pathname === path ? '2px solid white' : '2px solid transparent',
                borderRadius: 0,
                pb: '2px',
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              logout();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
