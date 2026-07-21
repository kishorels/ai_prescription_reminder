
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCpW8KWAUtc9MZU6WBxQ9cZ1Cz2GY_QhQk",
  authDomain: "ai-prescription-fb.firebaseapp.com",
  projectId: "ai-prescription-fb",
  storageBucket: "ai-prescription-fb.firebasestorage.app",
  messagingSenderId: "366209578666",
  appId: "1:366209578666:web:33b2e4feb13b7d69c582d3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/medicine.png",
  });
});
