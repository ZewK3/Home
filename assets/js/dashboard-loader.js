/**
 * Dashboard Script Loader
 * Centralized script loading for dashboard to keep HTML clean
 */

(function() {
    'use strict';
    
    const SCRIPTS = [
        '../../assets/js/config.js',
        '../../assets/js/mock-users.js',
        '../../assets/js/simple-storage.js',
        '../../assets/js/api-client.js',
        '../../assets/js/permission-manager.js',
        '../../assets/js/hrm-modules.js',
        '../../assets/js/hrm-router.js',
        '../../assets/js/dashboard-content.js',
        '../../assets/js/dashboard-main.js'
    ];
    
    let loadedCount = 0;
    
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedCount++;
                console.log(`✓ Loaded (${loadedCount}/${SCRIPTS.length}): ${src.split('/').pop()}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`✗ Failed to load: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.head.appendChild(script);
        });
    }
    
    async function loadAllScripts() {
        console.log('🚀 Loading dashboard scripts...');
        
        try {
            // Load scripts sequentially to maintain dependencies
            for (const script of SCRIPTS) {
                await loadScript(script);
            }
            
            console.log('✅ All dashboard scripts loaded successfully');
            
            // Initialize dashboard after all scripts are loaded
            initializeDashboard();
            
        } catch (error) {
            console.error('❌ Error loading dashboard scripts:', error);
        }
    }
    
    function initializeDashboard() {
        // CH Dashboard - Store Department
        console.log('✅ CH Dashboard loading...');
        
        // Check authentication
        const token = localStorage.getItem('authToken') || SimpleStorage.get('authToken');
        const userData = localStorage.getItem('userData') || SimpleStorage.get('userData');
        
        if (!token || !userData) {
            console.log('No authentication found, redirecting to login...');
            window.location.href = '../../index.html';
            return;
        }
        
        // Initialize Router for CH department
        if (typeof HRMRouter !== 'undefined') {
            HRMRouter.init('CH');
        } else {
            console.error('HRMRouter not found');
        }
        
        // Hide loader
        setTimeout(() => {
            const loader = document.getElementById('mobileLoader');
            if (loader) loader.classList.add('hidden');
        }, 500);
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllScripts);
    } else {
        loadAllScripts();
    }
    
})();
