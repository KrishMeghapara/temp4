import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Badge, 
  Box, 
  InputBase,
  Container,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '16px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  '&:focus-within': {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  marginLeft: 0,
  width: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: 'auto',
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
  color: alpha(theme.palette.common.white, 0.8),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    fontSize: '1rem',
    fontWeight: 500,
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.7),
      fontWeight: 400,
    },
    [theme.breakpoints.up('sm')]: {
      width: '25ch',
      '&:focus': {
        width: '35ch',
      },
    },
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'inherit',
  borderRadius: '12px',
  padding: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.15),
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0) scale(0.95)',
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#ef4444',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
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
    backgroundColor: alpha('#fff', 0.1),
    transform: 'scale(1.02)',
  }
}));

export default function Header({ onCartClick }) {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100vw',
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: 1.5, 
        px: { xs: 2, sm: 4, md: 6 },
        minHeight: '70px !important'
      }}>
        <LogoContainer onClick={handleLogoClick}>
          <StorefrontIcon sx={{ 
            fontSize: 36, 
            color: '#fff',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} />
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 900,
              background: 'linear-gradient(45deg, #fff, #e2e8f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            QuickMart
          </Typography>
          <Chip 
            label="Express" 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }} 
          />
        </LogoContainer>

        <Search sx={{ flexGrow: 1, maxWidth: 500, mx: { xs: 2, sm: 4 } }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search for groceries, fruits, vegetables..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StyledIconButton>
            <NotificationsIcon />
          </StyledIconButton>
          
          <StyledIconButton>
            <FavoriteIcon />
          </StyledIconButton>
          
          <StyledIconButton onClick={handleProfileMenuOpen}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                fontSize: '1rem',
                fontWeight: 600
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
      
      {/* Enhanced Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '& .MuiMenuItem-root': {
              borderRadius: 2,
              margin: '4px 8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                transform: 'translateX(4px)',
              }
            }
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: 40, 
              height: 40,
              fontSize: '1.1rem',
              fontWeight: 600
            }}>
              {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                {user?.userName || 'User'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.85rem' }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" sx={{ color: '#667eea' }} />
          </ListItemIcon>
          <ListItemText 
            primary="My Profile" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>
        
        <Divider sx={{ mx: 1, my: 0.5 }} />
        
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#ef4444' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Sign Out" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>
      </Menu>
    </AppBar>
  );
}