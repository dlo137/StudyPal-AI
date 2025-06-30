import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../lib/supabaseTest';
import { quickSupabaseTest } from '../lib/quickTest';

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  error?: Record<string, unknown> | string;
}

const TestSupabase: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [quickResults, setQuickResults] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      console.log('🏃‍♂️ Running comprehensive tests...');
      
      // Run both tests
      const [comprehensive, quick] = await Promise.all([
        testSupabaseConnection(),
        quickSupabaseTest()
      ]);
      
      setTestResults(comprehensive);
      setQuickResults(quick);
      setIsLoading(false);
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Supabase Connection Test
          </h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Running tests...</span>
            </div>
          ) : testResults ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border-l-4 ${
                  testResults.success
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-3 ${
                      testResults.success ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  ></span>
                  <h3 className="font-semibold text-lg">
                    Supabase Connection Test
                  </h3>
                </div>
                <p className="text-gray-700 mb-2">{testResults.message}</p>
                {testResults.details && (
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(testResults.details, null, 2)}
                  </pre>
                )}
                {testResults.error && (
                  <div className="mt-3 p-3 bg-red-100 rounded">
                    <p className="text-red-800 font-medium">Error Details:</p>
                    <pre className="text-red-700 text-sm mt-1">
                      {JSON.stringify(testResults.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No test results available</p>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Quick Test Results</h2>
            {quickResults && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(quickResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            {testResults?.success ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">
                  🎉 All tests passed! Your Supabase integration is working correctly.
                  You can now proceed with implementing authentication in your Login and SignUp pages.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  ⚠️ Tests failed. Please check the error details above and verify your environment variables.
                  Make sure your .env.local file contains the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase;
