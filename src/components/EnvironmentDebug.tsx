// Debug component to check environment variables in production
// Add this temporarily to your app to debug the issue

import React from 'react';

export const EnvironmentDebug: React.FC = () => {
  const envVars = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
  };

  // Only show in development or if explicitly enabled
  if (!import.meta.env.DEV && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4>🔍 Environment Debug</h4>
      <div>
        <strong>URL:</strong> {envVars.supabaseUrl ? '✅ Set' : '❌ Missing'}<br/>
        <strong>Anon Key:</strong> {envVars.supabaseAnonKey ? '✅ Set' : '❌ Missing'}<br/>
        <strong>OpenAI Key:</strong> {envVars.openaiApiKey ? '✅ Set' : '❌ Missing'}<br/>
        <strong>Mode:</strong> {envVars.mode}<br/>
        <strong>Dev:</strong> {envVars.dev ? 'Yes' : 'No'}<br/>
      </div>
      {envVars.supabaseUrl && (
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          URL: {envVars.supabaseUrl.substring(0, 30)}...<br/>
          Key: {envVars.supabaseAnonKey?.substring(0, 20)}...<br/>
          OpenAI: {envVars.openaiApiKey?.substring(0, 15)}...
        </div>
      )}
    </div>
  );
};

export default EnvironmentDebug;
