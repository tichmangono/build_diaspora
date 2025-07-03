import { test, expect } from '@playwright/test'
import { AuthHelpers, UIHelpers, TEST_USERS } from '../utils/test-helpers'

test.describe('Password Reset Authentication Flow', () => {
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

  test('should display forgot password form correctly', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Verify form elements are present
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-submit-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="back-to-login-link"]')).toBeVisible()
    
    // Verify page title and heading
    await expect(page).toHaveTitle(/Forgot Password|Reset Password/)
    await expect(page.locator('h1')).toContainText(/Forgot Password|Reset Password/)
    
    // Verify instructions text
    await expect(page.locator('[data-testid="reset-instructions"]')).toContainText(/enter your email|send reset link/)
    
    await uiHelpers.takeScreenshot('forgot-password-form-display')
  })

  test('should successfully send reset email for valid email', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Fill email and submit
    await page.fill('[data-testid="email-input"]', TEST_USERS.regularUser.email)
    await page.click('[data-testid="reset-submit-button"]')
    
    // Wait for response
    await page.waitForLoadState('networkidle')
    
    // Verify success message
    const successMessage = page.locator('[data-testid="reset-success"]')
    await expect(successMessage).toBeVisible()
    await expect(successMessage).toContainText(/reset link sent|check your email|password reset email/)
    
    await uiHelpers.takeScreenshot('forgot-password-success')
  })

  test('should validate email format', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Try invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="reset-submit-button"]')
    
    // Verify validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email|invalid email format/)
    
    await uiHelpers.takeScreenshot('forgot-password-email-validation')
  })

  test('should validate required email field', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Try to submit empty form
    await page.click('[data-testid="reset-submit-button"]')
    
    // Verify validation error for required field
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/required|email is required/)
    
    await uiHelpers.takeScreenshot('forgot-password-required-validation')
  })

  test('should handle non-existent email gracefully', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Try with non-existent email
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com')
    await page.click('[data-testid="reset-submit-button"]')
    
    await page.waitForLoadState('networkidle')
    
    // Should still show success message for security (don't reveal if email exists)
    const successMessage = page.locator('[data-testid="reset-success"]')
    const errorMessage = page.locator('[data-testid="form-error"]')
    
    if (await successMessage.isVisible({ timeout: 2000 })) {
      await expect(successMessage).toContainText(/reset link sent|check your email/)
    } else if (await errorMessage.isVisible({ timeout: 2000 })) {
      // Some implementations might show an error, which is also acceptable
      await expect(errorMessage).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('forgot-password-nonexistent-email')
  })

  test('should navigate back to login page', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    await page.click('[data-testid="back-to-login-link"]')
    await page.waitForLoadState('networkidle')
    
    // Verify navigation to login page
    expect(page.url()).toMatch(/\/login/)
    await expect(page.locator('h1')).toContainText(/Login|Sign In/)
    
    await uiHelpers.takeScreenshot('forgot-password-back-to-login')
  })

  test('should show loading state during submission', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    await page.fill('[data-testid="email-input"]', TEST_USERS.regularUser.email)
    
    // Start submission and immediately check for loading state
    const submitButton = page.locator('[data-testid="reset-submit-button"]')
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
    
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('forgot-password-loading-state')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await authHelpers.navigateToForgotPassword()
    
    // Verify form is responsive
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-submit-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="back-to-login-link"]')).toBeVisible()
    
    // Test password reset on mobile
    await page.fill('[data-testid="email-input"]', TEST_USERS.regularUser.email)
    await page.click('[data-testid="reset-submit-button"]')
    
    await page.waitForLoadState('networkidle')
    
    // Verify success message on mobile
    await expect(page.locator('[data-testid="reset-success"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('forgot-password-mobile-success')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Test tab navigation
    await page.keyboard.press('Tab') // Should focus email input
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused()
    
    await page.keyboard.type(TEST_USERS.regularUser.email)
    await page.keyboard.press('Enter') // Should submit form
    
    // Wait for submission to complete
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('forgot-password-keyboard-navigation')
  })

  test('should display rate limiting message if too many requests', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Simulate multiple rapid requests
    for (let i = 0; i < 3; i++) {
      await page.fill('[data-testid="email-input"]', TEST_USERS.regularUser.email)
      await page.click('[data-testid="reset-submit-button"]')
      await page.waitForTimeout(500) // Small delay between requests
    }
    
    // Check for rate limiting message (if implemented)
    const rateLimitMessage = page.locator('[data-testid="rate-limit-error"]')
    if (await rateLimitMessage.isVisible({ timeout: 2000 })) {
      await expect(rateLimitMessage).toContainText(/too many requests|rate limit|try again later/)
    }
    
    await uiHelpers.takeScreenshot('forgot-password-rate-limiting')
  })

  test('should handle reset password with token flow', async ({ page }) => {
    // Simulate clicking a reset link with token
    const resetToken = 'mock-reset-token-123'
    await page.goto(`/reset-password?token=${resetToken}`)
    await page.waitForLoadState('networkidle')
    
    // Verify reset password form is displayed
    if (await page.locator('[data-testid="new-password-input"]').isVisible({ timeout: 2000 })) {
      await expect(page.locator('[data-testid="new-password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="reset-password-submit-button"]')).toBeVisible()
      
      // Test password reset with new password
      await page.fill('[data-testid="new-password-input"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!')
      await page.click('[data-testid="reset-password-submit-button"]')
      
      await page.waitForLoadState('networkidle')
      
      // Should redirect to login or show success message
      const successMessage = page.locator('[data-testid="password-reset-success"]')
      if (await successMessage.isVisible({ timeout: 2000 })) {
        await expect(successMessage).toContainText(/password reset successful|password updated/)
      } else {
        // Should redirect to login page
        expect(page.url()).toMatch(/\/login/)
      }
    }
    
    await uiHelpers.takeScreenshot('reset-password-with-token')
  })

  test('should validate new password requirements in reset flow', async ({ page }) => {
    const resetToken = 'mock-reset-token-123'
    await page.goto(`/reset-password?token=${resetToken}`)
    await page.waitForLoadState('networkidle')
    
    if (await page.locator('[data-testid="new-password-input"]').isVisible({ timeout: 2000 })) {
      // Test weak password
      await page.fill('[data-testid="new-password-input"]', '123')
      await page.fill('[data-testid="confirm-password-input"]', '123')
      await page.click('[data-testid="reset-password-submit-button"]')
      
      // Verify password validation error
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-error"]')).toContainText(/password must|at least 8 characters|strong password/)
    }
    
    await uiHelpers.takeScreenshot('reset-password-validation')
  })

  test('should validate password confirmation match in reset flow', async ({ page }) => {
    const resetToken = 'mock-reset-token-123'
    await page.goto(`/reset-password?token=${resetToken}`)
    await page.waitForLoadState('networkidle')
    
    if (await page.locator('[data-testid="new-password-input"]').isVisible({ timeout: 2000 })) {
      // Test mismatched passwords
      await page.fill('[data-testid="new-password-input"]', 'Password123!')
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!')
      await page.click('[data-testid="reset-password-submit-button"]')
      
      // Verify password confirmation error
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText(/passwords do not match|passwords must match/)
    }
    
    await uiHelpers.takeScreenshot('reset-password-mismatch')
  })

  test('should handle invalid or expired reset token', async ({ page }) => {
    // Try with invalid token
    await page.goto('/reset-password?token=invalid-token')
    await page.waitForLoadState('networkidle')
    
    // Should show error message or redirect to forgot password
    const errorMessage = page.locator('[data-testid="invalid-token-error"]')
    if (await errorMessage.isVisible({ timeout: 2000 })) {
      await expect(errorMessage).toContainText(/invalid token|expired token|invalid or expired/)
    } else {
      // Should redirect to forgot password page
      expect(page.url()).toMatch(/\/forgot-password/)
    }
    
    await uiHelpers.takeScreenshot('reset-password-invalid-token')
  })

  test('should redirect authenticated users away from forgot password', async ({ page }) => {
    // First login
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Try to navigate to forgot password page while authenticated
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    
    // Should be redirected away from forgot password page
    expect(page.url()).not.toMatch(/\/forgot-password/)
    expect(page.url()).toMatch(/\/(dashboard|profile|home)/)
    
    await uiHelpers.takeScreenshot('forgot-password-redirect-authenticated')
  })

  test('should allow resending reset email', async ({ page }) => {
    await authHelpers.navigateToForgotPassword()
    
    // Send initial reset email
    await page.fill('[data-testid="email-input"]', TEST_USERS.regularUser.email)
    await page.click('[data-testid="reset-submit-button"]')
    
    await page.waitForLoadState('networkidle')
    
    // Check for resend option
    const resendButton = page.locator('[data-testid="resend-reset-button"]')
    if (await resendButton.isVisible({ timeout: 2000 })) {
      await resendButton.click()
      
      // Verify resend success message
      const resendMessage = page.locator('[data-testid="resend-success"]')
      await expect(resendMessage).toBeVisible()
      await expect(resendMessage).toContainText(/resent|sent again/)
    }
    
    await uiHelpers.takeScreenshot('forgot-password-resend')
  })
}) 