// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAA9I27a5eyuxH6zpueuSN69DDm-fMDko0",
    authDomain: "tradelix-ai-a3cf2.firebaseapp.com",
    projectId: "tradelix-ai-a3cf2",
    storageBucket: "tradelix-ai-a3cf2.firebasestorage.app",
    messagingSenderId: "1084379574917",
    appId: "1:1084379574917:web:ab752ffa841dc531fe6fec"
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'Tradelix AI';
    const notificationOptions = {
        body: payload.notification?.body || 'New update from Tradelix AI',
        icon: 'https://raw.githubusercontent.com/habib7514/tradelix-ai/main/icons/file_00000000ca308208ba7576f8ba73b803.png',
        badge: 'https://raw.githubusercontent.com/habib7514/tradelix-ai/main/icons/file_00000000ca308208ba7576f8ba73b803.png',
        vibrate: [200, 100, 200],
        data: payload.data || {},
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ]
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// عند الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('tradelix-ai.netlify.app') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('https://tradelix-ai.netlify.app');
            }
        })
    );
});