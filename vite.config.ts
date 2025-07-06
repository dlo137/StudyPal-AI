// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to check environment variables at build time
function checkEnvVars() {
  return {
    name: 'check-env-vars',
    buildStart() {
      const requiredVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_STRIPE_PUBLISHABLE_KEY',
        'VITE_STRIPE_GOLD_PRICE_ID',
        'VITE_STRIPE_DIAMOND_PRICE_ID'
      ];
      
      console.log('\n🔍 Checking environment variables...');
      
      let allGood = true;
      for (const varName of requiredVars) {
        const value = process.env[varName];
        const isSet = !!value;
        const preview = isSet ? `${value.substring(0, 10)}...` : 'undefined';
        const status = isSet ? '✅' : '❌';
        
        console.log(`${status} ${varName}: ${preview} (${isSet ? value.length : 0} chars)`);
        
        if (!isSet) {
          allGood = false;
        }
      }
      
      console.log(`\n${allGood ? '✅' : '❌'} Environment check ${allGood ? 'passed' : 'failed'}\n`);
      
      if (!allGood) {
        console.warn('⚠️  Some environment variables are missing. Payment features may not work.');
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Merge environment variables into process.env
  Object.assign(process.env, env);
  
  return {
    plugins: [react(), checkEnvVars()],
    // Remove base path for Vercel deployment (was for GitHub Pages)
    // base: '/StudyPal-AI/',
    server: {
      proxy: {
        '/api': 'http://localhost:3001'   // Fixed to match server port
      }
    }
  };
});
