import { API_BASE, API_TIMEOUT } from '../config/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.timeout = API_TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('jwtToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      timeout: this.timeout
    };

    const config = { ...defaultOptions, ...options };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle FluentValidation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        // Handle other API errors
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Test endpoint
  async testConnection() {
    return this.request('/Test');
  }

  async healthCheck() {
    return this.request('/Test/health');
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/User/Login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/User/Register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async validateToken() {
    return this.request('/User/ValidateToken');
  }

  async googleLogin(idToken) {
    return this.request('/User/GoogleLogin', {
      method: 'POST',
      body: JSON.stringify({ IdToken: idToken })
    });
  }

  // Product endpoints
  async getProducts() {
    return this.request('/Product');
  }

  async getProductById(id) {
    return this.request(`/Product/${id}`);
  }

  async getProductsByCategory(categoryId) {
    return this.request(`/Product/ByCategory/${categoryId}`);
  }

  // Category endpoints
  async getCategories() {
    return this.request('/Category');
  }

  // Cart endpoints
  async getCartByUserId(userId) {
    return this.request(`/Cart/User/${userId}`);
  }

  async getMyCart() {
    return this.request('/Cart/MyCart');
  }

  async addToCart(cartItem) {
    return this.request('/Cart/Add', {
      method: 'POST',
      body: JSON.stringify(cartItem)
    });
  }

  async updateCartQuantity(cartItem) {
    return this.request('/Cart/UpdateQty', {
      method: 'PUT',
      body: JSON.stringify(cartItem)
    });
  }

  async removeFromCart(cartId) {
    return this.request(`/Cart/Remove/${cartId}`, {
      method: 'DELETE'
    });
  }

  // Address endpoints
  async addAddress(addressData) {
    return this.request('/Address', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateAddress(id, addressData) {
    return this.request(`/Address/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  }

  // User endpoints
  async getUserById(id) {
    return this.request(`/User/${id}`);
  }

  async getUserProfile() {
    return this.request('/User/Profile');
  }

  async updateUser(id, userData) {
    return this.request(`/User/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(passwordData) {
    return this.request('/User/ChangePassword', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request('/Order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrdersByUser(userId) {
    return this.request(`/Order/User/${userId}`);
  }

  async getOrderById(orderId) {
    return this.request(`/Order/${orderId}`);
  }
}

export default new ApiService(); 