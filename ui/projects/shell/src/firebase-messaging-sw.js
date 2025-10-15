importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCgREMDYv05mLztEdknJIk3OlSnmqrb2v4",
  authDomain: "tonym-web.firebaseapp.com",
  projectId: "tonym-web",
  storageBucket: "tonym-web.firebasestorage.app",
  messagingSenderId: "657158260171",
  appId: "1:657158260171:web:d91d62f940019df91b224e",
  measurementId: "G-R1JL047S0E"
});


const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-192x192.png',
    data: {
      url: payload?.data?.click_action || '/' // store custom URL if sent
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle notification click
self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.');

  event.notification.close();

  const url = event.notification.data?.url || '/';
  // Focus an open tab or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});