// public/service-worker.js

// NAIKKAN VERSI CACHE
const CACHE_NAME = 'sakti-app-v25'; // *** NAIKKAN VERSI INI agar Service Worker baru terinstal ***

// Aset inti yang wajib ada.
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/assets/Vector (1).png', // Perbaiki path ini jika 404 terus muncul
    '/assets/target-icon.png'
];

// Aset eksternal atau tambahan.
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-brands-400.woff2'
];

const DATA_API_PATHS = [
    '/api/zones', '/api/map-data/trees/all-health', '/api/map-data/soil/all-data',
    '/api/summary/stats', '/api/soil/recent', '/api/status_perangkat',
    '/api/receiver/hasil-peta', '/api/receiver/hasil-csv', '/api/receiver/csv-content',
    '/api/activity', '/api/sensors/summary'
];


// Event 'install' yang disederhanakan
self.addEventListener('install', (event) => {
    console.log('[SW] Memulai instalasi...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[SW] Caching aset inti & eksternal...');
            const cachePromises = [];

            // Caching CORE_ASSETS
            CORE_ASSETS.forEach(url => cachePromises.push(
                cache.add(url).catch(err => console.warn(`[SW] Gagal cache CORE_ASSET: ${url}`, err))
            ));

            // Caching EXTERNAL_ASSETS
            EXTERNAL_ASSETS.forEach(url => cachePromises.push(
                fetch(url, { mode: 'no-cors' })
                    .then(response => {
                        if (response.ok) {
                            return cache.put(url, response);
                        }
                        throw new Error(`Failed to fetch external asset: ${url} status: ${response.status}`);
                    })
            ));

            const results = await Promise.allSettled(cachePromises);
            results.filter(result => result.status === 'rejected').forEach(result => {
                console.error('[SW] Gagal dalam salah satu operasi caching di instalasi:', result.reason);
            });
            return;
        })
    );
});


// Event 'activate' untuk membersihkan cache lama
self.addEventListener('activate', (event) => {
    console.log('[SW] Mengaktifkan...');
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    console.log(`[SW] Menghapus cache lama: ${cacheName}`);
                    return caches.delete(cacheName);
                }
            })
        ))
    );
    return self.clients.claim();
});


// Event 'fetch' untuk menangani semua permintaan jaringan
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 2. Tangani permintaan API (cache-first, then network, dengan rewrite URL)
    const BACKEND_API_BASE_URL = 'http://192.168.79.41:5000';
    let rewrittenUrl = null;
    const isDataApiRequest = DATA_API_PATHS.some(path => {
        if (request.url.includes(path)) {
            rewrittenUrl = `${BACKEND_API_BASE_URL}${url.pathname}${url.search}`;
            return true;
        }
        return false;
    });

    if (isDataApiRequest) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(rewrittenUrl).then(cachedResponse => {
                    const fetchPromise = fetch(rewrittenUrl).then(networkResponse => {
                        // CLONE RESPONSE SEBELUM DIGUNAKAN!
                        const responseToCache = networkResponse.clone(); // Clone untuk cache
                        
                        if (networkResponse.ok) {
                            cache.put(rewrittenUrl, responseToCache); // Gunakan kloning untuk cache
                        }
                        return networkResponse; // Kembalikan respons asli ke browser
                    });
                    // Strategi Cache-First: Sajikan cachedResponse jika ada, jika tidak, tunggu fetchPromise
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // 3. Tangani permintaan navigasi (network-first, fallback to cache for index.html)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // 4. Tangani aset lokal dan eksternal lainnya (cache-first, then network)
    // INI AKAN MENANGANI UBUN PETA LOKAL ANDA SECARA OTOMATIS jika mereka ada di origin yang sama
    if (url.origin === self.location.origin || url.origin === 'https://cdnjs.cloudflare.com') {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(networkResponse => {
                    // CLONE RESPONSE SEBELUM DIGUNAKAN UNTUK CACHE!
                    const responseToCache = networkResponse.clone(); // Clone untuk cache

                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache)); // Gunakan kloning
                    }
                    return networkResponse; // Kembalikan respons asli
                });
            })
        );
        return;
    }
    
    // Abaikan permintaan yang tidak relevan lainnya (misalnya .tif)
    if (url.pathname.endsWith('.tif') || url.pathname.endsWith('.tiff')) {
        return;
    }
});