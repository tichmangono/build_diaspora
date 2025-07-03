/**
 * Test Database Utilities
 * 
 * This file provides utilities for setting up and managing test database state.
 * In development mode, these functions use mock data.
 * In integration testing, these would connect to a test database.
 */

export interface TestDatabaseConfig {
  useRealDatabase?: boolean
  testDatabaseUrl?: string
  cleanupAfterEach?: boolean
}

class TestDatabase {
  private config: TestDatabaseConfig
  private mockData: Map<string, any[]> = new Map()

  constructor(config: TestDatabaseConfig = {}) {
    this.config = {
      useRealDatabase: false,
      cleanupAfterEach: true,
      ...config,
    }
    this.initializeMockData()
  }

  private initializeMockData() {
    // Initialize mock data collections
    this.mockData.set('users', [])
    this.mockData.set('verification_requests', [])
    this.mockData.set('verification_documents', [])
    this.mockData.set('verification_badges', [])
    this.mockData.set('sessions', [])
  }

  // User management
  async createTestUser(userData: any) {
    if (this.config.useRealDatabase) {
      // In real testing, this would create a user in the test database
      throw new Error('Real database testing not implemented yet')
    }

    const user = {
      id: `test-user-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData,
    }

    const users = this.mockData.get('users') || []
    users.push(user)
    this.mockData.set('users', users)

    return user
  }

  async deleteTestUser(userId: string) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const users = this.mockData.get('users') || []
    const filteredUsers = users.filter(user => user.id !== userId)
    this.mockData.set('users', filteredUsers)

    // Also clean up related data
    await this.cleanupUserData(userId)
  }

  private async cleanupUserData(userId: string) {
    // Clean up verification requests
    const verificationRequests = this.mockData.get('verification_requests') || []
    const filteredRequests = verificationRequests.filter(req => req.user_id !== userId)
    this.mockData.set('verification_requests', filteredRequests)

    // Clean up sessions
    const sessions = this.mockData.get('sessions') || []
    const filteredSessions = sessions.filter(session => session.user_id !== userId)
    this.mockData.set('sessions', filteredSessions)
  }

  // Verification request management
  async createTestVerificationRequest(requestData: any) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const request = {
      id: `test-verification-${Date.now()}`,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      ...requestData,
    }

    const requests = this.mockData.get('verification_requests') || []
    requests.push(request)
    this.mockData.set('verification_requests', requests)

    return request
  }

  async updateVerificationRequestStatus(requestId: string, status: string) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const requests = this.mockData.get('verification_requests') || []
    const request = requests.find(req => req.id === requestId)
    
    if (request) {
      request.status = status
      request.updated_at = new Date().toISOString()
    }

    return request
  }

  // Session management
  async createTestSession(sessionData: any) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const session = {
      id: `test-session-${Date.now()}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      ...sessionData,
    }

    const sessions = this.mockData.get('sessions') || []
    sessions.push(session)
    this.mockData.set('sessions', sessions)

    return session
  }

  async deleteTestSession(sessionId: string) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const sessions = this.mockData.get('sessions') || []
    const filteredSessions = sessions.filter(session => session.id !== sessionId)
    this.mockData.set('sessions', filteredSessions)
  }

  // Data retrieval
  async getTestUser(userId: string) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const users = this.mockData.get('users') || []
    return users.find(user => user.id === userId)
  }

  async getTestVerificationRequest(requestId: string) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const requests = this.mockData.get('verification_requests') || []
    return requests.find(req => req.id === requestId)
  }

  async getUserVerificationRequests(userId: string) {
    if (this.config.useRealDatabase) {
      throw new Error('Real database testing not implemented yet')
    }

    const requests = this.mockData.get('verification_requests') || []
    return requests.filter(req => req.user_id === userId)
  }

  // Cleanup utilities
  async cleanup() {
    if (this.config.useRealDatabase) {
      // In real testing, this would clean up the test database
      throw new Error('Real database testing not implemented yet')
    }

    // Clear all mock data
    this.initializeMockData()
  }

  async cleanupTestData() {
    if (this.config.useRealDatabase) {
      // Clean up only test data (data with test- prefixes)
      throw new Error('Real database testing not implemented yet')
    }

    // Remove only test data from mock collections
    for (const [collection, data] of this.mockData.entries()) {
      const filteredData = data.filter(item => !item.id?.startsWith('test-'))
      this.mockData.set(collection, filteredData)
    }
  }

  // Seed data for testing
  async seedTestData() {
    // Create basic test users
    await this.createTestUser({
      email: 'test@example.com',
      name: 'Test User',
      email_verified: true,
    })

    await this.createTestUser({
      email: 'admin@example.com',
      name: 'Admin User',
      email_verified: true,
      role: 'admin',
    })

    // Create test verification requests
    const users = this.mockData.get('users') || []
    const testUser = users.find(user => user.email === 'test@example.com')
    
    if (testUser) {
      await this.createTestVerificationRequest({
        user_id: testUser.id,
        credential_type: 'education',
        institution_name: 'Test University',
        degree_type: 'Bachelor',
        field_of_study: 'Computer Science',
      })
    }
  }

  // Statistics and utilities
  getCollectionSize(collection: string): number {
    return this.mockData.get(collection)?.length || 0
  }

  getAllCollections(): string[] {
    return Array.from(this.mockData.keys())
  }

  getMockData(collection: string): any[] {
    return this.mockData.get(collection) || []
  }
}

// Global test database instance
export const testDatabase = new TestDatabase()

// Setup and teardown helpers
export const setupTestDatabase = async (config?: TestDatabaseConfig) => {
  if (config) {
    // Create a new instance with custom config
    return new TestDatabase(config)
  }
  
  await testDatabase.cleanup()
  await testDatabase.seedTestData()
  return testDatabase
}

export const teardownTestDatabase = async () => {
  await testDatabase.cleanup()
}

// Jest setup helpers
export const setupDatabaseForEach = () => {
  beforeEach(async () => {
    await testDatabase.cleanup()
    await testDatabase.seedTestData()
  })

  afterEach(async () => {
    if (testDatabase.config.cleanupAfterEach) {
      await testDatabase.cleanupTestData()
    }
  })
}

export const setupDatabaseForAll = () => {
  beforeAll(async () => {
    await testDatabase.cleanup()
    await testDatabase.seedTestData()
  })

  afterAll(async () => {
    await testDatabase.cleanup()
  })
} 