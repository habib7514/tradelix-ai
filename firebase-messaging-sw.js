// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAPHGtTeDNamwyR2kfg-b9ABp7pNyyiPKM",
    authDomain: "tradelix-ai.firebaseapp.com",
    projectId: "tradelix-ai",
    storageBucket: "tradelix-ai.firebasestorage.app",
    messagingSenderId: "374195897663",
    appId: "1:374195897663:web:e1ed0ce2c30a4b6aeabf8a"
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);
    const notificationTitle = payload.notification?.title || '🔔 Tradelix Admin';
    const notificationOptions = {
        body: payload.notification?.body || 'لديك إشعار جديد',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'admin-notif'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});