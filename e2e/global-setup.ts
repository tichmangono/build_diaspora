import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...')

  // Start browser for authentication setup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...')
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000')
    await page.waitForSelector('body', { timeout: 30000 })
    console.log('✅ Development server is ready')

    // Setup test data if needed
    console.log('📝 Setting up test data...')
    
    // Create test users in development mode
    // This would typically involve API calls to create test users
    // For now, we'll rely on the mock authentication system
    
    console.log('✅ Test data setup complete')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('✅ E2E test environment setup complete')
}

export default globalSetup 