/**
 * Simple Storage Utility
 * Provides a simple interface for localStorage with basic encryption
 */

const SimpleStorage = {
    /**
     * Simple XOR-based encoding (not cryptographically secure, but obscures data)
     * Handles UTF-8 characters (including Vietnamese)
     */
    _encode(str) {
        const key = 'HRM2024';
        let encoded = '';
        for (let i = 0; i < str.length; i++) {
            encoded += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        // Use encodeURIComponent to handle UTF-8 before base64 encoding
        return btoa(encodeURIComponent(encoded).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    },

    /**
     * Decode XOR-encoded string
     * Handles UTF-8 characters (including Vietnamese)
     * Falls back to old decoding method for backward compatibility
     */
    _decode(encoded) {
        try {
            const key = 'HRM2024';
            // Try new UTF-8 compatible decoding first
            try {
                const str = decodeURIComponent(Array.prototype.map.call(atob(encoded), (c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                let decoded = '';
                for (let i = 0; i < str.length; i++) {
                    decoded += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
                }
                return decoded;
            } catch (e) {
                // Fall back to old decoding method for backward compatibility
                const str = atob(encoded);
                let decoded = '';
                for (let i = 0; i < str.length; i++) {
                    decoded += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
                }
                return decoded;
            }
        } catch (error) {
            console.error('Decode error:', error);
            return null;
        }
    },

    /**
     * Set value in localStorage with encoding
     */
    set(key, value) {
        try {
            const jsonString = JSON.stringify(value);
            const encoded = this._encode(jsonString);
            localStorage.setItem(key, encoded);
            return true;
        } catch (error) {
            console.error('SimpleStorage.set error:', error);
            return false;
        }
    },

    /**
     * Get and decode value from localStorage
     */
    get(key) {
        try {
            const encoded = localStorage.getItem(key);
            if (!encoded) return null;
            
            const decoded = this._decode(encoded);
            if (!decoded) return null;
            
            return JSON.parse(decoded);
        } catch (error) {
            console.error('SimpleStorage.get error:', error);
            return null;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('SimpleStorage.remove error:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('SimpleStorage.clear error:', error);
            return false;
        }
    },

    /**
     * Check if key exists
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    }
};

// Expose globally
window.SimpleStorage = SimpleStorage;

console.log('✅ SimpleStorage loaded successfully');
