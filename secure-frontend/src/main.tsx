import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { debugAuthState, debugForceLogout } from './utils/debugAuth';

// Add debug functions to global window object for easy access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthState;
  (window as any).forceLogout = debugForceLogout;
  console.log('🔧 Debug functions available: window.debugAuth() and window.forceLogout()');
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
