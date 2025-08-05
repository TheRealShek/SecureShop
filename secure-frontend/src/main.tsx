import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

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
