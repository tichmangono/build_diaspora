const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFiles: ['<rootDir>/jest.env.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/app/api/**/*.{js,ts}',
    'src/lib/**/*.{js,ts}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/layout.tsx',
    '!src/app/page.tsx'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  verbose: true,
  globals: {
    Request: global.Request || class MockRequest {},
    Response: global.Response || class MockResponse {},
    Headers: global.Headers || class MockHeaders {},
    fetch: global.fetch || jest.fn(),
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 