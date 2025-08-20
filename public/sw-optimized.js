const CACHE_NAME = 'it-quiz-app-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'
const IMAGE_CACHE = 'images-v2'

// Critical resources for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/quiz/practice',
  '/offline' // Add offline page
]

// Maximum cache sizes to prevent storage overflow
const MAX_CACHE_SIZE = {
  [STATIC_CACHE]: 50,
  [DYNAMIC_CACHE]: 100,
  [IMAGE_CACHE]: 30
}

// Install service worker and cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // Pre-cache critical data
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Pre-caching critical data')
        // Cache first 20 questions for offline use
        return fetch('/api/questions/sample').then(response => {
          if (response.ok) {
            return cache.put('/api/questions/sample', response)
          }
        }).catch(() => {
          console.log('No sample questions API available')
        })
      })
    ]).then(() => {
      console.log('Service worker installed')
      return self.skipWaiting()
    })
  )
})

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE]
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        // Clean up old caches
        ...cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }),
        // Trim cache sizes
        ...currentCaches.map(cacheName => trimCache(cacheName, MAX_CACHE_SIZE[cacheName]))
      ])
    }).then(() => {
      console.log('Service worker activated')
      return self.clients.claim()
    })
  )
})

// Smart fetch strategy based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-http(s) requests and extensions
  if (!request.url.startsWith('http') || request.url.startsWith('chrome-extension://')) {
    return
  }

  // Apply different strategies based on URL patterns
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
  } else if (url.pathname.startsWith('/exhibits/') || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif)$/)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
  } else if (url.pathname.startsWith('/quiz/') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE))
  }
})

// Cache strategy implementations
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline') || new Response('Offline', { status: 503 })
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  // Always try to fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => null)
  
  // Return cached version immediately if available
  return cached || fetchPromise || new Response('Offline', { status: 503 })
}

// Trim cache to prevent storage overflow
async function trimCache(cacheName, maxItems) {
  if (!maxItems) return
  
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxItems) {
    const deletePromises = keys
      .slice(0, keys.length - maxItems)
      .map(key => cache.delete(key))
    
    await Promise.all(deletePromises)
    console.log(`Trimmed ${cacheName} cache to ${maxItems} items`)
  }
}

// Background sync for quiz progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'quiz-progress-sync') {
    event.waitUntil(syncQuizProgress())
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || []
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          return client.focus()
        }
      }
      // Open new window
      return clients.openWindow(urlToOpen)
    })
  )
})

async function syncQuizProgress() {
  try {
    // Get pending progress from IndexedDB or localStorage
    const pendingData = await getPendingProgressData()
    
    if (pendingData.length > 0) {
      // Send to server when online
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: pendingData })
      })
      
      if (response.ok) {
        await clearPendingProgressData()
        console.log('Quiz progress synced successfully')
      }
    }
  } catch (error) {
    console.log('Sync failed, will retry later:', error)
  }
}

// Helper functions for progress sync
async function getPendingProgressData() {
  // Implementation would depend on your data storage strategy
  return []
}

async function clearPendingProgressData() {
  // Clear synced data
  return Promise.resolve()
}