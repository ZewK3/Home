/**
 * Authentication Service
 * Handles API calls for authentication
 */

class AuthService {
    constructor() {
        this.apiUrl = 'https://zewk.tocotoco.workers.dev';
        this.tokenKey = 'accessToken';
        this.refreshTokenKey = 'refreshToken';
        this.userKey = 'userData';
    }

    // API Methods
    async login(credentials) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const result = await response.json();
            
            if (result.success) {
                this.storeTokens(result.data.tokens);
                this.storeUser(result.data.user);
            }
            
            return result;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${this.apiUrl}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            const result = await response.json();
            
            if (result.success) {
                this.storeAccessToken(result.data.accessToken);
            }
            
            return result;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            throw error;
        }
    }

    async logout() {
        try {
            const refreshToken = this.getRefreshToken();
            
            if (refreshToken) {
                await fetch(`${this.apiUrl}/api/v1/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAccessToken()}`
                    },
                    body: JSON.stringify({ refreshToken })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearStorage();
        }
    }

    // Token Management
    storeTokens(tokens) {
        if (tokens.accessToken) {
            localStorage.setItem(this.tokenKey, tokens.accessToken);
        }
        if (tokens.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
        }
    }

    storeAccessToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    storeUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    getAccessToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }

    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    clearStorage() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Authentication State
    isAuthenticated() {
        return !!this.getAccessToken();
    }

    // Protected API Request Helper
    async makeAuthenticatedRequest(url, options = {}) {
        let token = this.getAccessToken();
        
        if (!token) {
            throw new Error('No access token available');
        }

        // Add authorization header
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        try {
            let response = await fetch(url, options);
            
            // If token expired, try to refresh
            if (response.status === 401) {
                await this.refreshToken();
                token = this.getAccessToken();
                
                if (token) {
                    options.headers['Authorization'] = `Bearer ${token}`;
                    response = await fetch(url, options);
                }
            }
            
            return response;
        } catch (error) {
            console.error('Authenticated request error:', error);
            throw error;
        }
    }
}

// Export singleton instance
window.authService = new AuthService();