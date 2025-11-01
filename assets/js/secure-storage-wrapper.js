/**
 * Simple SecureStorage Wrapper
 * Provides encrypted localStorage with a simple interface
 */

// Check if SecureStorageManager is available
if (typeof SecureStorageManager === 'undefined') {
    console.error('SecureStorageManager not found! Make sure secure-storage.js is loaded first.');
    throw new Error('SecureStorageManager is required but not loaded');
}

// Initialize secure storage manager
const secureStorage = new SecureStorageManager({
    useEncryption: true,
    encryptionKey: 'hr-management-system-2024'
});

// Simple interface for encrypted storage
const SecureStorage = {
    /**
     * Set encrypted value in localStorage
     */
    set(key, value) {
        secureStorage.setLocalStorage(key, value);
    },

    /**
     * Get and decrypt value from localStorage
     */
    get(key) {
        return secureStorage.getLocalStorage(key);
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Clear all localStorage
     */
    clear() {
        localStorage.clear();
    }
};

// For backward compatibility, also expose direct access
window.SecureStorage = SecureStorage;

// Log success
console.log('✅ SecureStorage initialized successfully');
