import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/test-supabase-connection'; // Auto-run Supabase connection test
import './utils/authDebug'; // Make auth debugging functions available globally

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
