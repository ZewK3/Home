// =====================================================
// API TESTING UTILITIES
// =====================================================
// Simple testing utilities to validate API functionality
// =====================================================

class APITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async test(name, testFunction) {
    console.log(`🧪 Running test: ${name}`);
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.results.push({ name, status: 'PASS', duration });
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({ name, status: 'FAIL', error: error.message, duration });
      console.log(`❌ ${name} - FAILED: ${error.message} (${duration}ms)`);
    }
  }

  async testEndpoint(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async runBasicTests() {
    console.log('🚀 Starting API Tests...\n');

    // Test RESTful endpoints
    await this.test('RESTful Stores Endpoint', async () => {
      const data = await this.testEndpoint('/api/v2/stores');
      if (!data) throw new Error('No data returned');
    });

    // Test legacy endpoints for backward compatibility
    await this.test('Legacy Stores Endpoint', async () => {
      const data = await this.testEndpoint('?action=getStores');
      if (!data) throw new Error('No data returned');
    });

    // Test CORS headers
    await this.test('CORS Headers', async () => {
      const response = await fetch(`${this.baseUrl}/api/v2/stores`, {
        method: 'OPTIONS'
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (!corsHeader) throw new Error('CORS headers missing');
    });

    // Test error handling
    await this.test('Error Handling', async () => {
      try {
        await this.testEndpoint('/api/v2/nonexistent');
        throw new Error('Should have returned 404');
      } catch (error) {
        if (!error.message.includes('404')) {
          throw new Error('Expected 404 error');
        }
      }
    });

    console.log('\n📊 Test Results:');
    console.table(this.results);
    
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`\n✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success Rate: ${(passCount / this.results.length * 100).toFixed(1)}%`);
  }
}

// UI Testing utilities
class UITester {
  static testDOMUtilities() {
    console.log('🎨 Testing DOM Utilities...');
    
    // Test element creation
    const testElement = DOMUtils.createElement('div', {
      className: 'test-element',
      textContent: 'Test content'
    });
    
    if (!testElement || testElement.className !== 'test-element') {
      throw new Error('Element creation failed');
    }
    
    // Test select population
    const testSelect = document.createElement('select');
    const testOptions = [
      { value: 'test1', text: 'Test 1' },
      { value: 'test2', text: 'Test 2' }
    ];
    
    DOMUtils.populateSelect(testSelect, testOptions, { value: '', text: 'Choose...' });
    
    if (testSelect.options.length !== 3) { // default + 2 options
      throw new Error('Select population failed');
    }
    
    console.log('✅ DOM Utilities test passed');
  }

  static testAPIClient() {
    console.log('🔗 Testing API Client...');
    
    if (typeof apiClient === 'undefined') {
      throw new Error('API Client not available');
    }
    
    if (typeof apiClient.getStores !== 'function') {
      throw new Error('API Client methods missing');
    }
    
    console.log('✅ API Client test passed');
  }

  static runUITests() {
    try {
      this.testDOMUtilities();
      this.testAPIClient();
      console.log('🎉 All UI tests passed!');
    } catch (error) {
      console.error('❌ UI test failed:', error.message);
    }
  }
}

// Auto-run tests if this is loaded in browser
if (typeof window !== 'undefined') {
  window.APITester = APITester;
  window.UITester = UITester;
  
  // Run UI tests when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => UITester.runUITests(), 1000);
    });
  } else {
    setTimeout(() => UITester.runUITests(), 1000);
  }
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APITester, UITester };
}