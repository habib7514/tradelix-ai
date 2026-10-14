importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

self.addEventListener('push', function(event) {
    if (!event.data) return;
    try {
        const data = event.data.json();
        const title = (data.headings && data.headings.en) || data.title || 'Tradelix AI';
        const body = (data.contents && data.contents.en) || data.body || 'New notification';
        const options = {
            body: body,
            icon: 'https://raw.githubusercontent.com/habib7514/tradelix-ai/main/icons/file_00000000ca308208ba7576f8ba73b803.png',
            badge: 'https://raw.githubusercontent.com/habib7514/tradelix-ai/main/icons/file_00000000ca308208ba7576f8ba73b803.png',
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true,
            silent: false,
            tag: 'tradelix-' + Date.now(),
            renotify: true,
            data: data
        };
        event.waitUntil(self.registration.showNotification(title, options));
        if ('setAppBadge' in navigator) {
            event.waitUntil(navigator.setAppBadge(1));
        }
    } catch (e) {}
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if ('clearAppBadge' in navigator) navigator.clearAppBadge();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
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

console.log('[SW] Custom Service Worker loaded');