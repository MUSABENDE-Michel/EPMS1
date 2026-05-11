import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Tailwind CSS entry point
import './index.css';

// Service worker registration
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline + installable PWA
serviceWorkerRegistration.register();
