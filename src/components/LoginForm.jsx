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
  Divider
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Storefront as StorefrontIcon
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
      const response = await fetch('http://localhost:5236/api/User/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password })
      });
      
      const data = await response.json();
      
      if (response.ok && (data.Token || data.token)) {
        onLogin(data.Token || data.token, {
          UserID: data.UserID,
          UserName: data.UserName,
          Email: data.Email,
          AddressID: data.AddressID
        });
      } else {
        setError(typeof data === 'string' ? data : data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page-container">
      <Box className="auth-background-pattern" />
      
      <Box className="auth-content-wrapper">
        <Fade in={true} timeout={800}>
          <Paper className="auth-form-container" elevation={0}>
            {/* Header */}
            <Box className="auth-header">
              <Box className="auth-logo">
                <StorefrontIcon sx={{ fontSize: 48, color: '#667eea' }} />
                <Typography variant="h4" className="auth-brand-name">
                  QuickMart
                </Typography>
              </Box>
              
              <Typography variant="h3" className="auth-title">
                Welcome Back
              </Typography>
              
              <Typography variant="body1" className="auth-subtitle">
                Sign in to your account to continue shopping
              </Typography>
            </Box>

            <Divider sx={{ my: 3, opacity: 0.3 }} />

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} className="auth-form">
              {error && (
                <Fade in={true}>
                  <Alert 
                    severity="error" 
                    className="auth-alert"
                    sx={{ mb: 3 }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                disabled={loading}
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !!emailError || !!passwordError}
                className="auth-submit-btn"
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{ mb: 3 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box className="auth-footer-text">
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Button 
                    variant="text" 
                    className="auth-link-btn"
                    onClick={() => window.location.href = '/register'}
                    disabled={loading}
                  >
                    Create Account
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default LoginForm;