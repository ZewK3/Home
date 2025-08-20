// Authentication Service
import { apiClient } from '../apiClient.js';

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const requestBody = {
        loginEmployeeId: credentials.employeeId,
        loginPassword: credentials.password
      };
      
      // Include rememberMe if provided
      if (credentials.rememberMe !== undefined) {
        requestBody.rememberMe = !!credentials.rememberMe;
      }

      const response = await apiClient.post('/auth/login', requestBody);

      if (response.ok && response.data?.token) {
        // Store token in localStorage
        apiClient.setAuthToken(response.data.token);
        return response.data;
      }

      throw new Error(response.error?.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user (step 1 - send verification email)
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data || response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Verify email with code (step 2 - complete registration)
  async verifyEmail(verificationData) {
    try {
      const response = await apiClient.post('/auth/register/verify', verificationData);
      return response.data || response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  // Get current user information
  async me() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      // If unauthorized, clear token
      if (error.status === 401) {
        this.logout();
      }
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local token
      apiClient.setAuthToken(null);
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiClient.getAuthToken();
  },

  // Get stored token
  getToken() {
    return apiClient.getAuthToken();
  }
};