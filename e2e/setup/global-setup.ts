import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Global Setup...')
  
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    console.log(`📡 Checking if app is ready at ${baseURL}`)
    await page.goto(baseURL || 'http://localhost:3003', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    })
    
    // Verify the app loads correctly
    await page.waitForSelector('body', { timeout: 30000 })
    console.log('✅ Application is ready for E2E testing')

    // Set up test data and mock states if needed
    await page.evaluate(() => {
      // Clear any existing localStorage/sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Set development mode flags
      localStorage.setItem('e2e_test_mode', 'true')
      localStorage.setItem('mock_auth_enabled', 'true')
      
      console.log('🧪 E2E test environment configured')
    })

    // Take a screenshot to verify setup
    await page.screenshot({ 
      path: 'test-results/setup-verification.png',
      fullPage: true 
    })

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await page.close()
    await browser.close()
  }

  console.log('✅ E2E Test Global Setup Complete')
}

export default globalSetup 