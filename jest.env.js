// Jest environment setup for integration tests

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

// Mock environment variables for development mode testing
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_ENVIRONMENT = 'development'

// Mock external service URLs
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api'

// Disable real database connections in tests
process.env.DISABLE_DATABASE = 'true'

// Set up mock data flags
process.env.USE_MOCK_DATA = 'true'
process.env.MOCK_AUTHENTICATION = 'true'

console.log('🧪 Test environment configured with mock data and services') 