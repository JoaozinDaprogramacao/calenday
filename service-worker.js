const CACHE_NAME = 'agenda-pessoal-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Or the bundled JS file if you know its name, e.g., /assets/index.js
  // Styles - Tailwind is via CDN, fonts also. Service worker can cache these too.
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  // JS modules from esm.sh (Note: Caching versioned URLs can be tricky with updates)
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react-router-dom@^7.6.2',
  // You might need to list more specific esm.sh URLs if the above are not sufficient
  // Or implement a more dynamic caching strategy for these.
  // Add paths to your icons if you serve them locally, e.g., '/icons/icon-192x192.png'
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Add other static assets if any (e.g., images, sound files if local)
   "https://cdn.freesound.org/previews/505/505726_10063505-lq.mp3" 
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Use addAll with caution for external URLs, if one fails, all fail.
        // Consider caching external resources on first fetch instead.
        const cachePromises = urlsToCache.map(urlToCache => {
          return fetch(new Request(urlToCache, { mode: 'no-cors' })) // Use no-cors for opaque responses from CDNs
            .then(response => {
                if (response.status === 0 || response.ok || response.type === 'opaque') { // Check for opaque responses as well
                   return cache.put(urlToCache, response);
                }
                console.warn(`Service Worker: Failed to fetch and cache ${urlToCache}`, response.status, response.statusText);
                return Promise.resolve(); // Don't let one failure stop all caching
            })
            .catch(err => {
                console.warn(`Service Worker: Error fetching and caching ${urlToCache}`, err);
                return Promise.resolve();
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Service Worker: All resources have been fetched and cached (or skipped on error).');
        return self.skipWaiting(); // Activate worker immediately
      })
      .catch(error => {
        console.error('Service Worker: Caching failed during install', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Claim clients immediately
  );
});

self.addEventListener('fetch', event => {
  // Let the browser handle requests for scripts from esm.sh directly
  // if (event.request.url.startsWith('https://esm.sh/')) {
  //    event.respondWith(fetch(event.request));
  //    return;
  // }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // If it's a successful response and not from a chrome-extension, cache it.
            // Be careful with caching POST requests or other non-idempotent methods.
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension://')) {
               const responseToCache = networkResponse.clone();
               caches.open(CACHE_NAME)
                 .then(cache => {
                   cache.put(event.request, responseToCache);
                 });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetch failed; returning offline page or error.', error);
          // Optionally, return a fallback offline page:
          // return caches.match('/offline.html'); 
        });
      })
  );
});
