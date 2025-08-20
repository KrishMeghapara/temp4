import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import apiService from '../services/apiService';

const GoogleLoginButton = ({ onLogin, disabled = false }) => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('Google response:', response);
        
        // Get the access token from Google
        const accessToken = response.access_token;
        
        if (!accessToken) {
          console.error('No access token received from Google');
          return;
        }
        
        // Call our backend with the Google access token
        const data = await apiService.googleLogin(accessToken);
        
        if (data.Token || data.token) {
          onLogin(data.Token || data.token, {
            UserID: data.UserID,
            UserName: data.UserName,
            Email: data.Email,
            AddressID: data.AddressID,
            GooglePicture: data.GooglePicture,
            IsGoogleUser: data.IsGoogleUser
          });
        }
      } catch (error) {
        console.error('Google login failed:', error);
        // You might want to show an error message here
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
    }
  });

  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={() => googleLogin()}
      disabled={disabled}
      startIcon={<GoogleIcon />}
      sx={{
        mt: 2,
        mb: 2,
        py: 1.5,
        borderColor: '#4285f4',
        color: '#4285f4',
        fontWeight: 600,
        fontSize: '1rem',
        borderRadius: 2,
        textTransform: 'none',
        '&:hover': {
          borderColor: '#3367d6',
          backgroundColor: 'rgba(66, 133, 244, 0.04)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(66, 133, 244, 0.15)',
        },
        '&:disabled': {
          borderColor: '#ccc',
          color: '#999',
          transform: 'none',
          boxShadow: 'none'
        }
      }}
    >
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
