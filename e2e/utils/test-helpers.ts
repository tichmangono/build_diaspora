import { Page, expect, Locator } from '@playwright/test'

export interface TestUser {
  email: string
  password: string
  fullName: string
  role?: 'user' | 'admin' | 'moderator'
}

export const TEST_USERS = {
  regularUser: {
    email: 'test.user@builddiaspora.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
    role: 'user' as const
  },
  adminUser: {
    email: 'admin.test@builddiaspora.com', 
    password: 'AdminPassword123!',
    fullName: 'Admin Test User',
    role: 'admin' as const
  },
  newUser: {
    email: 'new.user@builddiaspora.com',
    password: 'NewPassword123!',
    fullName: 'New Test User',
    role: 'user' as const
  }
} as const

export class AuthHelpers {
  constructor(private page: Page) {}

  async navigateToLogin() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveTitle(/Login/)
  }

  async navigateToRegister() {
    await this.page.goto('/register')
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveTitle(/Register/)
  }

  async navigateToHome() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToForgotPassword() {
    await this.page.goto('/forgot-password')
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveTitle(/Forgot Password|Reset Password/)
  }

  async fillLoginForm(user: TestUser) {
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
  }

  async fillRegisterForm(user: TestUser) {
    await this.page.fill('[data-testid="full-name-input"]', user.fullName)
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.fill('[data-testid="confirm-password-input"]', user.password)
  }

  async submitLoginForm() {
    await this.page.click('[data-testid="login-submit-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async submitRegisterForm() {
    await this.page.click('[data-testid="register-submit-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async login(user: TestUser) {
    await this.navigateToLogin()
    await this.fillLoginForm(user)
    await this.submitLoginForm()
    
    // Wait for successful login redirect
    await this.page.waitForURL(/\/(dashboard|profile|home)/, { timeout: 10000 })
    await this.verifyLoggedIn(user)
  }

  async register(user: TestUser) {
    await this.navigateToRegister()
    await this.fillRegisterForm(user)
    await this.submitRegisterForm()
    
    // Wait for successful registration
    await this.page.waitForURL(/\/(login|dashboard|verify-email)/, { timeout: 10000 })
  }

  async logout() {
    // Look for logout button/menu
    const logoutButton = this.page.locator('[data-testid="logout-button"]')
    const userMenu = this.page.locator('[data-testid="user-menu"]')
    
    if (await userMenu.isVisible()) {
      await userMenu.click()
      await this.page.waitForTimeout(500)
    }
    
    await logoutButton.click()
    await this.page.waitForLoadState('networkidle')
    
    // Verify logout was successful
    await this.page.waitForURL(/\/(login|home|\/)/, { timeout: 10000 })
    await this.verifyLoggedOut()
  }

  async verifyLoggedIn(user: TestUser) {
    // Check for user-specific elements that indicate successful login
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible()
    
    // Check for user name or email in the UI
    const userInfo = this.page.locator('[data-testid="user-info"]')
    if (await userInfo.isVisible()) {
      await expect(userInfo).toContainText(user.fullName)
    }
    
    // Verify we're not on login/register pages
    expect(this.page.url()).not.toMatch(/\/(login|register)/)
  }

  async verifyLoggedOut() {
    // Check that we're redirected to public pages
    await this.page.waitForURL(/\/(login|home|\/)/, { timeout: 5000 })
    
    // Verify user-specific elements are not visible
    await expect(this.page.locator('[data-testid="user-menu"]')).not.toBeVisible()
    await expect(this.page.locator('[data-testid="logout-button"]')).not.toBeVisible()
  }

  async navigateToForgotPassword() {
    await this.page.goto('/forgot-password')
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveTitle(/Forgot Password|Reset Password/)
  }

  async resetPassword(email: string) {
    await this.page.goto('/forgot-password')
    await this.page.waitForLoadState('networkidle')
    
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.click('[data-testid="reset-password-button"]')
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible()
  }

  async verifyEmailSent() {
    await expect(this.page.locator('[data-testid="email-sent-message"]')).toBeVisible()
  }

  async handleFormValidation(expectedErrors: string[]) {
    for (const error of expectedErrors) {
      await expect(this.page.locator('[data-testid="form-error"]')).toContainText(error)
    }
  }
}

export class VerificationHelpers {
  constructor(private page: Page) {}

  async navigateToVerification() {
    await this.page.goto('/verification')
    await this.page.waitForLoadState('networkidle')
  }

  async startVerificationWizard() {
    await this.page.click('[data-testid="start-verification-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async selectCredentialType(type: 'education' | 'employment' | 'certification' | 'skills') {
    await this.page.click(`[data-testid="credential-type-${type}"]`)
    await this.page.click('[data-testid="continue-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async fillEducationForm() {
    await this.page.fill('[data-testid="institution-name"]', 'University of Zimbabwe')
    await this.page.fill('[data-testid="degree-title"]', 'Bachelor of Computer Science')
    await this.page.fill('[data-testid="start-date"]', '2018-09')
    await this.page.fill('[data-testid="end-date"]', '2022-06')
  }

  async fillEmploymentForm() {
    await this.page.fill('[data-testid="company-name"]', 'TechCorp Ltd')
    await this.page.fill('[data-testid="job-title"]', 'Senior Software Engineer')
    await this.page.fill('[data-testid="start-date"]', '2022-07')
    await this.page.check('[data-testid="currently-employed"]')
  }

  async uploadDocument(filePath: string) {
    const fileInput = this.page.locator('[data-testid="document-upload"]')
    await fileInput.setInputFiles(filePath)
    
    // Wait for upload to complete
    await expect(this.page.locator('[data-testid="upload-success"]')).toBeVisible()
  }

  async submitVerificationRequest() {
    await this.page.click('[data-testid="submit-verification"]')
    await this.page.waitForLoadState('networkidle')
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="verification-submitted"]')).toBeVisible()
  }

  async viewVerificationHistory() {
    await this.page.goto('/verification/history')
    await this.page.waitForLoadState('networkidle')
  }

  async viewBadges() {
    await this.page.goto('/profile/badges')
    await this.page.waitForLoadState('networkidle')
  }
}

export class AdminHelpers {
  constructor(private page: Page) {}

  async navigateToAdminDashboard() {
    await this.page.goto('/admin')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToVerificationQueue() {
    await this.page.goto('/admin/verification')
    await this.page.waitForLoadState('networkidle')
  }

  async reviewVerificationRequest(requestId: string, action: 'approve' | 'reject') {
    // Find the request in the queue
    const requestRow = this.page.locator(`[data-testid="request-${requestId}"]`)
    await requestRow.click()
    
    // Wait for review modal to open
    await expect(this.page.locator('[data-testid="review-modal"]')).toBeVisible()
    
    if (action === 'approve') {
      await this.page.fill('[data-testid="verification-score"]', '95')
      await this.page.fill('[data-testid="review-notes"]', 'All documents verified successfully')
      await this.page.click('[data-testid="approve-button"]')
    } else {
      await this.page.fill('[data-testid="review-notes"]', 'Documents require additional verification')
      await this.page.click('[data-testid="reject-button"]')
    }
    
    // Wait for action to complete
    await expect(this.page.locator('[data-testid="action-success"]')).toBeVisible()
  }

  async bulkApproveRequests(requestIds: string[]) {
    // Select multiple requests
    for (const id of requestIds) {
      await this.page.check(`[data-testid="select-request-${id}"]`)
    }
    
    await this.page.click('[data-testid="bulk-actions-button"]')
    await this.page.click('[data-testid="bulk-approve"]')
    
    // Confirm bulk action
    await this.page.click('[data-testid="confirm-bulk-action"]')
    await expect(this.page.locator('[data-testid="bulk-success"]')).toBeVisible()
  }

  async filterRequests(status: string) {
    await this.page.selectOption('[data-testid="status-filter"]', status)
    await this.page.waitForLoadState('networkidle')
  }

  async searchRequests(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.press('[data-testid="search-input"]', 'Enter')
    await this.page.waitForLoadState('networkidle')
  }
}

export class UIHelpers {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForSelector('body')
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    })
  }

  async verifyToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = this.page.locator(`[data-testid="toast-${type}"]`)
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(message)
  }

  async verifyModal(title: string) {
    const modal = this.page.locator('[data-testid="modal"]')
    await expect(modal).toBeVisible()
    await expect(modal.locator('[data-testid="modal-title"]')).toContainText(title)
  }

  async closeModal() {
    await this.page.click('[data-testid="modal-close"]')
    await expect(this.page.locator('[data-testid="modal"]')).not.toBeVisible()
  }

  async verifyLoadingState() {
    await expect(this.page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    await expect(this.page.locator('[data-testid="loading-spinner"]')).not.toBeVisible()
  }

  async verifyResponsiveDesign(viewport: { width: number; height: number }) {
    await this.page.setViewportSize(viewport)
    await this.page.waitForTimeout(500) // Allow for responsive adjustments
    
    // Verify mobile menu exists on smaller screens
    if (viewport.width < 768) {
      await expect(this.page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    } else {
      await expect(this.page.locator('[data-testid="desktop-nav"]')).toBeVisible()
    }
  }
}

export class MockHelpers {
  constructor(private page: Page) {}

  async enableMockAuth() {
    await this.page.evaluate(() => {
      localStorage.setItem('mock_auth_enabled', 'true')
    })
  }

  async setMockUser(user: TestUser) {
    await this.page.evaluate((userData) => {
      localStorage.setItem('mock_user_data', JSON.stringify(userData))
    }, user)
  }

  async clearMockData() {
    await this.page.evaluate(() => {
      localStorage.removeItem('mock_auth_enabled')
      localStorage.removeItem('mock_user_data')
    })
  }

  async mockApiResponse(endpoint: string, response: any) {
    await this.page.route(`**/api/${endpoint}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  }
} 