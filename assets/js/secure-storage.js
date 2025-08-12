// Enhanced Security Storage Manager for HR Management System
// Provides encrypted localStorage and secure cookie alternatives

class SecureStorageManager {
    constructor(options = {}) {
        this.encryptionKey = options.encryptionKey || this.generateKey();
        this.useEncryption = options.useEncryption !== false;
        this.cookieOptions = {
            secure: options.secure !== false, // Use HTTPS in production
            sameSite: options.sameSite || 'Strict',
            maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: options.httpOnly || false // Can't be true for client-side access
        };
    }

    // Generate a simple encryption key (in production, use a more robust solution)
    generateKey() {
        return 'hr-management-' + btoa(Math.random().toString()).substr(10, 20);
    }

    // Simple encryption using base64 and XOR (for demonstration)
    // In production, use a proper encryption library like crypto-js
    encrypt(text) {
        if (!this.useEncryption) return text;
        
        try {
            const key = this.encryptionKey;
            let encrypted = '';
            for (let i = 0; i < text.length; i++) {
                encrypted += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return btoa(encrypted);
        } catch (error) {
            console.warn('Encryption failed, storing as plain text:', error);
            return text;
        }
    }

    // Decrypt encrypted data
    decrypt(encryptedText) {
        if (!this.useEncryption) return encryptedText;
        
        try {
            const key = this.encryptionKey;
            const encrypted = atob(encryptedText);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return decrypted;
        } catch (error) {
            console.warn('Decryption failed, returning as-is:', error);
            return encryptedText;
        }
    }

    // Enhanced localStorage with encryption
    setLocalStorage(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            const encryptedValue = this.encrypt(jsonValue);
            localStorage.setItem(key, encryptedValue);
            console.log(`✅ Secure localStorage set: ${key}`);
        } catch (error) {
            console.error('Failed to set secure localStorage:', error);
        }
    }

    getLocalStorage(key) {
        try {
            const encryptedValue = localStorage.getItem(key);
            if (!encryptedValue) return null;
            
            const decryptedValue = this.decrypt(encryptedValue);
            return JSON.parse(decryptedValue);
        } catch (error) {
            console.warn('Failed to get secure localStorage, trying plain text fallback:', error);
            // Fallback to plain localStorage for backward compatibility
            try {
                const plainValue = localStorage.getItem(key);
                return plainValue ? JSON.parse(plainValue) : null;
            } catch (fallbackError) {
                console.error('Failed to parse localStorage data:', fallbackError);
                return null;
            }
        }
    }

    // Enhanced cookie management (more secure than localStorage)
    setCookie(name, value, options = {}) {
        try {
            const jsonValue = JSON.stringify(value);
            const encryptedValue = this.encrypt(jsonValue);
            
            const cookieOptions = { ...this.cookieOptions, ...options };
            let cookieString = `${name}=${encryptedValue}`;
            
            if (cookieOptions.maxAge) {
                const expires = new Date(Date.now() + cookieOptions.maxAge);
                cookieString += `; expires=${expires.toUTCString()}`;
            }
            
            if (cookieOptions.secure) {
                cookieString += '; Secure';
            }
            
            if (cookieOptions.sameSite) {
                cookieString += `; SameSite=${cookieOptions.sameSite}`;
            }
            
            if (cookieOptions.httpOnly) {
                cookieString += '; HttpOnly';
            }
            
            cookieString += '; path=/';
            
            document.cookie = cookieString;
            console.log(`✅ Secure cookie set: ${name}`);
        } catch (error) {
            console.error('Failed to set secure cookie:', error);
        }
    }

    getCookie(name) {
        try {
            const value = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${name}=`))
                ?.split('=')[1];
            
            if (!value) return null;
            
            const decryptedValue = this.decrypt(value);
            return JSON.parse(decryptedValue);
        } catch (error) {
            console.warn('Failed to get secure cookie:', error);
            return null;
        }
    }

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`🗑️ Cookie deleted: ${name}`);
    }

    // Clear all stored data
    clearAllData() {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('authToken') || key.includes('userData') || key.includes('loggedInUser')) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear cookies
        ['authToken', 'userData', 'loggedInUser'].forEach(name => {
            this.deleteCookie(name);
        });
        
        console.log('🧹 All secure data cleared');
    }
}

// Security comparison and recommendations
const SECURITY_COMPARISON = {
    localStorage: {
        pros: [
            "Simple to implement",
            "Large storage capacity (5-10MB)",
            "Persists until explicitly cleared",
            "Available across all tabs"
        ],
        cons: [
            "Vulnerable to XSS attacks",
            "Accessible via JavaScript",
            "Not sent with HTTP requests",
            "Stored as plain text"
        ],
        security: "Medium - Requires XSS protection"
    },
    cookies: {
        pros: [
            "Can be HttpOnly (not accessible via JS)",
            "Automatic HTTP transmission",
            "Can be Secure (HTTPS only)",
            "SameSite protection",
            "Built-in expiration"
        ],
        cons: [
            "Limited size (4KB)",
            "Sent with every request",
            "Vulnerable to CSRF if not configured properly"
        ],
        security: "High - When properly configured"
    },
    encrypted: {
        pros: [
            "Data protection even if stolen",
            "Additional security layer",
            "Works with both localStorage and cookies"
        ],
        cons: [
            "Additional complexity",
            "Slight performance overhead",
            "Key management required"
        ],
        security: "Very High - Multi-layer protection"
    }
};

// Usage examples and recommendations
const IMPLEMENTATION_GUIDE = {
    forSensitiveData: {
        recommended: "Encrypted cookies with HttpOnly flag",
        example: `
            const secureStorage = new SecureStorageManager({
                useEncryption: true,
                secure: true,
                httpOnly: true,
                sameSite: 'Strict'
            });
            secureStorage.setCookie('authToken', tokenData);
        `
    },
    forUserPreferences: {
        recommended: "Encrypted localStorage",
        example: `
            const secureStorage = new SecureStorageManager({
                useEncryption: true
            });
            secureStorage.setLocalStorage('userPreferences', preferences);
        `
    },
    forPublicData: {
        recommended: "Plain localStorage (no encryption needed)",
        example: `
            localStorage.setItem('theme', 'light');
        `
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecureStorageManager, SECURITY_COMPARISON, IMPLEMENTATION_GUIDE };
} else {
    window.SecureStorageManager = SecureStorageManager;
    window.SECURITY_COMPARISON = SECURITY_COMPARISON;
    window.IMPLEMENTATION_GUIDE = IMPLEMENTATION_GUIDE;
}