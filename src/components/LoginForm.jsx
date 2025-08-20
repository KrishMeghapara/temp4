import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  Divider,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import apiService from '../services/apiService';
import GoogleLoginButton from './GoogleLoginButton';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Storefront as StorefrontIcon,
  ShoppingCart,
  LocalShipping,
  Redeem,
  Security,
  CheckCircle,
  Star
} from '@mui/icons-material';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.login({ Email: email, Password: password });
      
      if (data.Token || data.token) {
        onLogin(data.Token || data.token, {
          UserID: data.UserID,
          UserName: data.UserName,
          Email: data.Email,
          AddressID: data.AddressID
        });
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Grid container spacing={4} alignItems="center">
        {/* Left Side - Brand & Features */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
              {/* Brand Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 56, 
                    height: 56, 
                    mr: 2,
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                  }}>
                    <StorefrontIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    QuickCommerce
                  </Typography>
                </Box>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                  Welcome back!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue shopping
                </Typography>
              </Box>

              {/* Features */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Why choose QuickCommerce?
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: <ShoppingCart />, text: 'Fast & secure checkout', color: '#3b82f6' },
                    { icon: <LocalShipping />, text: 'Free delivery on orders over $50', color: '#10b981' },
                    { icon: <Security />, text: '100% secure payment processing', color: '#f59e0b' },
                    { icon: <Redeem />, text: 'Exclusive member rewards', color: '#8b5cf6' }
                  ].map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: feature.color, 
                        width: 40, 
                        height: 40,
                        boxShadow: `0 2px 8px ${feature.color}40`
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Testimonials */}
              <Box sx={{ 
                bgcolor: 'rgba(102, 126, 234, 0.05)', 
                borderRadius: 3, 
                p: 3, 
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} sx={{ color: '#fbbf24', fontSize: 20 }} />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                  "Amazing shopping experience! Fast delivery and great customer service."
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  - Sarah M., Verified Customer
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={1000}>
            <Card sx={{ 
              maxWidth: 480, 
              mx: 'auto',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Sign In
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access your account to start shopping
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    error={!!emailError}
                    helperText={emailError}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mb: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: 'linear-gradient(45deg, #cbd5e0 0%, #a0aec0 100%)',
                        transform: 'none'
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Box>

                {/* Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                    or
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Google Login Button */}
                <GoogleLoginButton 
                  onLogin={onLogin} 
                  disabled={loading}
                />

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Button 
                      variant="text" 
                      onClick={() => window.location.href = '/register'}
                      sx={{ 
                        color: 'primary.main', 
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      Create one now
                    </Button>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginForm;