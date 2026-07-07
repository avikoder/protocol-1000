import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* --------------------------------------------------------------------------
 * Persistent storage
 * iOS Safari can evict IndexedDB under storage pressure. Requesting a
 * persistent grant makes Dexie data far more durable for a home-screen app.
 * ------------------------------------------------------------------------ */
if ('storage' in navigator && 'persist' in navigator.storage) {
  navigator.storage.persisted().then((already) => {
    if (!already) navigator.storage.persist().catch(() => {});
  });
}

/* --------------------------------------------------------------------------
 * Service worker registration (production only; Vite dev doesn't serve it)
 * ------------------------------------------------------------------------ */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((reg) => {
        // If an updated worker is waiting, activate it on next load.
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              nw.postMessage('SKIP_WAITING');
            }
          });
        });
      })
      .catch((err) => console.warn('SW registration failed:', err));
  });
}
