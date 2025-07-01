import { useState, useEffect } from 'react';
import { getApiEnvironment, getOpenAIConfiguration } from '../lib/apiEnvironment';
import { isSupabaseConfigured } from '../lib/supabase';
import { validateOpenAIConfig } from '../lib/openai';

interface DebugInfo {
  timestamp: string;
  environment: any;
  openaiConfig: any;
  supabaseStatus: boolean;
  validationResult: any;
  browserInfo: any;
  networkInfo: any;
}

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  useEffect(() => {
    // Collect debug information
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      environment: getApiEnvironment(),
      openaiConfig: getOpenAIConfiguration(),
      supabaseStatus: isSupabaseConfigured(),
      validationResult: validateOpenAIConfig(),
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        platform: navigator.platform
      },
      networkInfo: {
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        downlink: (navigator as any).connection?.downlink || 'unknown',
        rtt: (navigator as any).connection?.rtt || 'unknown'
      }
    };
    setDebugInfo(info);
    
    // Log to console for debugging
    console.log('🔍 Debug Panel Information:', info);
  }, []);

  const testAPIConnection = async () => {
    setIsTestingAPI(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing API connection...');
      
      // Import the AI service dynamically to test
      const { sendMessageToAI } = await import('../lib/aiService');
      
      const testMessage = { role: 'user' as const, content: 'Hello, this is a test message. Please respond briefly.' };
      const response = await sendMessageToAI([testMessage]);
      
      setTestResult(`✅ API Test Successful!\n\nResponse: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`);
      console.log('✅ API test successful:', response);
      
    } catch (error) {
      const errorMessage = `❌ API Test Failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setTestResult(errorMessage);
      console.error('❌ API test failed:', error);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const copyDebugInfo = () => {
    if (debugInfo) {
      const debugText = JSON.stringify(debugInfo, null, 2);
      navigator.clipboard.writeText(debugText);
      console.log('📋 Debug info copied to clipboard');
    }
  };

  const downloadDebugInfo = () => {
    if (debugInfo) {
      const debugText = JSON.stringify(debugInfo, null, 2);
      const blob = new Blob([debugText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studypal-debug-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('💾 Debug info downloaded');
    }
  };

  if (!debugInfo) {
    return null;
  }

  return (
    <>
      {/* Debug Toggle Button - HIDDEN */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-full shadow-lg transition-all hidden"
        title="Toggle Debug Panel"
        style={{ display: 'none' }}
      >
        🐛
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🐛 StudyPal AI Debug Panel</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Environment Info */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold mb-2">🌍 Environment</h3>
                <div className="text-sm space-y-1">
                  <div>Location: {debugInfo.environment.baseUrl}</div>
                  <div>Mode: {debugInfo.environment.isDevelopment ? 'Development' : 'Production'}</div>
                  <div>GitHub Pages: {debugInfo.environment.isGitHubPages ? 'Yes' : 'No'}</div>
                  <div>Direct OpenAI: {debugInfo.environment.canMakeDirectOpenAICalls ? 'Allowed' : 'Blocked'}</div>
                </div>
              </div>

              {/* OpenAI Config */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold mb-2">🤖 OpenAI Configuration</h3>
                <div className="text-sm space-y-1">
                  <div>Status: {debugInfo.openaiConfig.canUseOpenAI ? '✅ Ready' : '❌ Not Available'}</div>
                  <div>Reason: {debugInfo.openaiConfig.reason}</div>
                  {debugInfo.openaiConfig.suggestion && (
                    <div>Suggestion: {debugInfo.openaiConfig.suggestion}</div>
                  )}
                </div>
              </div>

              {/* Supabase Status */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold mb-2">🗄️ Supabase</h3>
                <div className="text-sm">
                  Status: {debugInfo.supabaseStatus ? '✅ Configured' : '❌ Not Configured'}
                </div>
              </div>

              {/* Validation */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold mb-2">✅ Validation</h3>
                <div className="text-sm space-y-1">
                  <div>Valid: {debugInfo.validationResult.valid ? '✅ Yes' : '❌ No'}</div>
                  {debugInfo.validationResult.error && (
                    <div>Error: {debugInfo.validationResult.error}</div>
                  )}
                </div>
              </div>

              {/* Browser Info */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold mb-2">🌐 Browser</h3>
                <div className="text-sm space-y-1">
                  <div>Online: {debugInfo.browserInfo.onLine ? 'Yes' : 'No'}</div>
                  <div>Platform: {debugInfo.browserInfo.platform}</div>
                  <div>Language: {debugInfo.browserInfo.language}</div>
                  <div>Network: {debugInfo.networkInfo.effectiveType}</div>
                </div>
              </div>

              {/* Test API */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold mb-2">🧪 API Test</h3>
                <button
                  onClick={testAPIConnection}
                  disabled={isTestingAPI}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded mb-2"
                >
                  {isTestingAPI ? 'Testing...' : 'Test AI Connection'}
                </button>
                {testResult && (
                  <pre className="text-xs bg-gray-700 p-2 rounded mt-2 whitespace-pre-wrap">
                    {testResult}
                  </pre>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={copyDebugInfo}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  📋 Copy Debug Info
                </button>
                <button
                  onClick={downloadDebugInfo}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                >
                  💾 Download Debug Info
                </button>
              </div>

              <div className="text-xs text-gray-400">
                Generated: {debugInfo.timestamp}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
