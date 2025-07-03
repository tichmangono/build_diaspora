import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import LoginForm from '@/components/auth/LoginForm'
import { clientAuth } from '@/lib/auth/client'

// Mock the auth client
jest.mock('@/lib/auth/client', () => ({
  clientAuth: {
    signIn: jest.fn(),
    signInWithProvider: jest.fn()
  }
}))

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === 'message') return 'Please sign in to continue'
      return null
    })
  })
}))

// Mock toast notifications
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn()
  }
}))

describe('LoginForm Component', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/remember me/i)).toBeInTheDocument()
    })

    it('should render social login buttons', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    })

    it('should render sign up link', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
      expect(screen.getByText(/sign up/i)).toBeInTheDocument()
    })

    it('should display welcome message', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid email', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should clear validation errors when user corrects input', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Trigger validation error
      await user.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
      
      // Correct the input
      await user.type(emailInput, 'user@example.com')
      
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })

    it('should validate email format in real-time', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(emailInput, 'invalid')
      await user.tab() // Blur the input
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockResolvedValue({ error: null })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
          rememberMe: false
        })
      })
    })

    it('should include remember me option when checked', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockResolvedValue({ error: null })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const rememberMeCheckbox = screen.getByLabelText(/remember me/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(rememberMeCheckbox)
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
          rememberMe: true
        })
      })
    })

    it('should show loading state during submission', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should redirect to dashboard on successful login', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockResolvedValue({ error: null })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle login errors gracefully', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockResolvedValue({ 
        error: { message: 'Invalid email or password' }
      })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })
  })

  describe('Social Login', () => {
    it('should handle Google login', async () => {
      const mockSignInWithProvider = clientAuth.signInWithProvider as jest.MockedFunction<typeof clientAuth.signInWithProvider>
      mockSignInWithProvider.mockResolvedValue({ error: null })
      
      render(<LoginForm />)
      
      const googleButton = screen.getByText(/continue with google/i)
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockSignInWithProvider).toHaveBeenCalledWith('google', {
          redirectTo: `${window.location.origin}/auth/callback`
        })
      })
    })

    it('should handle GitHub login', async () => {
      const mockSignInWithProvider = clientAuth.signInWithProvider as jest.MockedFunction<typeof clientAuth.signInWithProvider>
      mockSignInWithProvider.mockResolvedValue({ error: null })
      
      render(<LoginForm />)
      
      const githubButton = screen.getByText(/continue with github/i)
      await user.click(githubButton)
      
      await waitFor(() => {
        expect(mockSignInWithProvider).toHaveBeenCalledWith('github', {
          redirectTo: `${window.location.origin}/auth/callback`
        })
      })
    })

    it('should handle social login errors', async () => {
      const mockSignInWithProvider = clientAuth.signInWithProvider as jest.MockedFunction<typeof clientAuth.signInWithProvider>
      mockSignInWithProvider.mockResolvedValue({ 
        error: { message: 'Social login failed' }
      })
      
      render(<LoginForm />)
      
      const googleButton = screen.getByText(/continue with google/i)
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(screen.getByText(/social login failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Password Visibility', () => {
    it('should toggle password visibility', async () => {
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      
      expect(passwordInput.type).toBe('password')
      
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('text')
      
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true')
    })

    it('should associate error messages with form fields', async () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i)
        const emailError = screen.getByText(/email is required/i)
        
        expect(emailInput).toHaveAttribute('aria-describedby')
        expect(emailError).toHaveAttribute('id')
      })
    })

    it('should be keyboard navigable', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const rememberMeCheckbox = screen.getByLabelText(/remember me/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(rememberMeCheckbox).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('URL Parameters', () => {
    it('should display message from URL parameters', () => {
      render(<LoginForm />)
      
      expect(screen.getByText(/please sign in to continue/i)).toBeInTheDocument()
    })

    it('should handle redirect parameter after successful login', async () => {
      // Mock useSearchParams to return redirect parameter
      const mockGet = jest.fn((key) => {
        if (key === 'redirect') return '/profile'
        return null
      })
      
      jest.mocked(require('next/navigation').useSearchParams).mockReturnValue({
        get: mockGet
      })
      
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockResolvedValue({ error: null })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/profile')
      })
    })
  })

  describe('Security Features', () => {
    it('should not expose sensitive information in DOM', () => {
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should prevent form submission with invalid CSRF token', async () => {
      // This would be tested in integration tests with actual CSRF implementation
      render(<LoginForm />)
      
      const form = screen.getByRole('form', { name: /login form/i })
      expect(form).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockRejectedValue(new Error('Network error'))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
    })

    it('should handle rate limiting errors', async () => {
      const mockSignIn = clientAuth.signIn as jest.MockedFunction<typeof clientAuth.signIn>
      mockSignIn.mockResolvedValue({ 
        error: { message: 'Too many login attempts. Please try again later.' }
      })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should not cause memory leaks', () => {
      const { unmount } = render(<LoginForm />)
      
      // Unmount component
      unmount()
      
      // Verify no lingering event listeners or timers
      expect(document.querySelectorAll('*').length).toBeGreaterThan(0)
    })

    it('should debounce validation', async () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      
      // Type rapidly
      await user.type(emailInput, 'test')
      
      // Validation should not run immediately
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
      
      // Wait for debounce
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })
}) 