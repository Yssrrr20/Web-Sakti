// public/service-worker.js

// NAIKKAN VERSI CACHE
const CACHE_NAME = 'sakti-app-v38'; // *** NAIKKAN VERSI INI lagi ***
// Random comment for force update: 1720364329008 // Ubah angka di akhir


// Aset inti yang wajib ada.
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    'favicon.ico', 
    '/logo192.png', 
    '/logo512.png', 
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
    '/api/activity/recent', '/api/sensors/summary', '/api/zones/generate-grid'
];


// Event 'install' yang disederhanakan
self.addEventListener('install', (event) => {
    console.log('[SW] Memulai instalasi...');
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[SW] Caching aset inti & eksternal...');
            const cachePromises = [];

            // Caching CORE_ASSETS
            CORE_ASSETS.forEach(url => cachePromises.push(
                cache.add(url)
                    .then(() => console.log(`[SW Install] Berhasil cache CORE_ASSET: ${url}`))
                    .catch(err => console.warn(`[SW Install] Gagal cache CORE_ASSET: ${url}`, err))
            ));

            // Caching EXTERNAL_ASSETS
            EXTERNAL_ASSETS.forEach(url => cachePromises.push(
                fetch(url, { mode: 'no-cors' })
                    .then(response => {
                        if (response.ok) {
                            console.log(`[SW Install] Berhasil cache EXTERNAL_ASSET: ${url}`);
                            return cache.put(url, response);
                        }
                        throw new Error(`Failed to fetch external asset: ${url} status: ${response.status}`);
                    })
                    .catch(err => console.warn(`[SW Install] Gagal fetch/cache EXTERNAL_ASSET: ${url}`, err))
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
    )
    .then(() => { 
        return self.clients.claim(); 
    });
});


// Event 'fetch' untuk menangani semua permintaan jaringan
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Prioritaskan index.html / start_url untuk skenario offline home screen
    if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(networkResponse => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        return cache.match('/index.html'); 
                    });
                });
            })
        );
        return; 
    }


    // Tangani file .tif secara eksplisit (cache-first, then network)
    if (url.pathname.endsWith('.tif') || url.pathname.endsWith('.tiff')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request).then(networkResponse => {
                        const responseToCache = networkResponse.clone(); 
                        if (networkResponse.ok) {
                            cache.put(request, responseToCache); 
                        }
                        return networkResponse; 
                    }).catch(error => {
                        console.error(`[SW] Gagal fetch .tif dari jaringan: ${url.href}`, error);
                        return new Response('', { status: 503, statusText: 'Service Unavailable - Offline' });
                    });
                });
            })
        );
        return; 
    }


    // --- BARU: Strategi API Caching yang Disederhanakan (Network-First, Cache-If-Successful) ---
    const BACKEND_API_BASE_URL = 'http://192.168.79.41:3000'; // Ganti dengan URL Zrok backend Anda yang sebenarnya
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
            fetch(rewrittenUrl) // Selalu coba dari jaringan terlebih dahulu
                .then(networkResponse => {
                    console.log(`[SW API] Berhasil fetch dari jaringan: ${rewrittenUrl}, Status: ${networkResponse.status}`);
                    // Pastikan respons adalah 2xx sebelum mencoba meng-cache
                    if (networkResponse.ok) {
                        const responseToCache = networkResponse.clone(); // Kloning untuk cache
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(rewrittenUrl, responseToCache)
                                .then(() => console.log(`[SW API] Berhasil cache API: ${rewrittenUrl}`))
                                .catch(putError => console.error(`[SW API] Gagal cache API (put error): ${rewrittenUrl}`, putError));
                        });
                    } else {
                        console.warn(`[SW API] Tidak cache API (status bukan OK): ${rewrittenUrl}, Status: ${networkResponse.status}`);
                    }
                    return networkResponse; // Kembalikan respons jaringan ke browser
                })
                .catch(fetchError => { // Jika fetch dari jaringan gagal (misalnya offline)
                    console.error(`[SW API] Gagal fetch dari jaringan (offline/error): ${rewrittenUrl}`, fetchError);
                    // Coba sajikan dari cache sebagai fallback
                    return caches.match(rewrittenUrl).then(cachedResponse => {
                        if (cachedResponse) {
                            console.log(`[SW API] Melayani dari cache: ${rewrittenUrl}`);
                            return cachedResponse;
                        }
                        // Jika tidak ada di cache dan fetch gagal, kembalikan respons error
                        console.warn(`[SW API] Tidak ada di cache dan gagal fetch: ${rewrittenUrl}`);
                        return new Response('', { status: 503, statusText: 'Service Unavailable - Offline' });
                    });
                })
        );
        return;
    }

    // Tangani permintaan navigasi (network-first, fallback to cache for index.html)
    // Catatan: Aturan ini sekarang menjadi kurang penting karena aturan navigate yang lebih spesifik di atas
    if (request.mode === 'navigate') { 
        event.respondWith(
            fetch(request).catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Tangani aset lokal dan eksternal lainnya (cache-first, then network)
    if (url.origin === self.location.origin || url.origin === 'https://cdnjs.cloudflare.com') {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(networkResponse => {
                    const responseToCache = networkResponse.clone(); 

                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache)); 
                    }
                    return networkResponse; 
                });
            })
        );
        return;
    }
    
    // Defaultnya adalah langsung ke jaringan.
});