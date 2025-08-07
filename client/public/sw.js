const CACHE_NAME = 'timeblock-pro-v1.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Vite will inject asset paths during build
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .catch((error) => {
        console.error('[SW] Failed to cache resources during install:', error);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Enhanced Fetch Strategy for Vite Assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Chrome extension requests
  if (event.request.url.includes('chrome-extension://')) {
    return;
  }

  // Handle different types of requests
  if (event.request.destination === 'document') {
    // HTML pages - Network first, then cache
    event.respondWith(networkFirst(event.request));
  } else if (event.request.url.includes('/assets/') || event.request.url.includes('.js') || event.request.url.includes('.css')) {
    // Static assets - Cache first (they have hash names in Vite)
    event.respondWith(cacheFirst(event.request));
  } else {
    // Everything else - Network first
    event.respondWith(networkFirst(event.request));
  }
});

// Cache First Strategy (for hashed assets)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Found in cache:', request.url);
    return cached;
  }
  
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// Network First Strategy (for HTML and API calls)
async function networkFirst(request) {
  try {
    console.log('[SW] Network first for:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Network failed, trying cache:', error);
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback to index.html for navigation requests
    if (request.destination === 'document') {
      return cache.match('/index.html') || cache.match('/');
    }
    
    throw error;
  }
}

// Background Sync for data backup
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'backup-data') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKUP_DATA_REQUEST'
          });
        });
      })
    );
  }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});