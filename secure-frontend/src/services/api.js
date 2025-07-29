// services/api.js
const API_BASE_URL = 'http://localhost:8080';

const api = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store the JWT token in localStorage
      localStorage.setItem('jwt_token', data.token);
      
      return {
        token: data.token,
        user: { 
          email: email, 
          role: data.role || 'buyer', 
          name: email.split('@')[0] 
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const products = await response.json();
      
      // Add mock images to products since backend doesn't provide them
      return products.map(product => ({
        ...product,
        image: `https://images.unsplash.com/photo-${1500000000 + product.id}?w=300&h=300&fit=crop`
      }));
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Remove token from localStorage regardless of response
      localStorage.removeItem('jwt_token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if logout fails
      localStorage.removeItem('jwt_token');
    }
  },

  // Helper function to get stored token
  getToken: () => {
    return localStorage.getItem('jwt_token');
  },

  // Helper function to check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token');
  }
};

export default api;