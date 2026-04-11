import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add debug info
console.log('Main.tsx: Starting app initialization');
console.log('Main.tsx: Root element found:', document.getElementById('root'));

// Try to initialize analytics with error handling
try {
  import('./lib/plausible-analytics').then(({ plausibleAnalytics }) => {
    plausibleAnalytics.init();
    console.log('Main.tsx: Analytics initialized');
  }).catch(err => {
    console.warn('Main.tsx: Analytics failed to load:', err);
  });
} catch (err) {
  console.warn('Main.tsx: Analytics initialization error:', err);
}

// Add error boundary
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Main.tsx: Root element not found!');
  document.body.innerHTML = '<div style="color: red; font-size: 20px; padding: 20px;">Error: Root element not found</div>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('Main.tsx: App rendered successfully');
  } catch (err) {
    console.error('Main.tsx: Failed to render app:', err);
    rootElement.innerHTML = `<div style="color: red; font-size: 20px; padding: 20px;">Error: ${err.message}</div>`;
  }
}
