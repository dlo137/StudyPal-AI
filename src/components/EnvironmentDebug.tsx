// Enhanced debug component to check environment variables and system status
// Shows comprehensive environment information for debugging

import React, { useState } from 'react';
import { getApiEnvironment } from '../lib/apiEnvironment';
import { isSupabaseConfigured } from '../lib/supabase';

export const EnvironmentDebug: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const envVars = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
  };

  const apiEnv = getApiEnvironment();
  const supabaseConfigured = isSupabaseConfigured();

  // Show in development or production with debug=true parameter
  const shouldShow = import.meta.env.DEV || window.location.search.includes('debug=true');
  
  if (!shouldShow) {
    return null;
  }

  const getStatusIcon = (condition: boolean) => condition ? '✅' : '❌';
  const getStatusText = (condition: boolean) => condition ? 'Set' : 'Missing';

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#fff',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '11px',
      zIndex: 9999,
      maxWidth: isExpanded ? '400px' : '250px',
      fontFamily: 'monospace',
      border: '1px solid #333',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h4 style={{ margin: 0, color: '#ffd700' }}>🔍 Environment Debug</h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Basic Status */}
      <div style={{ marginBottom: isExpanded ? '12px' : '0' }}>
        <div><strong>Environment:</strong> {envVars.mode} {envVars.dev ? '(Dev)' : '(Prod)'}</div>
        <div><strong>Supabase:</strong> {getStatusIcon(!!envVars.supabaseUrl && !!envVars.supabaseAnonKey)} {getStatusText(!!envVars.supabaseUrl && !!envVars.supabaseAnonKey)}</div>
        <div><strong>OpenAI:</strong> {getStatusIcon(!!envVars.openaiApiKey)} {getStatusText(!!envVars.openaiApiKey)}</div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#87ceeb' }}>🌍 Deployment Info</div>
            <div><strong>GitHub Pages:</strong> {getStatusIcon(apiEnv.isGitHubPages)} {apiEnv.isGitHubPages ? 'Yes' : 'No'}</div>
            <div><strong>Direct OpenAI:</strong> {getStatusIcon(apiEnv.canMakeDirectOpenAICalls)} {apiEnv.canMakeDirectOpenAICalls ? 'Allowed' : 'Blocked'}</div>
            <div><strong>Use Proxy:</strong> {getStatusIcon(apiEnv.shouldUseProxy)} {apiEnv.shouldUseProxy ? 'Yes' : 'No'}</div>
            <div><strong>Base URL:</strong> {window.location.origin}</div>
          </div>

          <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
            <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#98fb98' }}>🗄️ Service Status</div>
            <div><strong>Supabase Configured:</strong> {getStatusIcon(supabaseConfigured)} {supabaseConfigured ? 'Yes' : 'No'}</div>
            <div><strong>Stripe:</strong> {getStatusIcon(!!envVars.stripePublishableKey)} {getStatusText(!!envVars.stripePublishableKey)}</div>
          </div>

          {envVars.supabaseUrl && (
            <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
              <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#ffa07a' }}>🔑 Config Preview</div>
              <div style={{ fontSize: '9px', lineHeight: '1.3' }}>
                <div><strong>Supabase URL:</strong> {envVars.supabaseUrl.substring(0, 35)}...</div>
                <div><strong>Anon Key:</strong> {envVars.supabaseAnonKey?.substring(0, 25)}...</div>
                <div><strong>OpenAI Key:</strong> {envVars.openaiApiKey?.substring(0, 20)}...</div>
              </div>
            </div>
          )}

          <div style={{ 
            fontSize: '9px', 
            color: '#888', 
            textAlign: 'center',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #333'
          }}>
            Generated: {new Date().toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
};

export default EnvironmentDebug;
