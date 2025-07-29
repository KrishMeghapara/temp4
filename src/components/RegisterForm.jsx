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
  LinearProgress
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Storefront as StorefrontIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const RegisterForm = ({ onRegister }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation states
  const [userNameError, setUserNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return '#ef4444';
    if (strength < 50) return '#f59e0b';
    if (strength < 75) return '#eab308';
    return '#10b981';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleUserNameChange = (e) => {
    const value = e.target.value;
    setUserName(value);
    if (value && value.length < 2) {
      setUserNameError('Username must be at least 2 characters');
    } else if (value && value.length > 50) {
      setUserNameError('Username must be less than 50 characters');
    } else {
      setUserNameError('');
    }
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
    
    // Check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (userName.length < 2) {
      setError('Username must be at least 2 characters');
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
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5236/api/User/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onRegister();
        }, 2000);
      } else {
        setError(typeof data === 'string' ? data : data?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <Box className="auth-page-container">
        <Box className="auth-background-pattern" />
        <Box className="auth-content-wrapper">
          <Fade in={true} timeout={800}>
            <Paper className="auth-form-container success-container" elevation={0}>
              <Box className="success-content">
                <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 3 }} />
                <Typography variant="h4" className="success-title">
                  Account Created!
                </Typography>
                <Typography variant="body1" className="success-message">
                  Your account has been successfully created. Redirecting to login...
                </Typography>
                <CircularProgress sx={{ mt: 3, color: '#10b981' }} />
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Box>
    );
  }

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
                Create Account
              </Typography>
              
              <Typography variant="body1" className="auth-subtitle">
                Join QuickMart and start shopping for fresh groceries
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
                label="Full Name"
                value={userName}
                onChange={handleUserNameChange}
                error={!!userNameError}
                helperText={userNameError}
                disabled={loading}
                className="auth-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

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
                sx={{ mb: 2 }}
              />

              {password && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Password Strength:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getPasswordStrengthColor(passwordStrength),
                        fontWeight: 600
                      }}
                    >
                      {getPasswordStrengthText(passwordStrength)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                disabled={loading || !!userNameError || !!emailError || !!passwordError || !!confirmPasswordError}
                className="auth-submit-btn"
                startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                sx={{ mb: 3 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Box className="auth-footer-text">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Button 
                    variant="text" 
                    className="auth-link-btn"
                    onClick={() => window.location.href = '/login'}
                    disabled={loading}
                  >
                    Sign In
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

export default RegisterForm;