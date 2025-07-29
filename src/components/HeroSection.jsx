import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const HeroContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(10, 0),
  position: 'relative',
  overflow: 'hidden',
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    `,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(to top, rgba(248, 250, 252, 0.1), transparent)',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  height: '100%',
  borderRadius: '20px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    background: 'rgba(255, 255, 255, 0.2)',
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  color: '#667eea',
  fontWeight: 700,
  padding: theme.spacing(1.5, 4),
  borderRadius: '50px',
  fontSize: '1.2rem',
  textTransform: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    background: '#fff',
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
    '&::before': {
      left: '100%',
    }
  },
  '&:active': {
    transform: 'translateY(-1px) scale(1.02)',
  }
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  '&:nth-of-type(2n)': {
    animationDelay: '1s',
  },
  '&:nth-of-type(3n)': {
    animationDelay: '2s',
  }
}));

export default function HeroSection() {
  const features = [
    {
      icon: <LocalShippingIcon sx={{ fontSize: 48 }} />,
      title: 'Free Delivery',
      description: 'On orders above ₹500',
      color: '#10b981'
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 48 }} />,
      title: '12 Min Delivery',
      description: 'Lightning fast service',
      color: '#f59e0b'
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48 }} />,
      title: 'Quality Assured',
      description: '100% fresh products',
      color: '#3b82f6'
    },
    {
      icon: <LocalOfferIcon sx={{ fontSize: 48 }} />,
      title: 'Best Prices',
      description: 'Unbeatable deals daily',
      color: '#ef4444'
    }
  ];

  return (
    <HeroContainer>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              animation: `${slideInLeft} 1s ease-out`,
              textAlign: { xs: 'center', md: 'left' }
            }}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 900,
                  mb: 3,
                  background: 'linear-gradient(45deg, #fff, #e2e8f0)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  lineHeight: 1.1,
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-2px'
                }}
              >
                Fresh Groceries
                <br />
                <Box component="span" sx={{ 
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Delivered Fast
                </Box>
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 400,
                  maxWidth: '500px',
                  mx: { xs: 'auto', md: 0 }
                }}
              >
                Get your daily essentials delivered to your doorstep in just 12 minutes. 
                Fresh, quality products at unbeatable prices with zero delivery charges.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <AnimatedButton 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  Shop Now
                </AnimatedButton>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '50px',
                    px: 3,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ animation: `${slideInRight} 1s ease-out 0.3s both` }}>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={6} key={index}>
                    <FeatureCard sx={{ 
                      animationDelay: `${index * 0.2}s`,
                      animation: `${slideInRight} 0.8s ease-out both`
                    }}>
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <FloatingIcon sx={{ mb: 2, color: feature.color }}>
                          {feature.icon}
                        </FloatingIcon>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </HeroContainer>
  );
}