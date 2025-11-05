/**
 * PHASE 3: ADVANCED FRONTEND OPTIMIZATIONS
 * State Management System
 * 
 * Centralized reactive state management for consistent data across components
 */

class AppState {
  constructor() {
    // Initialize config FIRST before loading state
    this.config = {
      persistKeys: ['user', 'token', 'preferences'],
      storageKey: 'hrm-app-state'
    };
    this.subscribers = new Set();
    this.state = this.loadState();
  }
  
  /**
   * Subscribe to state changes
   * @param {Function} callback - Called when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  /**
   * Get current state or specific key
   * @param {string} key - Optional state key
   * @returns {*} State value
   */
  getState(key) {
    return key ? this.state[key] : { ...this.state };
  }
  
  /**
   * Update state and notify subscribers
   * @param {Object} updates - State updates
   */
  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Only notify if changed
    if (this.hasChanged(prevState, this.state)) {
      this.notify(this.state, prevState);
      this.saveState();
    }
  }
  
  /**
   * Batch multiple state updates
   * @param {Function} updater - Function that receives current state
   */
  batchUpdate(updater) {
    const prevState = { ...this.state };
    updater(this.state);
    
    if (this.hasChanged(prevState, this.state)) {
      this.notify(this.state, prevState);
      this.saveState();
    }
  }
  
  /**
   * Reset state to initial or provided values
   * @param {Object} initialState - Optional initial state
   */
  reset(initialState = {}) {
    this.state = { ...initialState };
    this.notify(this.state, {});
    this.saveState();
  }
  
  /**
   * Check if state has changed
   */
  hasChanged(prev, current) {
    return JSON.stringify(prev) !== JSON.stringify(current);
  }
  
  /**
   * Notify all subscribers
   */
  notify(newState, oldState) {
    this.subscribers.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('State subscriber error:', error);
      }
    });
  }
  
  /**
   * Load state from storage using SimpleStorage
   */
  loadState() {
    try {
      // Use SimpleStorage if available for UTF-8 support
      if (typeof SimpleStorage !== 'undefined') {
        return SimpleStorage.get(this.config.storageKey) || {};
      }
      // Fallback to localStorage
      const saved = localStorage.getItem(this.config.storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load state:', error);
      return {};
    }
  }
  
  /**
   * Save state to storage using SimpleStorage
   */
  saveState() {
    try {
      // Only save configured keys
      const toSave = {};
      this.config.persistKeys.forEach(key => {
        if (this.state[key] !== undefined) {
          toSave[key] = this.state[key];
        }
      });
      
      // Use SimpleStorage if available for UTF-8 support
      if (typeof SimpleStorage !== 'undefined') {
        SimpleStorage.set(this.config.storageKey, toSave);
      } else {
        localStorage.setItem(this.config.storageKey, JSON.stringify(toSave));
      }
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }
  
  /**
   * Clear all state
   */
  clear() {
    this.state = {};
    // Use SimpleStorage if available
    if (typeof SimpleStorage !== 'undefined') {
      SimpleStorage.remove(this.config.storageKey);
    } else {
      localStorage.removeItem(this.config.storageKey);
    }
    this.notify({}, {});
  }
}

// Global app state instance
const appState = new AppState();

// Make available globally
if (typeof window !== 'undefined') {
  window.appState = appState;
}

/**
 * Smart Cache with multi-layer support
 */
class SmartCache {
  constructor(config = {}) {
    this.memory = new Map();
    this.config = {
      memoryTTL: config.memoryTTL || 60000,      // 1 minute
      storageTTL: config.storageTTL || 300000,   // 5 minutes
      maxMemorySize: config.maxMemorySize || 100,
      storagePrefix: config.storagePrefix || 'cache:'
    };
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }
  
  /**
   * Generate cache key
   */
  key(prefix, ...args) {
    return `${this.config.storagePrefix}${prefix}:${args.join(':')}`;
  }
  
  /**
   * Get from cache with multi-layer fallback
   */
  async get(key, fetchFn, options = {}) {
    const ttl = options.ttl || this.config.memoryTTL;
    const useStorage = options.useStorage !== false;
    
    // 1. Check memory cache
    const memCached = this.memory.get(key);
    if (memCached && Date.now() - memCached.timestamp < ttl) {
      this.stats.hits++;
      console.log(`🎯 Memory cache HIT: ${key}`);
      return memCached.data;
    }
    
    // 2. Check storage using SimpleStorage
    if (useStorage) {
      try {
        let parsed;
        // Use SimpleStorage if available for UTF-8 support
        if (typeof SimpleStorage !== 'undefined') {
          parsed = SimpleStorage.get(key);
        } else {
          const stored = localStorage.getItem(key);
          if (stored) {
            parsed = JSON.parse(stored);
          }
        }
        
        if (parsed && Date.now() - parsed.timestamp < this.config.storageTTL) {
          this.stats.hits++;
          console.log(`💾 Storage cache HIT: ${key}`);
          // Promote to memory cache
          this.setMemory(key, parsed.data);
          return parsed.data;
        }
      } catch (error) {
        console.warn('Storage cache error:', error);
      }
    }
    
    // 3. Fetch fresh data
    this.stats.misses++;
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetchFn();
    
    // Store in both caches
    this.set(key, data, { useStorage });
    
    return data;
  }
  
  /**
   * Set in cache using SimpleStorage
   */
  set(key, data, options = {}) {
    this.stats.sets++;
    this.setMemory(key, data);
    
    if (options.useStorage !== false) {
      try {
        const cacheData = {
          data,
          timestamp: Date.now()
        };
        // Use SimpleStorage if available for UTF-8 support
        if (typeof SimpleStorage !== 'undefined') {
          SimpleStorage.set(key, cacheData);
        } else {
          localStorage.setItem(key, JSON.stringify(cacheData));
        }
      } catch (error) {
        console.warn('Storage set error:', error);
      }
    }
  }
  
  /**
   * Set in memory cache with size limit
   */
  setMemory(key, data) {
    // Evict oldest if size limit reached
    if (this.memory.size >= this.config.maxMemorySize) {
      const firstKey = this.memory.keys().next().value;
      this.memory.delete(firstKey);
    }
    
    this.memory.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Invalidate cache using SimpleStorage
   */
  invalidate(pattern) {
    // Clear memory
    if (pattern.includes('*')) {
      const prefix = pattern.replace('*', '');
      for (const key of this.memory.keys()) {
        if (key.startsWith(prefix)) {
          this.memory.delete(key);
        }
      }
      
      // Clear storage using SimpleStorage
      if (typeof SimpleStorage !== 'undefined') {
        // SimpleStorage doesn't support pattern matching, so we'll clear individual keys
        // This is a limitation we'll need to work around
        for (const key of this.memory.keys()) {
          if (key.startsWith(prefix)) {
            SimpleStorage.remove(key);
          }
        }
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        }
      }
    } else {
      this.memory.delete(pattern);
      if (typeof SimpleStorage !== 'undefined') {
        SimpleStorage.remove(pattern);
      } else {
        localStorage.removeItem(pattern);
      }
    }
  }
  
  /**
   * Clear all caches using SimpleStorage
   */
  clear() {
    this.memory.clear();
    // Clear only cache items from storage
    if (typeof SimpleStorage !== 'undefined') {
      // Note: SimpleStorage doesn't have a pattern-based clear
      // We'll clear memory cache and rely on TTL for storage cleanup
      console.log('Cache memory cleared. Storage items will expire based on TTL.');
    } else {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.storagePrefix)) {
          localStorage.removeItem(key);
        }
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      memorySize: this.memory.size
    };
  }
}

