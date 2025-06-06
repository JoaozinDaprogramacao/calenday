const CACHE_NAME = 'agenda-pessoal-cache-v1';

// URLs locais para cache direto
const localUrlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Ou o arquivo JS empacotado, se aplicável
  // Ícones locais
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// URLs de CDN ou externas (podem precisar de tratamento no-cors se não tiverem CORS adequado)
const externalUrlsToCache = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client', // Ajustado para /client para corresponder ao importmap típico
  'https://esm.sh/react-router-dom@^7.6.2',
  // Adicionar URLs mais específicas do esm.sh se necessário, inspecionando a aba Network
  "https://cdn.freesound.org/previews/505/505726_10063505-lq.mp3"
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        
        const localCachePromises = localUrlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                console.warn(`Service Worker: Failed to fetch local resource ${url}. Status: ${response.status}`);
                // Não armazena respostas de erro no cache para recursos locais críticos
                return Promise.resolve(); // Continua mesmo se um falhar
              }
              return cache.put(url, response);
            })
            .catch(err => {
              console.warn(`Service Worker: Error fetching local resource ${url}`, err);
              return Promise.resolve();
            });
        });

        const externalCachePromises = externalUrlsToCache.map(url => {
          // Para recursos externos, 'no-cors' pode ser necessário se eles não tiverem cabeçalhos CORS adequados.
          // Isso resulta em uma "resposta opaca", que não podemos inspecionar, mas pode ser armazenada.
          return fetch(new Request(url, { mode: 'no-cors' }))
            .then(response => {
              // Para respostas opacas (type 'opaque'), o status é 0.
              // Verifique 'ok' para respostas não opacas.
              if (response.ok || response.type === 'opaque') {
                return cache.put(url, response);
              }
              console.warn(`Service Worker: Failed to fetch external resource ${url}`);
              return Promise.resolve();
            })
            .catch(err => {
              console.warn(`Service Worker: Error fetching external resource ${url}`, err);
              return Promise.resolve();
            });
        });
        
        return Promise.all([...localCachePromises, ...externalCachePromises]);
      })
      .then(() => {
        console.log('Service Worker: All specified resources have been attempted to be cached.');
        return self.skipWaiting(); // Ativa o service worker imediatamente
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
    }).then(() => self.clients.claim()) // Reivindica clientes imediatamente
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
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
          console.warn('Service Worker: Fetch failed; serving fallback or error for:', event.request.url, error);
          // Você pode querer retornar uma página offline aqui se o request for de navegação
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // Precisa criar e cachear offline.html
          // }
          // Para outros requests, apenas deixe o erro do navegador acontecer.
        });
      })
  );
});
