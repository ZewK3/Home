/**
 * Simple Storage Utility
 * Provides a simple interface for localStorage with basic encryption
 */

const SimpleStorage = {
    /**
     * Simple XOR-based encoding (not cryptographically secure, but obscures data)
     */
    _encode(str) {
        const key = 'HRM2024';
        let encoded = '';
        for (let i = 0; i < str.length; i++) {
            encoded += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(encoded); // Base64 encode
    },

    /**
     * Decode XOR-encoded string
     */
    _decode(encoded) {
        try {
            const key = 'HRM2024';
            const str = atob(encoded); // Base64 decode
            let decoded = '';
            for (let i = 0; i < str.length; i++) {
                decoded += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return decoded;
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
