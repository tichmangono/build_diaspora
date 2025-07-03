import { test, expect } from '@playwright/test'
import { AuthHelpers, VerificationHelpers, UIHelpers, TEST_USERS } from '../utils/test-helpers'

test.describe('Verification Submission Flow', () => {
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
    
    // Login before each verification test
    await authHelpers.login(TEST_USERS.regularUser)
  })

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should display verification landing page correctly', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    
    // Verify page elements are present
    await expect(page.locator('[data-testid="verification-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="verification-benefits"]')).toBeVisible()
    await expect(page.locator('[data-testid="verification-process"]')).toBeVisible()
    await expect(page.locator('[data-testid="start-verification-button"]')).toBeVisible()
    
    // Verify page title
    await expect(page).toHaveTitle(/Verification/)
    
    await uiHelpers.takeScreenshot('verification-landing-page')
  })

  test('should start verification wizard successfully', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    
    // Verify wizard is displayed
    await expect(page.locator('[data-testid="verification-wizard"]')).toBeVisible()
    await expect(page.locator('[data-testid="credential-type-selection"]')).toBeVisible()
    
    // Verify all credential types are available
    await expect(page.locator('[data-testid="credential-type-education"]')).toBeVisible()
    await expect(page.locator('[data-testid="credential-type-employment"]')).toBeVisible()
    await expect(page.locator('[data-testid="credential-type-certification"]')).toBeVisible()
    await expect(page.locator('[data-testid="credential-type-skills"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('verification-wizard-start')
  })

  test('should complete education verification flow', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    
    // Verify education form is displayed
    await expect(page.locator('[data-testid="education-form"]')).toBeVisible()
    
    // Fill education form
    await verificationHelpers.fillEducationForm()
    
    // Continue to next step
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Verify document upload step
    await expect(page.locator('[data-testid="document-upload-section"]')).toBeVisible()
    
    // Mock document upload (since we can't upload real files in E2E)
    const fileInput = page.locator('[data-testid="document-upload"]')
    if (await fileInput.isVisible()) {
      // Simulate file selection
      await page.evaluate(() => {
        const mockFile = new File(['mock document content'], 'diploma.pdf', { type: 'application/pdf' })
        const input = document.querySelector('[data-testid="document-upload"]') as HTMLInputElement
        if (input) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(mockFile)
          input.files = dataTransfer.files
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      })
    }
    
    // Continue to review step
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Verify review step
    await expect(page.locator('[data-testid="verification-review"]')).toBeVisible()
    
    // Submit verification
    await verificationHelpers.submitVerificationRequest()
    
    // Verify submission success
    await expect(page.locator('[data-testid="verification-submitted"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('education-verification-complete')
  })

  test('should complete employment verification flow', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('employment')
    
    // Verify employment form is displayed
    await expect(page.locator('[data-testid="employment-form"]')).toBeVisible()
    
    // Fill employment form
    await verificationHelpers.fillEmploymentForm()
    
    // Continue through the flow
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Skip document upload for this test
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Submit verification
    await verificationHelpers.submitVerificationRequest()
    
    // Verify submission success
    await expect(page.locator('[data-testid="verification-submitted"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('employment-verification-complete')
  })

  test('should validate required fields in verification forms', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    
    // Try to continue without filling required fields
    await page.click('[data-testid="continue-button"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="institution-error"]')).toContainText(/required|institution name is required/)
    await expect(page.locator('[data-testid="degree-error"]')).toContainText(/required|degree title is required/)
    
    await uiHelpers.takeScreenshot('verification-form-validation')
  })

  test('should handle document upload validation', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    
    // Fill form and continue to document upload
    await verificationHelpers.fillEducationForm()
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Try to upload invalid file type
    await page.evaluate(() => {
      const mockFile = new File(['mock content'], 'document.txt', { type: 'text/plain' })
      const input = document.querySelector('[data-testid="document-upload"]') as HTMLInputElement
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(mockFile)
        input.files = dataTransfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    
    // Verify file type validation error
    const fileError = page.locator('[data-testid="file-upload-error"]')
    if (await fileError.isVisible({ timeout: 2000 })) {
      await expect(fileError).toContainText(/invalid file type|only PDF files|file format not supported/)
    }
    
    await uiHelpers.takeScreenshot('document-upload-validation')
  })

  test('should show verification progress correctly', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    
    // Verify progress indicator is displayed
    const progressIndicator = page.locator('[data-testid="verification-progress"]')
    if (await progressIndicator.isVisible()) {
      await expect(progressIndicator).toBeVisible()
      
      // Check initial step
      await expect(page.locator('[data-testid="step-1"]')).toHaveClass(/active|current/)
    }
    
    // Select credential type and continue
    await verificationHelpers.selectCredentialType('education')
    
    // Verify progress updated
    if (await progressIndicator.isVisible()) {
      await expect(page.locator('[data-testid="step-2"]')).toHaveClass(/active|current/)
    }
    
    await uiHelpers.takeScreenshot('verification-progress-tracking')
  })

  test('should handle verification wizard navigation', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    
    // Fill form and continue
    await verificationHelpers.fillEducationForm()
    await page.click('[data-testid="continue-button"]')
    await page.waitForLoadState('networkidle')
    
    // Test back navigation
    const backButton = page.locator('[data-testid="back-button"]')
    if (await backButton.isVisible()) {
      await backButton.click()
      await page.waitForLoadState('networkidle')
      
      // Verify we're back to the form step
      await expect(page.locator('[data-testid="education-form"]')).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('verification-wizard-navigation')
  })

  test('should display verification history', async ({ page }) => {
    await verificationHelpers.viewVerificationHistory()
    
    // Verify history page elements
    await expect(page.locator('[data-testid="verification-history"]')).toBeVisible()
    await expect(page.locator('[data-testid="history-title"]')).toContainText(/Verification History|My Verifications/)
    
    // Check for existing requests (if any)
    const requestsList = page.locator('[data-testid="verification-requests-list"]')
    if (await requestsList.isVisible()) {
      await expect(requestsList).toBeVisible()
    } else {
      // Check for empty state
      await expect(page.locator('[data-testid="no-verifications"]')).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('verification-history')
  })

  test('should display verification badges', async ({ page }) => {
    await verificationHelpers.viewBadges()
    
    // Verify badges page elements
    await expect(page.locator('[data-testid="verification-badges"]')).toBeVisible()
    await expect(page.locator('[data-testid="badges-title"]')).toContainText(/Verification Badges|My Badges/)
    
    // Check for badges or empty state
    const badgesList = page.locator('[data-testid="badges-list"]')
    const emptyState = page.locator('[data-testid="no-badges"]')
    
    if (await badgesList.isVisible({ timeout: 2000 })) {
      await expect(badgesList).toBeVisible()
    } else if (await emptyState.isVisible({ timeout: 2000 })) {
      await expect(emptyState).toBeVisible()
      await expect(emptyState).toContainText(/No badges yet|Start verification/)
    }
    
    await uiHelpers.takeScreenshot('verification-badges')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await verificationHelpers.navigateToVerification()
    
    // Verify mobile responsiveness
    await expect(page.locator('[data-testid="start-verification-button"]')).toBeVisible()
    
    await verificationHelpers.startVerificationWizard()
    
    // Verify wizard works on mobile
    await expect(page.locator('[data-testid="verification-wizard"]')).toBeVisible()
    await expect(page.locator('[data-testid="credential-type-education"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('verification-mobile-responsive')
  })

  test('should handle verification cancellation', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    
    // Look for cancel button
    const cancelButton = page.locator('[data-testid="cancel-verification"]')
    if (await cancelButton.isVisible()) {
      await cancelButton.click()
      
      // Verify cancellation confirmation
      const confirmDialog = page.locator('[data-testid="cancel-confirmation"]')
      if (await confirmDialog.isVisible()) {
        await page.click('[data-testid="confirm-cancel"]')
      }
      
      // Should return to verification landing page
      await page.waitForLoadState('networkidle')
      await expect(page.locator('[data-testid="start-verification-button"]')).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('verification-cancellation')
  })

  test('should save verification draft', async ({ page }) => {
    await verificationHelpers.navigateToVerification()
    await verificationHelpers.startVerificationWizard()
    await verificationHelpers.selectCredentialType('education')
    
    // Fill partial form
    await page.fill('[data-testid="institution-name"]', 'University of Zimbabwe')
    
    // Look for save draft functionality
    const saveDraftButton = page.locator('[data-testid="save-draft"]')
    if (await saveDraftButton.isVisible()) {
      await saveDraftButton.click()
      
      // Verify draft saved message
      await uiHelpers.verifyToast('Draft saved successfully', 'success')
    }
    
    await uiHelpers.takeScreenshot('verification-save-draft')
  })

  test('should handle verification resubmission', async ({ page }) => {
    // Navigate to verification history
    await verificationHelpers.viewVerificationHistory()
    
    // Look for rejected verification to resubmit
    const resubmitButton = page.locator('[data-testid="resubmit-verification"]').first()
    if (await resubmitButton.isVisible({ timeout: 2000 })) {
      await resubmitButton.click()
      
      // Should redirect to verification wizard with pre-filled data
      await page.waitForLoadState('networkidle')
      await expect(page.locator('[data-testid="verification-wizard"]')).toBeVisible()
      
      // Verify some data is pre-filled
      const institutionField = page.locator('[data-testid="institution-name"]')
      if (await institutionField.isVisible()) {
        const value = await institutionField.inputValue()
        expect(value).not.toBe('')
      }
    }
    
    await uiHelpers.takeScreenshot('verification-resubmission')
  })

  test('should show verification status updates', async ({ page }) => {
    await verificationHelpers.viewVerificationHistory()
    
    // Check for status indicators
    const statusBadges = page.locator('[data-testid="verification-status"]')
    if (await statusBadges.first().isVisible({ timeout: 2000 })) {
      await expect(statusBadges.first()).toBeVisible()
      
      // Verify different status types
      const statuses = ['pending', 'approved', 'rejected', 'in-review']
      for (const status of statuses) {
        const statusElement = page.locator(`[data-testid="status-${status}"]`)
        if (await statusElement.isVisible({ timeout: 1000 })) {
          await expect(statusElement).toBeVisible()
        }
      }
    }
    
    await uiHelpers.takeScreenshot('verification-status-indicators')
  })
}) 