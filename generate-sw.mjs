import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFiles = ['.env', '.env.local', '.env.production'];
let env = {};

for (const file of envFiles) {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value.length > 0) {
        env[key.trim()] = value.join('=').trim();
      }
    });
  }
}

// Fallback to process.env for Netlify
const VITE_FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY;
const VITE_FIREBASE_AUTH_DOMAIN = process.env.VITE_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN;
const VITE_FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID;
const VITE_FIREBASE_STORAGE_BUCKET = process.env.VITE_FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET;
const VITE_FIREBASE_MESSAGING_SENDER_ID = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const VITE_FIREBASE_APP_ID = process.env.VITE_FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID;

const swContent = `
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "${VITE_FIREBASE_API_KEY}",
  authDomain: "${VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${VITE_FIREBASE_APP_ID}"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/medicine.png",
  });
});
`;

fs.writeFileSync(path.join(__dirname, 'public', 'firebase-messaging-sw.js'), swContent);
console.log('✅ Generated public/firebase-messaging-sw.js with environment variables');
