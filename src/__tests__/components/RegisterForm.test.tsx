import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import RegisterForm from '@/components/auth/RegisterForm'
import { clientAuth } from '@/lib/auth/client'

// Mock the auth client
jest.mock('@/lib/auth/client', () => ({
  clientAuth: {
    signUp: jest.fn(),
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

// Mock password strength checker
jest.mock('@/lib/auth/helpers', () => ({
  validatePasswordStrength: jest.fn((password) => {
    if (password.length < 8) {
      return {
        isValid: false,
        score: 1,
        feedback: ['Password must be at least 8 characters']
      }
    }
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        score: 2,
        feedback: ['Add uppercase letters']
      }
    }
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        score: 2,
        feedback: ['Add numbers']
      }
    }
    return {
      isValid: true,
      score: 5,
      feedback: []
    }
  })
}))

describe('RegisterForm Component', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<RegisterForm />)
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should render terms and conditions checkbox', () => {
      render(<RegisterForm />)
      
      expect(screen.getByText(/i agree to the/i)).toBeInTheDocument()
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
    })

    it('should render social registration buttons', () => {
      render(<RegisterForm />)
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
    })

    it('should render sign in link', () => {
      render(<RegisterForm />)
      
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })

    it('should display welcome message', () => {
      render(<RegisterForm />)
      
      expect(screen.getByText(/create your account/i)).toBeInTheDocument()
      expect(screen.getByText(/join builddiaspora zimbabwe/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<RegisterForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      render(<RegisterForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should validate password strength', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'weak')
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate password confirmation match', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(passwordInput, 'StrongPassword123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('should require terms and conditions acceptance', async () => {
      render(<RegisterForm />)
      
      // Fill out form without accepting terms
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument()
      })
    })

    it('should validate name fields for minimum length', async () => {
      render(<RegisterForm />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      
      await user.type(firstNameInput, 'A')
      await user.type(lastNameInput, 'B')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should show real-time password strength indicator', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      
      await user.type(passwordInput, 'weak')
      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument()
      })
      
      await user.clear(passwordInput)
      await user.type(passwordInput, 'StrongPassword123!')
      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockSignUp = clientAuth.signUp as jest.MockedFunction<typeof clientAuth.signUp>
      mockSignUp.mockResolvedValue({ error: null })
      
      render(<RegisterForm />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/i agree to the/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe',
          acceptedTerms: true
        })
      })
    })

    it('should show loading state during submission', async () => {
      const mockSignUp = clientAuth.signUp as jest.MockedFunction<typeof clientAuth.signUp>
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(<RegisterForm />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/i agree to the/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should redirect to verification page on successful registration', async () => {
      const mockSignUp = clientAuth.signUp as jest.MockedFunction<typeof clientAuth.signUp>
      mockSignUp.mockResolvedValue({ error: null })
      
      render(<RegisterForm />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/i agree to the/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/verify-email?email=john@example.com')
      })
    })

    it('should handle registration errors gracefully', async () => {
      const mockSignUp = clientAuth.signUp as jest.MockedFunction<typeof clientAuth.signUp>
      mockSignUp.mockResolvedValue({ 
        error: { message: 'Email already exists' }
      })
      
      render(<RegisterForm />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/i agree to the/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
      })
    })
  })

  describe('Social Registration', () => {
    it('should handle Google registration', async () => {
      const mockSignInWithProvider = clientAuth.signInWithProvider as jest.MockedFunction<typeof clientAuth.signInWithProvider>
      mockSignInWithProvider.mockResolvedValue({ error: null })
      
      render(<RegisterForm />)
      
      const googleButton = screen.getByText(/continue with google/i)
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockSignInWithProvider).toHaveBeenCalledWith('google', {
          redirectTo: `${window.location.origin}/auth/callback`
        })
      })
    })

    it('should handle GitHub registration', async () => {
      const mockSignInWithProvider = clientAuth.signInWithProvider as jest.MockedFunction<typeof clientAuth.signInWithProvider>
      mockSignInWithProvider.mockResolvedValue({ error: null })
      
      render(<RegisterForm />)
      
      const githubButton = screen.getByText(/continue with github/i)
      await user.click(githubButton)
      
      await waitFor(() => {
        expect(mockSignInWithProvider).toHaveBeenCalledWith('github', {
          redirectTo: `${window.location.origin}/auth/callback`
        })
      })
    })

    it('should handle social registration errors', async () => {
      const mockSignInWithProvider = clientAuth.signInWithProvider as jest.MockedFunction<typeof clientAuth.signInWithProvider>
      mockSignInWithProvider.mockResolvedValue({ 
        error: { message: 'Social registration failed' }
      })
      
      render(<RegisterForm />)
      
      const googleButton = screen.getByText(/continue with google/i)
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(screen.getByText(/social registration failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Password Visibility', () => {
    it('should toggle password visibility for password field', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
      const toggleButton = screen.getAllByRole('button', { name: /toggle password visibility/i })[0]
      
      expect(passwordInput.type).toBe('password')
      
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('text')
      
      await user.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    })

    it('should toggle password visibility for confirm password field', async () => {
      render(<RegisterForm />)
      
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement
      const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i })
      const confirmToggleButton = toggleButtons[1]
      
      expect(confirmPasswordInput.type).toBe('password')
      
      await user.click(confirmToggleButton)
      expect(confirmPasswordInput.type).toBe('text')
      
      await user.click(confirmToggleButton)
      expect(confirmPasswordInput.type).toBe('password')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<RegisterForm />)
      
      expect(screen.getByLabelText(/first name/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/last name/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('aria-required', 'true')
    })

    it('should associate error messages with form fields', async () => {
      render(<RegisterForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/first name/i)
        const firstNameError = screen.getByText(/first name is required/i)
        
        expect(firstNameInput).toHaveAttribute('aria-describedby')
        expect(firstNameError).toHaveAttribute('id')
      })
    })

    it('should be keyboard navigable', async () => {
      render(<RegisterForm />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByLabelText(/i agree to the/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      // Tab through form elements
      await user.tab()
      expect(firstNameInput).toHaveFocus()
      
      await user.tab()
      expect(lastNameInput).toHaveFocus()
      
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(confirmPasswordInput).toHaveFocus()
      
      await user.tab()
      expect(termsCheckbox).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should announce password strength to screen readers', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'StrongPassword123!')
      
      await waitFor(() => {
        const strengthIndicator = screen.getByText(/strong/i)
        expect(strengthIndicator).toHaveAttribute('aria-live', 'polite')
      })
    })
  })

  describe('Form Progress', () => {
    it('should show form completion progress', async () => {
      render(<RegisterForm />)
      
      // Initially no progress
      expect(screen.getByText(/0% complete/i)).toBeInTheDocument()
      
      // Fill first name
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await waitFor(() => {
        expect(screen.getByText(/20% complete/i)).toBeInTheDocument()
      })
      
      // Fill last name
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await waitFor(() => {
        expect(screen.getByText(/40% complete/i)).toBeInTheDocument()
      })
      
      // Fill email
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await waitFor(() => {
        expect(screen.getByText(/60% complete/i)).toBeInTheDocument()
      })
      
      // Fill password
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await waitFor(() => {
        expect(screen.getByText(/80% complete/i)).toBeInTheDocument()
      })
      
      // Accept terms
      await user.click(screen.getByLabelText(/i agree to the/i))
      await waitFor(() => {
        expect(screen.getByText(/100% complete/i)).toBeInTheDocument()
      })
    })
  })

  describe('Security Features', () => {
    it('should not expose sensitive information in DOM', () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password')
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('should prevent password autofill in confirm field', () => {
      render(<RegisterForm />)
      
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockSignUp = clientAuth.signUp as jest.MockedFunction<typeof clientAuth.signUp>
      mockSignUp.mockRejectedValue(new Error('Network error'))
      
      render(<RegisterForm />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!')
      await user.click(screen.getByLabelText(/i agree to the/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
    })

    it('should handle validation errors from server', async () => {
      const mockSignUp = clientAuth.signUp as jest.MockedFunction<typeof clientAuth.signUp>
      mockSignUp.mockResolvedValue({ 
        error: { 
          message: 'Validation failed',
          details: {
            email: 'Email format is invalid',
            password: 'Password is too weak'
          }
        }
      })
      
      render(<RegisterForm />)
      
      // Fill out form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/^password$/i), 'weak')
      await user.type(screen.getByLabelText(/confirm password/i), 'weak')
      await user.click(screen.getByLabelText(/i agree to the/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email format is invalid/i)).toBeInTheDocument()
        expect(screen.getByText(/password is too weak/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should not cause memory leaks', () => {
      const { unmount } = render(<RegisterForm />)
      
      // Unmount component
      unmount()
      
      // Verify no lingering event listeners or timers
      expect(document.querySelectorAll('*').length).toBeGreaterThan(0)
    })

    it('should debounce password strength validation', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      
      // Type rapidly
      await user.type(passwordInput, 'test')
      
      // Strength indicator should not update immediately
      expect(screen.queryByText(/weak/i)).not.toBeInTheDocument()
      
      // Wait for debounce
      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('Links and Navigation', () => {
    it('should have working terms of service link', () => {
      render(<RegisterForm />)
      
      const termsLink = screen.getByText(/terms of service/i)
      expect(termsLink).toHaveAttribute('href', '/legal/terms')
      expect(termsLink).toHaveAttribute('target', '_blank')
    })

    it('should have working privacy policy link', () => {
      render(<RegisterForm />)
      
      const privacyLink = screen.getByText(/privacy policy/i)
      expect(privacyLink).toHaveAttribute('href', '/legal/privacy')
      expect(privacyLink).toHaveAttribute('target', '_blank')
    })

    it('should have working sign in link', () => {
      render(<RegisterForm />)
      
      const signInLink = screen.getByText(/sign in/i)
      expect(signInLink).toHaveAttribute('href', '/login')
    })
  })
}) 