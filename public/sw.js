const CACHE_NAME = 'it-quiz-app-v2'
const DATA_CACHE_NAME = 'it-quiz-app-data-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/workers/json-parser.js'
]

// Critical data that should be cached aggressively
const DATA_URLS = [
  '/_next/static/chunks/src_data_questions_json.js',
  '/_next/static/media/'
]

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service worker installed')
        return self.skipWaiting()
      })
  )
})

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service worker activated')
      return self.clients.claim()
    })
  )
})

// Enhanced fetch strategy with intelligent caching
self.addEventListener('fetch', (event) => {
  // Skip non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return
  }

  const url = new URL(event.request.url)
  
  // Handle different types of requests with appropriate strategies
  if (isDataRequest(event.request)) {
    event.respondWith(handleDataRequest(event.request))
  } else if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticAsset(event.request))
  } else if (isApiRequest(event.request)) {
    event.respondWith(handleApiRequest(event.request))
  } else {
    event.respondWith(handleDefaultRequest(event.request))
  }
})

// Check if request is for JSON data
function isDataRequest(request) {
  return request.url.includes('questions.json') ||
         request.url.includes('src_data_questions_json') ||
         request.url.includes('/_next/static/chunks/') && request.url.includes('json')
}

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/images/') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.svg')
}

// Check if request is for API
function isApiRequest(request) {
  return request.url.includes('/api/')
}

// Cache First strategy for JSON data (aggressive caching)
async function handleDataRequest(request) {
  try {
    const cache = await caches.open(DATA_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // Return cached data immediately
      const clonedResponse = cachedResponse.clone()
      
      // Update cache in background if data is older than 1 hour
      const cacheDate = cachedResponse.headers.get('sw-cache-date')
      if (cacheDate && (Date.now() - parseInt(cacheDate)) > 3600000) {
        updateDataInBackground(request, cache)
      }
      
      return clonedResponse
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone()
      
      // Add timestamp to track cache age
      const headers = new Headers(responseClone.headers)
      headers.set('sw-cache-date', Date.now().toString())
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      })
      
      await cache.put(request, modifiedResponse)
    }
    
    return networkResponse
  } catch (error) {
    console.error('Data request failed:', error)
    // Return cached version if available, even if old
    const cache = await caches.open(DATA_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Cache First strategy for static assets
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Static asset request failed:', error)
    throw error
  }
}

// Network First strategy for API calls
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('API request failed:', error)
    
    // Fallback to cache for GET requests
    if (request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    throw error
  }
}

// Default strategy for other requests
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // Provide offline fallback for navigation
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAME)
      const fallback = await cache.match('/')
      return fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
    }
    throw error
  }
}

// Background update for cached data
async function updateDataInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers)
      headers.set('sw-cache-date', Date.now().toString())
      
      const modifiedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      })
      
      await cache.put(request, modifiedResponse)
      console.log('Background update completed for:', request.url)
    }
  } catch (error) {
    console.error('Background update failed:', error)
  }
}

// Background sync for quiz progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'quiz-progress-sync') {
    event.waitUntil(syncQuizProgress())
  }
})

async function syncQuizProgress() {
  // This would sync quiz progress when back online
  // For now, just log that sync is happening
  console.log('Syncing quiz progress...')
}