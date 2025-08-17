// Example implementation showing how to use enhanced security features
// This file demonstrates the usage of the SecureStorageManager and enhanced AuthManager

// Example 1: Using AuthManager with enhanced security (recommended for production)
function initializeSecureAuthManager() {
    // Initialize AuthManager with secure storage options
    const secureAuthManager = new AuthManager({
        useSecureStorage: true,      // Enable secure storage
        useEncryption: true,         // Enable data encryption
        secure: true,                // Use HTTPS-only cookies (set to false for development)
        sameSite: 'Strict'          // CSRF protection
    });
    
    console.log('✅ Secure AuthManager initialized');
    return secureAuthManager;
}

// Example 2: Using regular AuthManager (current behavior)
function initializeRegularAuthManager() {
    const regularAuthManager = new AuthManager();
    console.log('✅ Regular AuthManager initialized');
    return regularAuthManager;
}

// Example 3: Manual secure storage usage
function demonstrateSecureStorage() {
    const secureStorage = new SecureStorageManager({
        useEncryption: true,
        secure: location.protocol === 'https:', // Automatic HTTPS detection
        sameSite: 'Strict'
    });
    
    // Store sensitive data (encrypted)
    const sensitiveData = { token: 'abc123', userId: 'user001' };
    secureStorage.setCookie('authToken', sensitiveData);
    
    // Store user preferences (encrypted localStorage)
    const preferences = { theme: 'dark', language: 'vi' };
    secureStorage.setLocalStorage('userPreferences', preferences);
    
    // Retrieve data
    const retrievedToken = secureStorage.getCookie('authToken');
    const retrievedPrefs = secureStorage.getLocalStorage('userPreferences');
    
    console.log('Retrieved token:', retrievedToken);
    console.log('Retrieved preferences:', retrievedPrefs);
}

// Security comparison and recommendations
function displaySecurityComparison() {
    console.log('=== SECURITY COMPARISON ===');
    console.table(SECURITY_COMPARISON);
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('🔐 For Authentication Tokens:', IMPLEMENTATION_GUIDE.forSensitiveData.recommended);
    console.log('⚙️ For User Preferences:', IMPLEMENTATION_GUIDE.forUserPreferences.recommended);
    console.log('📄 For Public Data:', IMPLEMENTATION_GUIDE.forPublicData.recommended);
}

// Migration guide from localStorage to secure storage
function migrateToSecureStorage() {
    console.log('🔄 Migrating from localStorage to secure storage...');
    
    // Step 1: Read existing localStorage data
    const existingToken = localStorage.getItem('authToken');
    const existingUserData = localStorage.getItem('loggedInUser');
    
    if (existingToken || existingUserData) {
        // Step 2: Initialize secure storage
        const secureStorage = new SecureStorageManager({
            useEncryption: true,
            secure: location.protocol === 'https:'
        });
        
        // Step 3: Migrate data to secure storage
        if (existingToken) {
            secureStorage.setCookie('authToken', existingToken);
            localStorage.removeItem('authToken'); // Clean up
        }
        
        if (existingUserData) {
            try {
                const userData = JSON.parse(existingUserData);
                secureStorage.setLocalStorage('loggedInUser', userData);
                localStorage.removeItem('loggedInUser'); // Clean up
            } catch (error) {
                console.warn('Failed to parse existing user data:', error);
            }
        }
        
        console.log('✅ Migration completed successfully');
    } else {
        console.log('ℹ️ No existing data to migrate');
    }
}

// Performance comparison
function performanceComparison() {
    console.log('🔍 Performance Comparison Test');
    
    const testData = { large: 'x'.repeat(1000), complex: { nested: { data: [1, 2, 3] } } };
    
    // Test regular localStorage
    console.time('localStorage write');
    localStorage.setItem('test', JSON.stringify(testData));
    console.timeEnd('localStorage write');
    
    console.time('localStorage read');
    JSON.parse(localStorage.getItem('test'));
    console.timeEnd('localStorage read');
    
    // Test secure storage
    const secureStorage = new SecureStorageManager({ useEncryption: true });
    
    console.time('secure storage write');
    secureStorage.setLocalStorage('test_secure', testData);
    console.timeEnd('secure storage write');
    
    console.time('secure storage read');
    secureStorage.getLocalStorage('test_secure');
    console.timeEnd('secure storage read');
    
    // Cleanup
    localStorage.removeItem('test');
    localStorage.removeItem('test_secure');
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSecureAuthManager,
        initializeRegularAuthManager,
        demonstrateSecureStorage,
        displaySecurityComparison,
        migrateToSecureStorage,
        performanceComparison
    };
} else {
    // Make functions available globally for testing
    window.SecurityExamples = {
        initializeSecureAuthManager,
        initializeRegularAuthManager,
        demonstrateSecureStorage,
        displaySecurityComparison,
        migrateToSecureStorage,
        performanceComparison
    };
}

// Auto-display comparison on load
if (typeof console !== 'undefined') {
    setTimeout(() => {
        displaySecurityComparison();
    }, 1000);
}