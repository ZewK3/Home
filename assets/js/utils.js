/**
 * Utility functions for API calls
 * Provides backward compatibility with legacy code
 * Wraps the new apiClient for consistent usage
 */

const utils = {
    /**
     * Fetch API wrapper for backward compatibility
     * Converts action-based calls to RESTful API calls
     * 
     * @param {string} endpoint - The API endpoint (can be legacy action-based or RESTful)
     * @param {object} options - Fetch options (method, body, headers, etc.)
     * @returns {Promise} - API response
     */
    async fetchAPI(endpoint, options = {}) {
        const client = window.apiClient;
        
        if (!client) {
            throw new Error('API client not initialized');
        }

        // If endpoint contains ?action=, use legacy API
        if (endpoint.includes('?action=')) {
            const url = new URL(CONFIG.API_BASE_URL + endpoint);
            const action = url.searchParams.get('action');
            
            // Extract token if present
            const token = url.searchParams.get('token');
            if (token) {
                // Store token temporarily for this request
                const currentToken = SecureStorageWrapper.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
                SecureStorageWrapper.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
            }
            
            // Use legacy endpoint
            const method = options.method || 'GET';
            const body = options.body ? JSON.parse(options.body) : null;
            
            try {
                return await client.legacyRequest(action, method, body);
            } catch (error) {
                // Re-throw with more context
                console.error(`Legacy API call failed: action=${action}`, error);
                throw error;
            }
        }
        
        // For RESTful endpoints, use fetch directly
        const url = endpoint.startsWith('http') ? endpoint : CONFIG.API_BASE_URL + endpoint;
        const token = SecureStorageWrapper.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
};

// Make utils globally available
if (typeof window !== 'undefined') {
    window.utils = utils;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}