// Global cache instance
const appCache = new SmartCache({
  memoryTTL: 60000,    // 1 minute
  storageTTL: 300000,  // 5 minutes
  maxMemorySize: 100
});

// Make available globally
if (typeof window !== 'undefined') {
  window.appCache = appCache;
}

/**
 * Performance utilities
 */
const PerformanceUtils = {
  /**
   * Debounce function
   */
  debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Throttle function
   */
  throttle(func, limit = 300) {
    let inThrottle;
    
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * Measure function execution time
   */
  async measure(name, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.log(`❌ ${name} failed: ${duration.toFixed(2)}ms`);
      throw error;
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.PerformanceUtils = PerformanceUtils;
}

/**
 * API Request Batcher
 */
class APIBatcher {
  constructor(apiClient) {
    this.client = apiClient;
    this.queue = [];
    this.processing = false;
    this.batchDelay = 10; // ms
  }
  
  /**
   * Add request to batch
   */
  add(method, ...args) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        method,
        args,
        resolve,
        reject
      });
      
      if (!this.processing) {
        setTimeout(() => this.process(), this.batchDelay);
      }
    });
  }
  
  /**
   * Process batched requests
   */
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = [...this.queue];
    this.queue = [];
    
    console.log(`📦 Processing batch of ${batch.length} requests`);
    
    try {
      const results = await Promise.allSettled(
        batch.map(({ method, args }) => 
          this.client[method](...args)
        )
      );
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });
    } finally {
      this.processing = false;
      
      // Process any new requests added during execution
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), this.batchDelay);
      }
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppState,
    SmartCache,
    PerformanceUtils,
    APIBatcher,
    appState,
    appCache
  };
}
