// ===== Tradelix AI Service Worker =====
const CACHE_NAME = 'tradelix-ai-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    console.log('✅ Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// تنشيط Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    // تجاهل الطلبات غير GET
    if (event.request.method !== 'GET') return;
    
    // تجاهل طلبات Firebase و APIs خارجية
    const url = event.request.url;
    if (url.includes('firebase') || 
        url.includes('googleapis') || 
        url.includes('binance') ||
        url.includes('gold-api') ||
        url.includes('metals.live')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وُجد في الكاش، ارجعه
                if (response) {
                    return response;
                }
                
                // وإلا، اجلبه من الشبكة
                return fetch(event.request)
                    .then(response => {
                        // تأكد أن الرد صحيح
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // احفظ نسخة في الكاش
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // في حال عدم الاتصال، أرجع الصفحة الرئيسية
                        return caches.match('/index.html');
                    });
            })
    );
});
