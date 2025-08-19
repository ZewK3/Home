// API Client for HR Management System
// Base configuration for all API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/Home/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('hr_auth_token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('hr_auth_token', token);
    } else {
      localStorage.removeItem('hr_auth_token');
    }
  }

  // Get headers with auth token if available
  getHeaders(additionalHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...additionalHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Main request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: this.getHeaders(options.headers),
      ...options,
    };

    // Add body for POST/PUT requests
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format: ${response.status}`);
      }

      const data = await response.json();

      // Handle API error responses
      if (!response.ok) {
        const error = new Error(data?.error?.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.code = data?.error?.code;
        error.details = data?.error?.details;
        throw error;
      }

      return data;
    } catch (error) {
      // Log error for debugging
      console.error('API Request failed:', {
        url,
        method: config.method,
        error: error.message,
        status: error.status
      });

      // Re-throw for handling by the caller
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;