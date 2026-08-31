import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './i18n/index.js';
import './index.css';

// Automatically handle Vite dynamic import / chunk load errors when new builds deploy
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading page for latest assets...', event);
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary fallbackTitle="An unexpected application error occurred.">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
);