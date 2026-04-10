import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { plausibleAnalytics } from './lib/plausible-analytics';

// Initialize Plausible Analytics
plausibleAnalytics.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
