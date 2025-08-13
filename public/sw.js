const CACHE_NAME = 'it-quiz-app-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main-app.js'
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

// Fetch strategy: Cache First for app shell, Network First for API calls
self.addEventListener('fetch', (event) => {
  // Skip non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache successful responses
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Provide offline fallback
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})

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