import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E Test Global Teardown...')
  
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the app and clean up test data
    await page.goto(baseURL || 'http://localhost:3003', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Clean up test data and states
    await page.evaluate(() => {
      // Clear test-specific localStorage/sessionStorage
      localStorage.removeItem('e2e_test_mode')
      localStorage.removeItem('mock_auth_enabled')
      localStorage.removeItem('test_user_data')
      
      // Clear any authentication tokens from tests
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_session')
      
      console.log('🧪 E2E test data cleaned up')
    })

    console.log('✅ Test environment cleaned up')

  } catch (error) {
    console.error('⚠️ Global teardown warning:', error)
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await page.close()
    await browser.close()
  }

  console.log('✅ E2E Test Global Teardown Complete')
}

export default globalTeardown 