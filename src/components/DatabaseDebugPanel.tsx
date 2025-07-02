import { useState } from 'react'
import { testDailyUsageTable, getCurrentUser } from '../lib/testDailyUsage'

export default function DatabaseDebugPanel() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    try {
      console.log('Running database tests...')
      
      // Test user authentication
      const userResult = await getCurrentUser()
      console.log('User test result:', userResult)
      
      // Test daily usage table
      const tableResult = await testDailyUsageTable()
      console.log('Table test result:', tableResult)
      
      setTestResults({
        user: userResult,
        dailyUsageTable: tableResult,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Test error:', error)
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Database Debug Panel</h3>
      <button
        onClick={runTests}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>
      
      {testResults && (
        <div className="mt-3 text-xs">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(testResults, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
