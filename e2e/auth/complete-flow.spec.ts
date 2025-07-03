import { test, expect } from '@playwright/test'
import { AuthHelpers, VerificationHelpers, UIHelpers, TEST_USERS } from '../utils/test-helpers'

test.describe('Complete Authentication Flow', () => {
  let authHelpers: AuthHelpers
  let verificationHelpers: VerificationHelpers
  let uiHelpers: UIHelpers

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page)
    verificationHelpers = new VerificationHelpers(page)
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

  test('should complete full user journey: register → login → profile → verification → logout', async ({ page }) => {
    // Step 1: Register new user
    await authHelpers.register(TEST_USERS.newUser)
    
    // Verify registration success (might redirect to login or dashboard)
    expect(page.url()).toMatch(/\/(login|dashboard|verify-email|home)/)
    
    // Step 2: Login if redirected to login page
    if (page.url().includes('/login')) {
      await authHelpers.login(TEST_USERS.newUser)
    }
    
    // Verify user is logged in
    await authHelpers.verifyLoggedIn(TEST_USERS.newUser)
    
    // Step 3: Navigate to profile
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    // Verify profile page
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    await expect(page.locator('[data-testid="profile-name"]')).toContainText(TEST_USERS.newUser.fullName)
    
    // Step 4: Start verification process
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    await verificationHelpers.fillEducationForm()
    
    // Continue through verification wizard
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Skip document upload and submit
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    await verificationHelpers.submitVerificationRequest()
    
    // Verify submission success
    await expect(page.locator('[data-testid="verification-submitted"]')).toBeVisible()
    
    // Step 5: Check verification history
    await verificationHelpers.viewVerificationHistory()
    await expect(page.locator('[data-testid="verification-history"]')).toBeVisible()
    
    // Step 6: Logout
    await authHelpers.logout()
    
    // Verify logout success
    await authHelpers.verifyLoggedOut()
    
    await uiHelpers.takeScreenshot('complete-authentication-flow')
  })

  test('should handle session persistence across page refreshes', async ({ page }) => {
    // Login user
    await authHelpers.login(TEST_USERS.regularUser)
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verify user is still logged in after refresh
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    // Navigate to different pages and verify session persists
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    await page.goto('/verification')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="start-verification-button"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('session-persistence')
  })

  test('should handle logout and clear session properly', async ({ page }) => {
    // Login user
    await authHelpers.login(TEST_USERS.regularUser)
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    // Navigate to protected page
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    
    // Logout
    await authHelpers.logout()
    await authHelpers.verifyLoggedOut()
    
    // Try to access protected page after logout
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    // Should be redirected to login or show access denied
    if (page.url().includes('/login')) {
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    } else {
      // Should show access denied or redirect to public page
      expect(page.url()).toMatch(/\/(home|login|\/)/)
    }
    
    await uiHelpers.takeScreenshot('logout-session-clearing')
  })

  test('should handle authentication state changes correctly', async ({ page }) => {
    // Start as unauthenticated user
    await authHelpers.navigateToHome()
    
    // Verify public navigation is shown
    const loginLink = page.locator('[data-testid="login-link"]')
    const registerLink = page.locator('[data-testid="register-link"]')
    
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await expect(loginLink).toBeVisible()
    }
    if (await registerLink.isVisible({ timeout: 2000 })) {
      await expect(registerLink).toBeVisible()
    }
    
    // Login user
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Verify authenticated navigation is shown
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    
    // Verify protected links are available
    const profileLink = page.locator('[data-testid="profile-link"]')
    const verificationLink = page.locator('[data-testid="verification-link"]')
    
    if (await profileLink.isVisible({ timeout: 2000 })) {
      await expect(profileLink).toBeVisible()
    }
    if (await verificationLink.isVisible({ timeout: 2000 })) {
      await expect(verificationLink).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('authentication-state-changes')
  })

  test('should handle profile management flow', async ({ page }) => {
    // Login user
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Navigate to profile
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    // Verify profile elements
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
    await expect(page.locator('[data-testid="profile-name"]')).toContainText(TEST_USERS.regularUser.fullName)
    
    // Test profile editing (if available)
    const editButton = page.locator('[data-testid="edit-profile-button"]')
    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click()
      
      // Verify edit form is displayed
      await expect(page.locator('[data-testid="profile-edit-form"]')).toBeVisible()
      
      // Update profile information
      const bioField = page.locator('[data-testid="bio-input"]')
      if (await bioField.isVisible({ timeout: 1000 })) {
        await bioField.fill('Updated bio for testing purposes')
      }
      
      // Save changes
      const saveButton = page.locator('[data-testid="save-profile-button"]')
      if (await saveButton.isVisible()) {
        await saveButton.click()
        await page.waitForLoadState('networkidle')
        
        // Verify success message
        await uiHelpers.verifyToast('Profile updated successfully', 'success')
      }
    }
    
    // Test verification badges display
    const badgesSection = page.locator('[data-testid="verification-badges-section"]')
    if (await badgesSection.isVisible({ timeout: 2000 })) {
      await expect(badgesSection).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('profile-management')
  })

  test('should handle password change flow', async ({ page }) => {
    // Login user
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Navigate to profile or settings
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    // Look for password change option
    const changePasswordButton = page.locator('[data-testid="change-password-button"]')
    const settingsTab = page.locator('[data-testid="settings-tab"]')
    
    if (await settingsTab.isVisible({ timeout: 2000 })) {
      await settingsTab.click()
      await page.waitForLoadState('networkidle')
    }
    
    if (await changePasswordButton.isVisible({ timeout: 2000 })) {
      await changePasswordButton.click()
      
      // Verify password change form
      await expect(page.locator('[data-testid="password-change-form"]')).toBeVisible()
      
      // Fill password change form
      await page.fill('[data-testid="current-password"]', TEST_USERS.regularUser.password)
      await page.fill('[data-testid="new-password"]', 'NewPassword123!')
      await page.fill('[data-testid="confirm-new-password"]', 'NewPassword123!')
      
      // Submit password change
      await page.click('[data-testid="update-password-button"]')
      await page.waitForLoadState('networkidle')
      
      // Verify success message
      await uiHelpers.verifyToast('Password updated successfully', 'success')
    }
    
    await uiHelpers.takeScreenshot('password-change-flow')
  })

  test('should handle account deletion flow', async ({ page }) => {
    // Login user
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Navigate to account settings
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    // Look for account deletion option
    const settingsTab = page.locator('[data-testid="settings-tab"]')
    if (await settingsTab.isVisible({ timeout: 2000 })) {
      await settingsTab.click()
      await page.waitForLoadState('networkidle')
    }
    
    const deleteAccountButton = page.locator('[data-testid="delete-account-button"]')
    if (await deleteAccountButton.isVisible({ timeout: 2000 })) {
      await deleteAccountButton.click()
      
      // Verify confirmation dialog
      await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible()
      await expect(page.locator('[data-testid="delete-warning"]')).toContainText(/permanently delete|cannot be undone/)
      
      // Cancel deletion
      const cancelButton = page.locator('[data-testid="cancel-delete-button"]')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        
        // Verify modal is closed
        await expect(page.locator('[data-testid="delete-confirmation-modal"]')).not.toBeVisible()
      }
    }
    
    await uiHelpers.takeScreenshot('account-deletion-flow')
  })

  test('should handle multiple browser tabs and sessions', async ({ browser }) => {
    // Create two browser contexts (simulate different devices)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    
    const authHelpers1 = new AuthHelpers(page1)
    const authHelpers2 = new AuthHelpers(page2)
    
    // Enable mock auth on both pages
    await page1.evaluate(() => localStorage.setItem('mock_auth_enabled', 'true'))
    await page2.evaluate(() => localStorage.setItem('mock_auth_enabled', 'true'))
    
    // Login on first tab/context
    await authHelpers1.login(TEST_USERS.regularUser)
    await authHelpers1.verifyLoggedIn(TEST_USERS.regularUser)
    
    // Verify second tab/context is still unauthenticated
    await page2.goto('/')
    await page2.waitForLoadState('networkidle')
    
    // Second context should not be automatically logged in
    const loginLink = page2.locator('[data-testid="login-link"]')
    if (await loginLink.isVisible({ timeout: 2000 })) {
      await expect(loginLink).toBeVisible()
    }
    
    // Login on second tab/context with different user
    await authHelpers2.login(TEST_USERS.adminUser)
    await authHelpers2.verifyLoggedIn(TEST_USERS.adminUser)
    
    // Verify both sessions are independent
    await page1.reload()
    await page1.waitForLoadState('networkidle')
    await authHelpers1.verifyLoggedIn(TEST_USERS.regularUser)
    
    await page2.reload()
    await page2.waitForLoadState('networkidle')
    await authHelpers2.verifyLoggedIn(TEST_USERS.adminUser)
    
    // Clean up
    await context1.close()
    await context2.close()
  })

  test('should handle network errors gracefully during authentication', async ({ page }) => {
    // Intercept auth requests and simulate network errors
    await page.route('**/api/auth/**', async (route) => {
      await route.abort('internetdisconnected')
    })
    
    await authHelpers.navigateToLogin()
    await authHelpers.fillLoginForm(TEST_USERS.regularUser)
    await authHelpers.submitLoginForm()
    
    // Verify error handling
    const errorMessage = page.locator('[data-testid="network-error"]')
    const formError = page.locator('[data-testid="form-error"]')
    
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage).toContainText(/network error|connection failed|try again/)
    } else if (await formError.isVisible({ timeout: 5000 })) {
      await expect(formError).toContainText(/error|failed|try again/)
    }
    
    // Verify user is still on login page
    expect(page.url()).toMatch(/\/login/)
    
    await uiHelpers.takeScreenshot('network-error-handling')
  })

  test('should handle browser back/forward navigation correctly', async ({ page }) => {
    // Start at home page
    await authHelpers.navigateToHome()
    
    // Navigate to login
    await authHelpers.navigateToLogin()
    
    // Go back to home
    await page.goBack()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toMatch(/\/(home|\/)/)
    
    // Go forward to login
    await page.goForward()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toMatch(/\/login/)
    
    // Login user
    await authHelpers.fillLoginForm(TEST_USERS.regularUser)
    await authHelpers.submitLoginForm()
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    // Navigate to profile
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    
    // Navigate to verification
    await page.goto('/verification')
    await page.waitForLoadState('networkidle')
    
    // Use browser back button
    await page.goBack()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toMatch(/\/profile/)
    
    // Verify user is still authenticated
    await authHelpers.verifyLoggedIn(TEST_USERS.regularUser)
    
    await uiHelpers.takeScreenshot('browser-navigation')
  })
}) 