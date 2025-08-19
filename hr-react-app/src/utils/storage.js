// Storage utility functions
export const storage = {
  // Local Storage wrapper
  local: {
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error parsing localStorage item:', error);
        return null;
      }
    },

    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Error setting localStorage item:', error);
        return false;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing localStorage item:', error);
        return false;
      }
    },

    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
      }
    },
  },

  // Session Storage wrapper
  session: {
    get: (key) => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error parsing sessionStorage item:', error);
        return null;
      }
    },

    set: (key, value) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Error setting sessionStorage item:', error);
        return false;
      }
    },

    remove: (key) => {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Error removing sessionStorage item:', error);
        return false;
      }
    },

    clear: () => {
      try {
        sessionStorage.clear();
        return true;
      } catch (error) {
        console.error('Error clearing sessionStorage:', error);
        return false;
      }
    },
  },
};

// Secure storage for sensitive data
export const secureStorage = {
  encryptionKey: 'hr-system-key', // In production, this should be more secure

  encrypt: (data) => {
    // Simple base64 encoding - in production, use proper encryption
    return btoa(JSON.stringify(data));
  },

  decrypt: (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  },

  store: (key, data) => {
    const encrypted = secureStorage.encrypt(data);
    return storage.local.set(key, encrypted);
  },

  retrieve: (key) => {
    const encrypted = storage.local.get(key);
    return encrypted ? secureStorage.decrypt(encrypted) : null;
  },

  remove: (key) => {
    return storage.local.remove(key);
  },
};

export default storage;