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
  Chip,
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
  CheckCircle as CheckCircleIcon,
  ShoppingCart,
  LocalShipping,
  Security,
  Redeem,
  Star
} from '@mui/icons-material';
import GoogleLoginButton from './GoogleLoginButton';

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
    } else {
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
      const data = await apiService.register({ 
        UserName: userName, 
        Email: email, 
        Password: password 
      });
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onRegister();
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

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
                  Join our community!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create your account and start shopping with exclusive benefits
                </Typography>
              </Box>

              {/* Features */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Member benefits you'll love:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: <CheckCircleIcon />, text: 'Exclusive member discounts', color: '#10b981' },
                    { icon: <LocalShipping />, text: 'Free delivery on all orders', color: '#3b82f6' },
                    { icon: <Redeem />, text: 'Early access to sales', color: '#f59e0b' },
                    { icon: <Security />, text: 'Secure shopping experience', color: '#8b5cf6' }
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

              {/* Stats */}
              <Box sx={{ 
                bgcolor: 'rgba(102, 126, 234, 0.05)', 
                borderRadius: 3, 
                p: 3, 
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Join thousands of happy customers
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      50K+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Happy Customers
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      1M+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Products Sold
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} sx={{ color: '#fbbf24', fontSize: 20 }} />
                  ))}
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                    4.9/5 Rating
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Grid>

        {/* Right Side - Register Form */}
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
                    Create Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Join QuickCommerce and start shopping today
                  </Typography>
                </Box>

                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    Account created successfully! Redirecting to login...
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={userName}
                    onChange={handleUserNameChange}
                    error={!!userNameError}
                    helperText={userNameError}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

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
                    sx={{ mb: 2 }}
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Password Strength
                        </Typography>
                        <Typography variant="caption" sx={{ color: getPasswordStrengthColor(passwordStrength) }}>
                          {getPasswordStrengthText(passwordStrength)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={passwordStrength} 
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getPasswordStrengthColor(passwordStrength)
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || success}
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
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
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
                  onLogin={onRegister} 
                  disabled={loading || success}
                />

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Button 
                      variant="text" 
                      onClick={() => window.location.href = '/login'}
                      sx={{ 
                        color: 'primary.main', 
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      Sign in here
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

export default RegisterForm;