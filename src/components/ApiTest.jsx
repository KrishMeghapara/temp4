import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import apiService from '../services/apiService';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await apiService.testConnection();
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await apiService.healthCheck();
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        API Connection Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Test API Connectivity
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={runTest}
            disabled={loading}
          >
            Test Connection
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={runHealthCheck}
            disabled={loading}
          >
            Health Check
          </Button>
        </Box>

        {testResult && (
          <Alert severity={testResult.success ? 'success' : 'error'}>
            <Typography variant="h6">
              {testResult.success ? 'Success!' : 'Error'}
            </Typography>
            <Typography variant="body2">
              {testResult.success 
                ? JSON.stringify(testResult.data, null, 2)
                : testResult.error
              }
            </Typography>
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          API Configuration
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          Base URL: {import.meta.env.VITE_API_BASE || 'http://localhost:5236/api'}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          Timeout: {import.meta.env.VITE_API_TIMEOUT || '10000'}ms
        </Typography>
      </Paper>
    </Box>
  );
};

export default ApiTest; 