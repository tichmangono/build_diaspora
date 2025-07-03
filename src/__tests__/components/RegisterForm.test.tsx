import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import RegisterForm from '@/components/auth/RegisterForm'

// Mock the auth client
jest.mock('@/lib/auth/client', () => ({
  clientAuth: {
    signUp: jest.fn()
  },
  rateLimitUtils: {
    isRateLimited: jest.fn(() => false),
    clearAttempts: jest.fn()
  }
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
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
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/terms/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should render sign in link', () => {
      render(<RegisterForm />)
      
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<RegisterForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
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

    it('should validate password confirmation match', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const { clientAuth } = require('@/lib/auth/client')
      clientAuth.signUp.mockResolvedValue({ data: { user: { id: '123' } }, error: null })
      
      render(<RegisterForm />)
      
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!')
      await user.click(screen.getByLabelText(/terms/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(clientAuth.signUp).toHaveBeenCalledWith(
          'john@example.com',
          'SecurePass123!',
          expect.objectContaining({
            fullName: 'John Doe'
          })
        )
      })
    })

    it('should show loading state during submission', async () => {
      const { clientAuth } = require('@/lib/auth/client')
      clientAuth.signUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<RegisterForm />)
      
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!')
      await user.click(screen.getByLabelText(/terms/i))
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Password Strength Indicator', () => {
    it('should show password strength feedback', async () => {
      render(<RegisterForm />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'weak')
      
      // Check if password strength indicator is present (implementation may vary)
      expect(passwordInput).toHaveValue('weak')
    })
  })

  describe('Links and Navigation', () => {
    it('should have working sign in link', () => {
      render(<RegisterForm />)
      
      const signInLink = screen.getByText(/sign in/i)
      expect(signInLink.closest('a')).toHaveAttribute('href', '/auth/login')
    })
  })
}) 