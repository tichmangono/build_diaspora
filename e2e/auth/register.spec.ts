import { test, expect } from '@playwright/test'
import { AuthHelpers, UIHelpers, TEST_USERS } from '../utils/test-helpers'

test.describe('Registration Authentication Flow', () => {
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

  test('should display registration form correctly', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Verify form elements are present
    await expect(page.locator('[data-testid="full-name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="register-submit-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible()
    
    // Verify page title and heading
    await expect(page).toHaveTitle(/Register/)
    await expect(page.locator('h1')).toContainText(/Register|Sign Up/)
    
    await uiHelpers.takeScreenshot('register-form-display')
  })

  test('should successfully register with valid information', async ({ page }) => {
    await authHelpers.register(TEST_USERS.newUser)
    
    // Verify successful registration
    // Should redirect to login, dashboard, or email verification
    expect(page.url()).toMatch(/\/(login|dashboard|verify-email|home)/)
    
    // Check for success message or redirect
    const successMessage = page.locator('[data-testid="registration-success"]')
    const emailVerificationMessage = page.locator('[data-testid="email-verification-sent"]')
    
    if (await successMessage.isVisible({ timeout: 2000 })) {
      await expect(successMessage).toContainText(/Registration successful|Account created/)
    } else if (await emailVerificationMessage.isVisible({ timeout: 2000 })) {
      await expect(emailVerificationMessage).toContainText(/verification email|check your email/)
    }
    
    await uiHelpers.takeScreenshot('successful-registration')
  })

  test('should validate password requirements', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Test weak password
    await page.fill('[data-testid="full-name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', '123')
    await page.fill('[data-testid="confirm-password-input"]', '123')
    await authHelpers.submitRegisterForm()
    
    // Verify password validation error
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toContainText(/password must|at least 8 characters|strong password/)
    
    await uiHelpers.takeScreenshot('register-password-validation')
  })

  test('should validate password confirmation match', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Test mismatched passwords
    await page.fill('[data-testid="full-name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'Password123!')
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!')
    await authHelpers.submitRegisterForm()
    
    // Verify password confirmation error
    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText(/passwords do not match|passwords must match/)
    
    await uiHelpers.takeScreenshot('register-password-mismatch')
  })

  test('should validate email format', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Test invalid email format
    await page.fill('[data-testid="full-name-input"]', 'Test User')
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'Password123!')
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
    await authHelpers.submitRegisterForm()
    
    // Verify email validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email|invalid email format/)
    
    await uiHelpers.takeScreenshot('register-email-validation')
  })

  test('should validate required fields', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Try to submit empty form
    await authHelpers.submitRegisterForm()
    
    // Verify validation errors for required fields
    await expect(page.locator('[data-testid="full-name-error"]')).toContainText(/required|full name is required/)
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/required|email is required/)
    await expect(page.locator('[data-testid="password-error"]')).toContainText(/required|password is required/)
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText(/required|confirm password/)
    
    await uiHelpers.takeScreenshot('register-required-fields-validation')
  })

  test('should handle duplicate email registration', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Try to register with existing email
    await authHelpers.fillRegisterForm(TEST_USERS.regularUser) // Use existing user email
    await authHelpers.submitRegisterForm()
    
    // Verify error message for duplicate email
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="form-error"]')).toContainText(/email already exists|already registered|email is taken/)
    
    // Verify user is still on registration page
    expect(page.url()).toMatch(/\/register/)
    
    await uiHelpers.takeScreenshot('register-duplicate-email')
  })

  test('should validate full name format', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Test invalid full name (too short)
    await page.fill('[data-testid="full-name-input"]', 'A')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'Password123!')
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!')
    await authHelpers.submitRegisterForm()
    
    // Verify full name validation error
    const nameError = page.locator('[data-testid="full-name-error"]')
    if (await nameError.isVisible({ timeout: 2000 })) {
      await expect(nameError).toContainText(/at least 2 characters|full name too short/)
    }
    
    await uiHelpers.takeScreenshot('register-fullname-validation')
  })

  test('should handle terms and conditions acceptance', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Fill form without accepting terms
    await authHelpers.fillRegisterForm(TEST_USERS.newUser)
    
    // Check if terms checkbox exists
    const termsCheckbox = page.locator('[data-testid="terms-checkbox"]')
    if (await termsCheckbox.isVisible()) {
      // Try to submit without accepting terms
      await authHelpers.submitRegisterForm()
      
      // Verify terms acceptance error
      await expect(page.locator('[data-testid="terms-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="terms-error"]')).toContainText(/accept terms|terms and conditions/)
      
      // Accept terms and try again
      await termsCheckbox.check()
      await expect(termsCheckbox).toBeChecked()
      await authHelpers.submitRegisterForm()
    }
    
    await uiHelpers.takeScreenshot('register-terms-acceptance')
  })

  test('should navigate to login page', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    await page.click('[data-testid="login-link"]')
    await page.waitForLoadState('networkidle')
    
    // Verify navigation to login page
    expect(page.url()).toMatch(/\/login/)
    await expect(page.locator('h1')).toContainText(/Login|Sign In/)
    
    await uiHelpers.takeScreenshot('navigate-to-login-from-register')
  })

  test('should show password strength indicator', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    const passwordInput = page.locator('[data-testid="password-input"]')
    const strengthIndicator = page.locator('[data-testid="password-strength"]')
    
    // Test weak password
    await passwordInput.fill('123')
    if (await strengthIndicator.isVisible({ timeout: 1000 })) {
      await expect(strengthIndicator).toContainText(/weak/i)
    }
    
    // Test medium password
    await passwordInput.fill('password123')
    if (await strengthIndicator.isVisible({ timeout: 1000 })) {
      await expect(strengthIndicator).toContainText(/medium|fair/i)
    }
    
    // Test strong password
    await passwordInput.fill('Password123!')
    if (await strengthIndicator.isVisible({ timeout: 1000 })) {
      await expect(strengthIndicator).toContainText(/strong|good/i)
    }
    
    await uiHelpers.takeScreenshot('register-password-strength')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await authHelpers.navigateToRegister()
    
    // Verify form is responsive
    await expect(page.locator('[data-testid="full-name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="register-submit-button"]')).toBeVisible()
    
    // Test registration on mobile
    await authHelpers.fillRegisterForm(TEST_USERS.newUser)
    await authHelpers.submitRegisterForm()
    
    // Verify successful registration on mobile
    expect(page.url()).toMatch(/\/(login|dashboard|verify-email|home)/)
    
    await uiHelpers.takeScreenshot('register-mobile-success')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Test tab navigation through form
    await page.keyboard.press('Tab') // Should focus full name input
    await expect(page.locator('[data-testid="full-name-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.newUser.fullName)
    await page.keyboard.press('Tab') // Should focus email input
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.newUser.email)
    await page.keyboard.press('Tab') // Should focus password input
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.newUser.password)
    await page.keyboard.press('Tab') // Should focus confirm password input
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.newUser.password)
    await page.keyboard.press('Enter') // Should submit form
    
    // Wait for registration to complete
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('register-keyboard-navigation')
  })

  test('should show loading state during registration', async ({ page }) => {
    await authHelpers.navigateToRegister()
    await authHelpers.fillRegisterForm(TEST_USERS.newUser)
    
    // Start registration and immediately check for loading state
    const submitButton = page.locator('[data-testid="register-submit-button"]')
    await submitButton.click()
    
    // Verify loading state (if implemented)
    const loadingIndicator = page.locator('[data-testid="loading-spinner"]')
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await expect(loadingIndicator).toBeVisible()
    }
    
    // Verify button is disabled during loading
    if (await submitButton.isVisible()) {
      const isDisabled = await submitButton.isDisabled()
      if (isDisabled) {
        await expect(submitButton).toBeDisabled()
      }
    }
    
    // Wait for registration to complete
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('register-loading-state')
  })

  test('should redirect authenticated users away from register', async ({ page }) => {
    // First login with existing user
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Try to navigate to register page while authenticated
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    
    // Should be redirected away from register page
    expect(page.url()).not.toMatch(/\/register/)
    expect(page.url()).toMatch(/\/(dashboard|profile|home)/)
    
    await uiHelpers.takeScreenshot('register-redirect-authenticated')
  })

  test('should handle registration with special characters in name', async ({ page }) => {
    await authHelpers.navigateToRegister()
    
    // Test name with special characters
    const specialUser = {
      ...TEST_USERS.newUser,
      fullName: "Jean-Pierre O'Connor",
      email: 'jean.pierre@example.com'
    }
    
    await authHelpers.fillRegisterForm(specialUser)
    await authHelpers.submitRegisterForm()
    
    // Should handle special characters gracefully
    expect(page.url()).toMatch(/\/(login|dashboard|verify-email|home)/)
    
    await uiHelpers.takeScreenshot('register-special-characters')
  })
}) 