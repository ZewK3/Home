/**
 * PHASE 3: Service Worker for Offline Support
 * Provides offline functionality and caching for PWA
 */

const CACHE_VERSION = 'hrm-v1';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DATA_CACHE_NAME = `${CACHE_VERSION}-data`;

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/dashboard.html',
  '/pages/admin.html',
  '/assets/css/styles.css',
  '/assets/js/config.js',
  '/assets/js/api-client.js',
  '/assets/js/state-management.js',
  '/assets/js/auth-manager.js',
  '/assets/js/dashboard-api.js',
  '/assets/js/script.js',
  '/assets/js/secure-storage.js',
  '/assets/js/secure-storage-wrapper.js',
  '/assets/js/utils.js'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/stores',
  '/api/shifts'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Installation failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    console.log('[ServiceWorker] Network failed, using cache:', request.url);
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Offline - data not available in cache',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticRequest(request) {
  const url = new URL(request.url);

  // ⚠️ Bỏ qua các request không phải http(s)
  if (!url.protocol.startsWith('http')) {
    return fetch(request);
  }

  // Try cache first
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  // Fallback to network
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);

    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }

    return new Response('Offline', { status: 503 });
  }
}


/**
 * Background sync for offline actions
 */
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  }
});

/**
 * Sync offline attendance records
 */
async function syncAttendance() {
  try {
    // Get offline attendance from IndexedDB
    const db = await openDB();
    const records = await getOfflineRecords(db);
    
    // Sync each record
    for (const record of records) {
      try {
        const response = await fetch('/api/attendance/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record.data)
        });
        
        if (response.ok) {
          await deleteOfflineRecord(db, record.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Sync failed for record:', record.id);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
    throw error; // Retry on failure
  }
}

/**
 * Push notification handler
 */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'HR System', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

/**
 * Message handler for cache management
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

/**
 * IndexedDB helpers for offline data
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hrm-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('attendance')) {
        db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getOfflineRecords(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['attendance'], 'readonly');
    const store = transaction.objectStore('attendance');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteOfflineRecord(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['attendance'], 'readwrite');
    const store = transaction.objectStore('attendance');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

console.log('[ServiceWorker] Loaded');
