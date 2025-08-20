import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Storefront as StorefrontIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

/* ---------- Theme Constants ---------- */
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#3498db',
  lightText: '#d1d4ff',
  subtleText: '#a1a4ff',
  error: '#ef4444',
};

/* ---------- Styled Components ---------- */
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '16px',
  backgroundColor: alpha(COLORS.primary, 0.3),
  backdropFilter: 'blur(10px)',
  border: `1px solid rgba(161, 164, 255, 0.5)`,
  marginLeft: 0,
  width: '100%',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    backgroundColor: alpha(COLORS.primary, 0.4),
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  '&:focus-within': {
    backgroundColor: alpha(COLORS.primary, 0.5),
    transform: 'translateY(-1px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: 'auto',
    maxWidth: 550,
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: COLORS.accent,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: COLORS.lightText,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    fontSize: '1rem',
    fontWeight: 500,
    '&::placeholder': {
      color: alpha(COLORS.subtleText, 0.7),
      fontWeight: 400,
    },
    [theme.breakpoints.up('sm')]: {
      width: '35ch',
      '&:focus': { width: '45ch' },
    },
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: COLORS.accent,
  borderRadius: '12px',
  padding: theme.spacing(1),
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    backgroundColor: alpha(COLORS.primary, 0.15),
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  '&:active': { transform: 'translateY(0) scale(0.95)' },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: COLORS.error,
    color: COLORS.lightText,
    fontWeight: 700,
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    border: `2px solid rgba(161, 164, 255, 0.3)`,
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
    animation: 'pulse 3s infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(COLORS.primary, 0.1),
    transform: 'scale(1.02)',
  },
}));

/* ---------- Header Component ---------- */
export default function Header({ onCartClick }) {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const goToProfile = () => {
    closeMenu();
    navigate('/profile');
  };
  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(161, 164, 255, 0.2)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, sm: 4, md: 6 } }}>
        {/* Logo */}
        <LogoContainer onClick={() => navigate('/')}>
          <StorefrontIcon sx={{ fontSize: 36, color: COLORS.accent }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              background: `linear-gradient(45deg, ${COLORS.subtleText}, #c3b1e1)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
            }}
          >
            QuickMart
          </Typography>
          <Chip
            label="Express"
            size="small"
            sx={{
              bgcolor: alpha(COLORS.primary, 0.2),
              color: COLORS.lightText,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '20px',
            }}
          />
        </LogoContainer>

        {/* Search */}
        <Search sx={{ flexGrow: 1, mx: { xs: 2, sm: 4 } }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search for groceries, fruits, veg..." />
        </Search>

        {/* Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StyledIconButton><NotificationsIcon /></StyledIconButton>
          <StyledIconButton><FavoriteIcon /></StyledIconButton>
          <StyledIconButton onClick={handleMenu}>
            <Avatar
              src={user?.googlePicture}
              sx={{
                width: 32, height: 32,
                bgcolor: alpha(COLORS.primary, 0.2),
                border: `2px solid rgba(161, 164, 255, 0.3)`,
                fontSize: '1rem', fontWeight: 600, color: COLORS.lightText,
              }}
            >
              {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </StyledIconButton>
          <StyledIconButton onClick={onCartClick}>
            <StyledBadge badgeContent={itemCount} max={99}>
              <ShoppingCartIcon sx={{ fontSize: 28 }} />
            </StyledBadge>
          </StyledIconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
            '& .MuiMenuItem-root': {
              borderRadius: 2,
              margin: '4px 8px',
              '&:hover': { backgroundColor: alpha(COLORS.lightText, 0.1) },
            },
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(161, 164, 255, 0.2)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={user?.googlePicture} sx={{ bgcolor: COLORS.primary }}>
              {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.lightText }}>
                {user?.userName || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.subtleText }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        <MenuItem onClick={goToProfile}>
          <ListItemIcon><AccountCircleIcon sx={{ color: COLORS.accent }} /></ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon sx={{ color: COLORS.error }} /></ListItemIcon>
          <ListItemText primary="Sign Out" sx={{ color: COLORS.error }} />
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
