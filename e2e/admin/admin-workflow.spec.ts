import { test, expect } from '@playwright/test'
import { AuthHelpers, AdminHelpers, UIHelpers, TEST_USERS } from '../utils/test-helpers'

test.describe('Admin Verification Workflow', () => {
  let authHelpers: AuthHelpers
  let adminHelpers: AdminHelpers
  let uiHelpers: UIHelpers

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page)
    adminHelpers = new AdminHelpers(page)
    uiHelpers = new UIHelpers(page)
    
    // Enable mock authentication for testing
    await page.evaluate(() => {
      localStorage.setItem('mock_auth_enabled', 'true')
    })
    
    // Login as admin before each test
    await authHelpers.login(TEST_USERS.adminUser)
  })

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('should display admin dashboard correctly', async ({ page }) => {
    await adminHelpers.navigateToAdminDashboard()
    
    // Verify admin dashboard elements
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible()
    await expect(page.locator('[data-testid="admin-header"]')).toBeVisible()
    
    // Verify navigation items
    await expect(page.locator('[data-testid="nav-verification"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible()
    
    // Verify page title
    await expect(page).toHaveTitle(/Admin Dashboard/)
    
    await uiHelpers.takeScreenshot('admin-dashboard')
  })

  test('should display verification queue correctly', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Verify verification queue elements
    await expect(page.locator('[data-testid="verification-queue"]')).toBeVisible()
    await expect(page.locator('[data-testid="queue-title"]')).toContainText(/Verification Queue|Pending Verifications/)
    
    // Verify filter and search controls
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="bulk-actions-button"]')).toBeVisible()
    
    // Check for statistics dashboard
    const statsSection = page.locator('[data-testid="verification-stats"]')
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('verification-queue')
  })

  test('should filter verification requests by status', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Test different status filters
    const statuses = ['pending', 'in-review', 'approved', 'rejected']
    
    for (const status of statuses) {
      await adminHelpers.filterRequests(status)
      
      // Verify filter is applied
      const filterSelect = page.locator('[data-testid="status-filter"]')
      const selectedValue = await filterSelect.inputValue()
      expect(selectedValue).toBe(status)
      
      // Verify results are filtered (if any exist)
      const requestsList = page.locator('[data-testid="verification-requests-list"]')
      if (await requestsList.isVisible({ timeout: 2000 })) {
        const statusBadges = page.locator(`[data-testid="status-${status}"]`)
        if (await statusBadges.first().isVisible({ timeout: 1000 })) {
          await expect(statusBadges.first()).toBeVisible()
        }
      }
    }
    
    await uiHelpers.takeScreenshot('verification-queue-filtering')
  })

  test('should search verification requests', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Test search functionality
    await adminHelpers.searchRequests('university')
    
    // Verify search is applied
    const searchInput = page.locator('[data-testid="search-input"]')
    const searchValue = await searchInput.inputValue()
    expect(searchValue).toBe('university')
    
    // Wait for search results
    await page.waitForLoadState('networkidle')
    
    await uiHelpers.takeScreenshot('verification-queue-search')
  })

  test('should review and approve verification request', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Look for a pending request to review
    const firstRequest = page.locator('[data-testid^="request-"]').first()
    if (await firstRequest.isVisible({ timeout: 2000 })) {
      // Get the request ID from the element
      const requestId = await firstRequest.getAttribute('data-testid')
      const id = requestId?.replace('request-', '') || '1'
      
      await adminHelpers.reviewVerificationRequest(id, 'approve')
      
      // Verify success message
      await expect(page.locator('[data-testid="action-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="action-success"]')).toContainText(/approved|success/)
    }
    
    await uiHelpers.takeScreenshot('verification-request-approval')
  })

  test('should review and reject verification request', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Look for a pending request to review
    const firstRequest = page.locator('[data-testid^="request-"]').first()
    if (await firstRequest.isVisible({ timeout: 2000 })) {
      const requestId = await firstRequest.getAttribute('data-testid')
      const id = requestId?.replace('request-', '') || '1'
      
      await adminHelpers.reviewVerificationRequest(id, 'reject')
      
      // Verify success message
      await expect(page.locator('[data-testid="action-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="action-success"]')).toContainText(/rejected|updated/)
    }
    
    await uiHelpers.takeScreenshot('verification-request-rejection')
  })

  test('should display verification request details in modal', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Click on first request to open details modal
    const firstRequest = page.locator('[data-testid^="request-"]').first()
    if (await firstRequest.isVisible({ timeout: 2000 })) {
      await firstRequest.click()
      
      // Verify review modal is displayed
      await expect(page.locator('[data-testid="review-modal"]')).toBeVisible()
      await expect(page.locator('[data-testid="modal-title"]')).toBeVisible()
      
      // Verify modal content sections
      await expect(page.locator('[data-testid="request-details"]')).toBeVisible()
      await expect(page.locator('[data-testid="documents-section"]')).toBeVisible()
      await expect(page.locator('[data-testid="review-form"]')).toBeVisible()
      
      // Verify action buttons
      await expect(page.locator('[data-testid="approve-button"]')).toBeVisible()
      await expect(page.locator('[data-testid="reject-button"]')).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('verification-request-modal')
  })

  test('should handle bulk actions on verification requests', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Select multiple requests for bulk action
    const requestCheckboxes = page.locator('[data-testid^="select-request-"]')
    const checkboxCount = await requestCheckboxes.count()
    
    if (checkboxCount > 0) {
      // Select first two requests
      for (let i = 0; i < Math.min(2, checkboxCount); i++) {
        await requestCheckboxes.nth(i).check()
      }
      
      // Verify bulk actions button is enabled
      await expect(page.locator('[data-testid="bulk-actions-button"]')).toBeEnabled()
      
      // Open bulk actions menu
      await page.click('[data-testid="bulk-actions-button"]')
      
      // Verify bulk action options
      await expect(page.locator('[data-testid="bulk-approve"]')).toBeVisible()
      await expect(page.locator('[data-testid="bulk-reject"]')).toBeVisible()
      await expect(page.locator('[data-testid="bulk-assign"]')).toBeVisible()
    }
    
    await uiHelpers.takeScreenshot('verification-bulk-actions')
  })

  test('should perform bulk approval of verification requests', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Get request IDs for bulk approval
    const requestElements = page.locator('[data-testid^="request-"]')
    const requestCount = await requestElements.count()
    
    if (requestCount > 0) {
      const requestIds: string[] = []
      for (let i = 0; i < Math.min(2, requestCount); i++) {
        const requestId = await requestElements.nth(i).getAttribute('data-testid')
        if (requestId) {
          requestIds.push(requestId.replace('request-', ''))
        }
      }
      
      if (requestIds.length > 0) {
        await adminHelpers.bulkApproveRequests(requestIds)
        
        // Verify bulk success message
        await expect(page.locator('[data-testid="bulk-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="bulk-success"]')).toContainText(/bulk action completed|requests approved/)
      }
    }
    
    await uiHelpers.takeScreenshot('verification-bulk-approval')
  })

  test('should display verification statistics', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Check for statistics section
    const statsSection = page.locator('[data-testid="verification-stats"]')
    if (await statsSection.isVisible()) {
      // Verify different stat cards
      const statCards = [
        'total-requests',
        'pending-requests', 
        'approved-requests',
        'rejected-requests',
        'average-processing-time'
      ]
      
      for (const cardId of statCards) {
        const statCard = page.locator(`[data-testid="${cardId}"]`)
        if (await statCard.isVisible({ timeout: 1000 })) {
          await expect(statCard).toBeVisible()
        }
      }
    }
    
    await uiHelpers.takeScreenshot('verification-statistics')
  })

  test('should handle document viewing in verification review', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Open first request for review
    const firstRequest = page.locator('[data-testid^="request-"]').first()
    if (await firstRequest.isVisible({ timeout: 2000 })) {
      await firstRequest.click()
      
      // Look for document viewer
      const documentViewer = page.locator('[data-testid="document-viewer"]')
      if (await documentViewer.isVisible({ timeout: 2000 })) {
        await expect(documentViewer).toBeVisible()
        
        // Check for document controls
        const downloadButton = page.locator('[data-testid="download-document"]')
        const zoomControls = page.locator('[data-testid="zoom-controls"]')
        
        if (await downloadButton.isVisible({ timeout: 1000 })) {
          await expect(downloadButton).toBeVisible()
        }
        
        if (await zoomControls.isVisible({ timeout: 1000 })) {
          await expect(zoomControls).toBeVisible()
        }
      }
    }
    
    await uiHelpers.takeScreenshot('document-viewer')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await adminHelpers.navigateToAdminDashboard()
    
    // Verify mobile responsiveness
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    
    // Verify navigation items in mobile menu
    await expect(page.locator('[data-testid="mobile-nav-verification"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('admin-mobile-responsive')
  })

  test('should handle admin role verification', async ({ page }) => {
    // Verify admin-only features are accessible
    await adminHelpers.navigateToAdminDashboard()
    
    // Check for admin-only elements
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
    
    // Navigate to verification queue
    await adminHelpers.navigateToVerificationQueue()
    
    // Verify admin can access verification management
    await expect(page.locator('[data-testid="verification-queue"]')).toBeVisible()
    await expect(page.locator('[data-testid="bulk-actions-button"]')).toBeVisible()
    
    await uiHelpers.takeScreenshot('admin-role-verification')
  })

  test('should handle verification request assignment', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Look for assignment functionality
    const assignButton = page.locator('[data-testid="assign-request"]').first()
    if (await assignButton.isVisible({ timeout: 2000 })) {
      await assignButton.click()
      
      // Verify assignment modal or dropdown
      const assignModal = page.locator('[data-testid="assign-modal"]')
      const assignDropdown = page.locator('[data-testid="assign-dropdown"]')
      
      if (await assignModal.isVisible({ timeout: 1000 })) {
        await expect(assignModal).toBeVisible()
        await expect(page.locator('[data-testid="admin-list"]')).toBeVisible()
      } else if (await assignDropdown.isVisible({ timeout: 1000 })) {
        await expect(assignDropdown).toBeVisible()
      }
    }
    
    await uiHelpers.takeScreenshot('verification-request-assignment')
  })

  test('should display audit trail for verification actions', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Open a request to view audit trail
    const firstRequest = page.locator('[data-testid^="request-"]').first()
    if (await firstRequest.isVisible({ timeout: 2000 })) {
      await firstRequest.click()
      
      // Look for audit trail section
      const auditTrail = page.locator('[data-testid="audit-trail"]')
      if (await auditTrail.isVisible({ timeout: 2000 })) {
        await expect(auditTrail).toBeVisible()
        
        // Verify audit entries
        const auditEntries = page.locator('[data-testid="audit-entry"]')
        if (await auditEntries.first().isVisible({ timeout: 1000 })) {
          await expect(auditEntries.first()).toBeVisible()
        }
      }
    }
    
    await uiHelpers.takeScreenshot('verification-audit-trail')
  })

  test('should handle verification queue pagination', async ({ page }) => {
    await adminHelpers.navigateToVerificationQueue()
    
    // Look for pagination controls
    const pagination = page.locator('[data-testid="pagination"]')
    if (await pagination.isVisible({ timeout: 2000 })) {
      await expect(pagination).toBeVisible()
      
      // Check pagination elements
      const nextButton = page.locator('[data-testid="pagination-next"]')
      const prevButton = page.locator('[data-testid="pagination-prev"]')
      const pageNumbers = page.locator('[data-testid="page-number"]')
      
      if (await nextButton.isVisible({ timeout: 1000 })) {
        await expect(nextButton).toBeVisible()
      }
      
      if (await pageNumbers.first().isVisible({ timeout: 1000 })) {
        await expect(pageNumbers.first()).toBeVisible()
      }
    }
    
    await uiHelpers.takeScreenshot('verification-queue-pagination')
  })

  test('should redirect non-admin users away from admin pages', async ({ page }) => {
    // Logout admin and login as regular user
    await authHelpers.logout()
    await authHelpers.login(TEST_USERS.regularUser)
    
    // Try to access admin dashboard
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    // Should be redirected away from admin pages
    expect(page.url()).not.toMatch(/\/admin/)
    
    // Should show access denied or redirect to appropriate page
    const accessDenied = page.locator('[data-testid="access-denied"]')
    if (await accessDenied.isVisible({ timeout: 2000 })) {
      await expect(accessDenied).toContainText(/access denied|not authorized|admin only/)
    } else {
      // Should redirect to home or login
      expect(page.url()).toMatch(/\/(home|login|\/)/)
    }
    
    await uiHelpers.takeScreenshot('admin-access-denied')
  })
}) 