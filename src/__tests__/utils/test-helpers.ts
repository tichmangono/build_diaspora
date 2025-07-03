import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { User } from '@/types/auth'

// Mock user data generators
export const mockUsers = {
  basic: (): User => ({
    id: 'user-basic-123',
    email: 'basic@example.com',
    name: 'Basic User',
    created_at: '2024-01-01T00:00:00Z',
    email_verified: true,
    phone: '+1234567890',
    phone_verified: false,
    profile: {
      bio: 'Basic user for testing',
      location: 'Test City',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/basic',
      github: 'https://github.com/basic',
    },
  }),

  verified: (): User => ({
    id: 'user-verified-456',
    email: 'verified@example.com',
    name: 'Verified User',
    created_at: '2024-01-01T00:00:00Z',
    email_verified: true,
    phone: '+1234567890',
    phone_verified: true,
    profile: {
      bio: 'Verified user for testing',
      location: 'Test City',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/verified',
      github: 'https://github.com/verified',
    },
  }),

  admin: (): User => ({
    id: 'user-admin-789',
    email: 'admin@example.com',
    name: 'Admin User',
    created_at: '2024-01-01T00:00:00Z',
    email_verified: true,
    phone: '+1234567890',
    phone_verified: true,
    role: 'admin',
    profile: {
      bio: 'Admin user for testing',
      location: 'Test City',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/admin',
      github: 'https://github.com/admin',
    },
  }),
}

// Mock verification request data
export const mockVerificationRequests = {
  education: () => ({
    id: 'verification-edu-123',
    user_id: 'user-basic-123',
    credential_type: 'education' as const,
    status: 'pending' as const,
    submitted_at: '2024-01-01T00:00:00Z',
    institution_name: 'Test University',
    degree_type: 'Bachelor',
    field_of_study: 'Computer Science',
    graduation_date: '2023-05-15',
    documents: [
      {
        id: 'doc-1',
        filename: 'diploma.pdf',
        file_type: 'application/pdf',
        file_size: 1024000,
        uploaded_at: '2024-01-01T00:00:00Z',
      },
    ],
  }),

  employment: () => ({
    id: 'verification-emp-456',
    user_id: 'user-basic-123',
    credential_type: 'employment' as const,
    status: 'approved' as const,
    submitted_at: '2024-01-01T00:00:00Z',
    company_name: 'Test Corporation',
    position: 'Software Engineer',
    start_date: '2023-06-01',
    end_date: null,
    is_current: true,
    documents: [
      {
        id: 'doc-2',
        filename: 'employment_letter.pdf',
        file_type: 'application/pdf',
        file_size: 512000,
        uploaded_at: '2024-01-01T00:00:00Z',
      },
    ],
  }),
}

// Mock authentication context provider
interface MockAuthProviderProps {
  children: ReactNode
  user?: User | null
  loading?: boolean
}

export const MockAuthProvider = ({ 
  children, 
  user = null, 
  loading = false 
}: MockAuthProviderProps) => {
  // This would wrap children with a mock auth context
  // For now, we'll just return children as the actual auth provider
  // would be mocked at the module level
  return <>{children}</>
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  loading?: boolean
}

export const renderWithAuth = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, loading, ...renderOptions } = options

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MockAuthProvider user={user} loading={loading}>
      {children}
    </MockAuthProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Test data cleanup utilities
export const testCleanup = {
  clearLocalStorage: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('test-') || key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })
  },

  clearSessionStorage: () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('test-') || key.includes('auth')) {
        sessionStorage.removeItem(key)
      }
    })
  },

  resetMocks: () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  },
}

// Form testing utilities
export const formHelpers = {
  fillInput: async (input: HTMLElement, value: string) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { value } })
  },

  submitForm: async (form: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.submit(form)
  },

  uploadFile: async (input: HTMLElement, file: File) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { files: [file] } })
  },
}

// API testing utilities
export const apiHelpers = {
  mockSuccessResponse: (data: any) => ({
    ok: true,
    status: 200,
    json: async () => ({ data, success: true }),
  }),

  mockErrorResponse: (message: string, status = 400) => ({
    ok: false,
    status,
    json: async () => ({ error: message, success: false }),
  }),

  mockFetch: (response: any) => {
    global.fetch = jest.fn().mockResolvedValue(response)
  },
}

// Wait utilities for async operations
export const waitHelpers = {
  waitForElement: async (selector: string, timeout = 5000) => {
    const { waitFor, screen } = await import('@testing-library/react')
    return waitFor(() => screen.getByTestId(selector), { timeout })
  },

  waitForText: async (text: string, timeout = 5000) => {
    const { waitFor, screen } = await import('@testing-library/react')
    return waitFor(() => screen.getByText(text), { timeout })
  },

  waitForRole: async (role: string, timeout = 5000) => {
    const { waitFor, screen } = await import('@testing-library/react')
    return waitFor(() => screen.getByRole(role), { timeout })
  },
}

// Re-export commonly used testing library functions
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event' 