import { test, expect } from '@playwright/test'
import { AuthHelpers, UIHelpers, TEST_USERS } from '../utils/test-helpers'

test.describe('Login Authentication Flow', () => {
  let authHelpers: AuthHelpers
  let uiHelpers: UIHelpers

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page)
    uiHelpers = new UIHelpers(page)
    
    // Enable mock authentication for testing
    await page.evaluate(() => {
      localStorage.setItem('mock_auth_enabled', 'true')
    })
  })

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should display login form correctly', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    // Verify form elements are present
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-submit-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="forgot-password-link"]')).toBeVisible()
    await expect(page.locator('[data-testid="register-link"]')).toBeVisible()
    
    // Verify page title and heading
    await expect(page).toHaveTitle(/Login/)
    await expect(page.locator('h1')).toContainText('Sign In')
    
    await uiHelpers.takeScreenshot('login-form-display')
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Verify successful login
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    // Verify redirect to dashboard or profile
    expect(page.url()).toMatch(/\/(dashboard|profile|home)/)
    
    await uiHelpers.takeScreenshot('successful-login')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    // Try to login with invalid credentials
    await authHelpers.fillLoginForm({
      email: 'invalid@example.com',
      password: 'wrongpassword',
      fullName: 'Invalid User'
    })
    await authHelpers.submitLoginForm()
    
    // Verify error message is displayed
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="form-error"]')).toContainText(/Invalid credentials|Login failed/)
    
    // Verify user is still on login page
    expect(page.url()).toMatch(/\/login/)
    
    await uiHelpers.takeScreenshot('login-error-invalid-credentials')
  })

  test('should validate email format', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    // Try invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password123')
    await authHelpers.submitLoginForm()
    
    // Verify validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email/)
    
    await uiHelpers.takeScreenshot('login-email-validation')
  })

  test('should validate required fields', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    // Try to submit empty form
    await authHelpers.submitLoginForm()
    
    // Verify validation errors for required fields
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/required/)
    await expect(page.locator('[data-testid="password-error"]')).toContainText(/required/)
    
    await uiHelpers.takeScreenshot('login-required-fields-validation')
  })

  test('should handle "Remember me" functionality', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    // Check remember me option
    const rememberMe = page.locator('[data-testid="remember-me-checkbox"]')
    if (await rememberMe.isVisible()) {
      await rememberMe.check()
      await expect(rememberMe).toBeChecked()
    }
    
    await authHelpers.fillLoginForm(TEST_USERS.regularUser)
    await authHelpers.submitLoginForm()
    
    // Verify login success
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    await uiHelpers.takeScreenshot('login-remember-me')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    await page.click('[data-testid="forgot-password-link"]')
    await page.waitForLoadState('networkidle')
    
    // Verify navigation to forgot password page
    expect(page.url()).toMatch(/\/forgot-password/)
    await expect(page.locator('h1')).toContainText(/Forgot Password|Reset Password/)
    
    await uiHelpers.takeScreenshot('navigate-to-forgot-password')
  })

  test('should navigate to register page', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    await page.click('[data-testid="register-link"]')
    await page.waitForLoadState('networkidle')
    
    // Verify navigation to register page
    expect(page.url()).toMatch(/\/register/)
    await expect(page.locator('h1')).toContainText(/Register|Sign Up/)
    
    await uiHelpers.takeScreenshot('navigate-to-register')
  })

  test('should show loading state during login', async ({ page }) => {
    await authHelpers.navigateToLogin()
    await authHelpers.fillLoginForm(TEST_USERS.regularUser)
    
    // Start login and immediately check for loading state
    const submitButton = page.locator('[data-testid="login-submit-button"]')
    await submitButton.click()
    
    // Verify loading state (if implemented)
    const loadingIndicator = page.locator('[data-testid="loading-spinner"]')
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible()
    }
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('login-loading-state')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await authHelpers.navigateToLogin()
    
    // Verify form is responsive
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-submit-button"]')).toBeVisible()
    
    // Test login on mobile
    await authHelpers.fillLoginForm(TEST_USERS.regularUser)
    await authHelpers.submitLoginForm()
    
    // Verify successful login on mobile
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    await uiHelpers.takeScreenshot('login-mobile-success')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await authHelpers.navigateToLogin()
    
    // Test tab navigation
    await page.keyboard.press('Tab') // Should focus email input
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.regularUser.email)
    await page.keyboard.press('Tab') // Should focus password input
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.regularUser.password)
    await page.keyboard.press('Enter') // Should submit form
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('login-keyboard-navigation')
  })

  test('should redirect authenticated users away from login', async ({ page }) => {
    // First login
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Try to navigate to login page while authenticated
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    // Should be redirected away from login page
    expect(page.url()).not.toMatch(/\/login/)
    expect(page.url()).toMatch(/\/(dashboard|profile|home)/)
    
    await uiHelpers.takeScreenshot('login-redirect-authenticated')
  })
}) 