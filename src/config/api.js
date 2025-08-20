const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:5236/api',
    timeout: 10000
  },
  production: {
    baseUrl: import.meta.env.VITE_API_URL || 'https://your-api-domain.com/api',
    timeout: 15000
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE = API_CONFIG[environment].baseUrl;
export const API_TIMEOUT = API_CONFIG[environment].timeout; 