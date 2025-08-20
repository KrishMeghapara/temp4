import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('userData');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('jwtToken');
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token validation function
  const validateToken = useCallback(async (jwtToken) => {
    if (!jwtToken) return false;
    
    try {
      // Check if token is expired (basic JWT parsing)
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired');
        return false;
      }
      
      // Optionally validate with server
      const response = await fetch('http://localhost:5236/api/User/ValidateToken', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (token) {
          const isValid = await validateToken(token);
          if (!isValid) {
            // Token is invalid, clear it
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userData');
            setToken(null);
            setUser(null);
          } else {
            // Token is valid, fetch user data if not already loaded
            if (!user) {
              try {
                const response = await fetch('http://localhost:5236/api/User/Profile', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  const userInfo = {
                    ...userData,
                    isGoogleUser: userData.IsGoogleUser || false,
                    googlePicture: userData.GooglePicture || null
                  };
                  setUser(userInfo);
                  localStorage.setItem('userData', JSON.stringify(userInfo));
                }
              } catch (error) {
                console.error('Error fetching user profile:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
        // Clear invalid token
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token, validateToken, user]);

  // Persist token to localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem('jwtToken', token);
      } else {
        localStorage.removeItem('jwtToken');
      }
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
      setError('Failed to save authentication data');
    }
  }, [token]);

  const login = useCallback((jwtToken, userData) => {
    if (!jwtToken) {
      setError('Invalid token provided');
      return;
    }
    
    try {
      const userInfo = {
        ...userData,
        // Handle Google user data
        isGoogleUser: userData.IsGoogleUser || false,
        googlePicture: userData.GooglePicture || null
      };
      
      setToken(jwtToken);
      setUser(userInfo);
      setError(null);
      
      // Save user data to localStorage
      localStorage.setItem('userData', JSON.stringify(userInfo));
      
      // Optional: Set up token refresh timer
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Refresh token 5 minutes before expiration
        const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 0);
        
        setTimeout(() => {
          console.log('Token will expire soon, consider refreshing');
          // Implement token refresh logic here
        }, refreshTime);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to process login');
    }
  }, []);

  const logout = useCallback(() => {
    try {
      setToken(null);
      setUser(null);
      setError(null);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userData');
      
      // Optional: Notify server about logout
      if (token) {
        fetch('http://localhost:5236/api/User/Logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(error => {
          console.error('Logout notification error:', error);
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout properly');
    }
  }, [token]);

  const updateUser = useCallback((userData) => {
    if (!userData) {
      setError('Invalid user data provided');
      return;
    }
    
    try {
      const updatedUser = {
        ...user,
        ...userData
      };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setError(null);
    } catch (error) {
      console.error('Update user error:', error);
      setError('Failed to update user data');
    }
  }, [user]);

  const refreshToken = useCallback(async () => {
    if (!token) return false;
    
    try {
      const response = await fetch('http://localhost:5236/api/User/RefreshToken', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token || data.Token) {
          setToken(data.token || data.Token);
          return true;
        }
      }
      
      // If refresh fails, logout user
      logout();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  }, [token, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    updateUser,
    refreshToken,
    clearError,
    isAuthenticated: !!token && !!user,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};