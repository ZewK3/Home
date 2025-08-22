// =====================================================
// API UTILITY - RESTful API CALLS WITH BACKWARD COMPATIBILITY
// =====================================================
// Utility functions for making API calls to the HR Management System
// Supports both RESTful endpoints and legacy action-based calls
// =====================================================

// API Configuration
const API_CONFIG = {
  BASE_URL: "https://zewk.tocotoco.workers.dev",
  VERSION: "v2",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// API Utility Class
class APIClient {
  constructor(baseUrl = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.version = API_CONFIG.VERSION;
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic API request with retry logic
  async request(endpoint, options = {}) {
    const { 
      method = 'GET', 
      body = null, 
      headers = {}, 
      useAuth = true,
      retries = API_CONFIG.RETRY_ATTEMPTS 
    } = options;

    const requestHeaders = {
      ...this.getAuthHeaders(),
      ...headers
    };

    const requestOptions = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : null
    };

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...requestOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle response
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on auth errors or client errors
        if (error.message.includes('401') || error.message.includes('403') || 
            error.message.includes('400') || error.name === 'AbortError') {
          throw error;
        }
        
        // Wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  }

  // RESTful API Methods
  
  // Authentication
  async login(credentials) {
    try {
      // Try RESTful endpoint first
      return await this.request(`/api/${this.version}/auth/login`, {
        method: 'POST',
        body: credentials,
        useAuth: false
      });
    } catch (error) {
      console.log("RESTful login failed, trying legacy endpoint:", error.message);
      
      // Fallback to legacy endpoint
      return await this.request(`?action=login`, {
        method: 'POST',
        body: credentials,
        useAuth: false
      });
    }
  }

  async register(userData) {
    try {
      // Try RESTful endpoint first
      return await this.request(`/api/${this.version}/auth/register`, {
        method: 'POST',
        body: userData,
        useAuth: false
      });
    } catch (error) {
      console.log("RESTful register failed, trying legacy endpoint:", error.message);
      
      // Fallback to legacy endpoint
      return await this.request(`?action=register`, {
        method: 'POST',
        body: userData,
        useAuth: false
      });
    }
  }

  // Users
  async getUsers() {
    try {
      // Try RESTful endpoint first
      return await this.request(`/api/${this.version}/users`);
    } catch (error) {
      console.log("RESTful getUsers failed, trying legacy endpoint:", error.message);
      
      // Fallback to legacy endpoint
      return await this.request(`?action=getUsers`);
    }
  }

  async getUser(employeeId) {
    try {
      // Try RESTful endpoint first
      return await this.request(`/api/${this.version}/users/${employeeId}`);
    } catch (error) {
      console.log("RESTful getUser failed, trying legacy endpoint:", error.message);
      
      // Fallback to legacy endpoint
      return await this.request(`?action=getUser&employeeId=${employeeId}`);
    }
  }

  async updateUser(employeeId, userData) {
    try {
      // Try RESTful endpoint first
      return await this.request(`/api/${this.version}/users/${employeeId}`, {
        method: 'PUT',
        body: userData
      });
    } catch (error) {
      console.log("RESTful updateUser failed, trying legacy endpoint:", error.message);
      
      // Fallback to legacy endpoint
      return await this.request(`?action=updateUser`, {
        method: 'POST',
        body: { employeeId, ...userData }
      });
    }
  }

  // Stores
  async getStores() {
    try {
      // Try RESTful endpoint first
      return await this.request(`/api/${this.version}/stores`);
    } catch (error) {
      console.log("RESTful getStores failed, trying legacy endpoint:", error.message);
      
      // Fallback to legacy endpoint
      return await this.request(`?action=getStores`);
    }
  }

  // Legacy action-based API calls for compatibility
  async legacyCall(action, method = 'GET', body = null) {
    return await this.request(`?action=${action}`, {
      method,
      body
    });
  }
}

// Create global API client instance
const apiClient = new APIClient();

// Backward compatibility functions
async function callAPI(action, method = 'GET', body = null) {
  return await apiClient.legacyCall(action, method, body);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIClient, apiClient, callAPI };
}

// Global assignment for script tag usage
if (typeof window !== 'undefined') {
  window.APIClient = APIClient;
  window.apiClient = apiClient;
  window.callAPI = callAPI;
}