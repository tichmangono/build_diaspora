import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import VerificationWizard from '@/components/verification/VerificationWizard'
import { verificationClient } from '@/lib/verification/client'

// Mock verification client
jest.mock('@/lib/verification/client', () => ({
  verificationClient: {
    getCredentialTypes: jest.fn(),
    submitVerificationRequest: jest.fn(),
    uploadDocument: jest.fn()
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
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

describe('VerificationWizard Component', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock credential types
    const mockGetCredentialTypes = verificationClient.getCredentialTypes as jest.MockedFunction<typeof verificationClient.getCredentialTypes>
    mockGetCredentialTypes.mockResolvedValue([
      {
        id: 'education',
        name: 'Education',
        description: 'Verify your educational qualifications',
        category: 'academic',
        isActive: true,
        requiredDocuments: ['diploma', 'transcript'],
        processingTime: '3-5 business days'
      },
      {
        id: 'employment',
        name: 'Employment',
        description: 'Verify your work experience',
        category: 'professional',
        isActive: true,
        requiredDocuments: ['employment_letter', 'contract'],
        processingTime: '2-4 business days'
      }
    ])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render credential type selection step initially', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        expect(screen.getByText(/select verification type/i)).toBeInTheDocument()
        expect(screen.getByText(/education/i)).toBeInTheDocument()
        expect(screen.getByText(/employment/i)).toBeInTheDocument()
      })
    })

    it('should show progress indicator', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
      })
    })

    it('should display credential type details', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        expect(screen.getByText(/verify your educational qualifications/i)).toBeInTheDocument()
        expect(screen.getByText(/3-5 business days/i)).toBeInTheDocument()
      })
    })
  })

  describe('Step Navigation', () => {
    it('should advance to next step when credential type is selected', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()
        expect(screen.getByText(/basic information/i)).toBeInTheDocument()
      })
    })

    it('should allow going back to previous step', async () => {
      render(<VerificationWizard />)
      
      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()
      })
      
      // Go back
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
        expect(screen.getByText(/select verification type/i)).toBeInTheDocument()
      })
    })

    it('should disable next button when no credential type is selected', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i })
        expect(nextButton).toBeDisabled()
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields in basic information step', async () => {
      render(<VerificationWizard />)
      
      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      let nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()
      })
      
      // Try to proceed without filling required fields
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/institution name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/degree title is required/i)).toBeInTheDocument()
      })
    })

    it('should validate date fields', async () => {
      render(<VerificationWizard />)
      
      // Navigate to education form
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      let nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      })
      
      // Enter invalid date range (end date before start date)
      const startDateInput = screen.getByLabelText(/start date/i)
      const endDateInput = screen.getByLabelText(/end date/i)
      
      await user.type(startDateInput, '2023-01-01')
      await user.type(endDateInput, '2022-12-31')
      
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/end date cannot be before start date/i)).toBeInTheDocument()
      })
    })
  })

  describe('Document Upload', () => {
    it('should handle file upload in documents step', async () => {
      const mockUploadDocument = verificationClient.uploadDocument as jest.MockedFunction<typeof verificationClient.uploadDocument>
      mockUploadDocument.mockResolvedValue({
        success: true,
        documentId: 'doc-123',
        url: 'https://example.com/document.pdf'
      })
      
      render(<VerificationWizard />)
      
      // Navigate to documents step
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      // Step 2: Basic Info
      let nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/institution name/i)).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/institution name/i), 'University of Zimbabwe')
      await user.type(screen.getByLabelText(/degree title/i), 'Bachelor of Computer Science')
      await user.type(screen.getByLabelText(/start date/i), '2018-09-01')
      await user.type(screen.getByLabelText(/end date/i), '2022-06-30')
      
      // Step 3: Details
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument()
      })
      
      // Skip details for now
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Step 4: Documents
      await waitFor(() => {
        expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument()
        expect(screen.getByText(/upload documents/i)).toBeInTheDocument()
      })
      
      // Mock file upload
      const file = new File(['test content'], 'diploma.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/upload diploma/i)
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(mockUploadDocument).toHaveBeenCalledWith(file, 'diploma')
      })
    })

    it('should validate file types and sizes', async () => {
      render(<VerificationWizard />)
      
      // Navigate to documents step (simplified navigation)
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      // Mock navigation to documents step
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      // Navigate through steps quickly for testing
      let nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Fill basic info quickly
      await waitFor(() => {
        expect(screen.getByLabelText(/institution name/i)).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/institution name/i), 'Test University')
      await user.type(screen.getByLabelText(/degree title/i), 'Test Degree')
      
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/upload documents/i)).toBeInTheDocument()
      })
      
      // Try to upload invalid file type
      const invalidFile = new File(['test'], 'document.txt', { type: 'text/plain' })
      const fileInput = screen.getByLabelText(/upload diploma/i)
      
      await user.upload(fileInput, invalidFile)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit verification request successfully', async () => {
      const mockSubmitVerificationRequest = verificationClient.submitVerificationRequest as jest.MockedFunction<typeof verificationClient.submitVerificationRequest>
      mockSubmitVerificationRequest.mockResolvedValue({
        success: true,
        requestId: 'req-123'
      })
      
      render(<VerificationWizard />)
      
      // Complete the wizard (simplified for testing)
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      // Navigate through all steps and fill required data
      let nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Basic info
      await waitFor(() => {
        expect(screen.getByLabelText(/institution name/i)).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/institution name/i), 'University of Zimbabwe')
      await user.type(screen.getByLabelText(/degree title/i), 'Bachelor of Computer Science')
      
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Details step
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      // Documents step - submit
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit verification/i })).toBeInTheDocument()
      })
      
      const submitButton = screen.getByRole('button', { name: /submit verification/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSubmitVerificationRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            credentialType: 'education',
            institutionName: 'University of Zimbabwe',
            degreeTitle: 'Bachelor of Computer Science'
          })
        )
      })
    })

    it('should handle submission errors gracefully', async () => {
      const mockSubmitVerificationRequest = verificationClient.submitVerificationRequest as jest.MockedFunction<typeof verificationClient.submitVerificationRequest>
      mockSubmitVerificationRequest.mockRejectedValue(new Error('Submission failed'))
      
      render(<VerificationWizard />)
      
      // Navigate to final step and attempt submission
      await waitFor(() => {
        expect(screen.getByText(/education/i)).toBeInTheDocument()
      })
      
      const educationCard = screen.getByText(/education/i).closest('div')
      await user.click(educationCard!)
      
      // Quick navigation for testing
      let nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/institution name/i)).toBeInTheDocument()
      })
      
      await user.type(screen.getByLabelText(/institution name/i), 'Test University')
      await user.type(screen.getByLabelText(/degree title/i), 'Test Degree')
      
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /submit verification/i })
        expect(submitButton).toBeInTheDocument()
      })
      
      const submitButton = screen.getByRole('button', { name: /submit verification/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and navigation', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '4')
      })
    })

    it('should be keyboard navigable', async () => {
      render(<VerificationWizard />)
      
      await waitFor(() => {
        const educationCard = screen.getByText(/education/i).closest('div')
        expect(educationCard).toHaveAttribute('tabindex', '0')
      })
      
      // Test keyboard navigation
      await user.tab()
      await user.keyboard('{Enter}')
      
      // Should select the credential type
      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i })
        expect(nextButton).not.toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockGetCredentialTypes = verificationClient.getCredentialTypes as jest.MockedFunction<typeof verificationClient.getCredentialTypes>
      mockGetCredentialTypes.mockRejectedValue(new Error('API Error'))
      
      render(<VerificationWizard />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load credential types/i)).toBeInTheDocument()
      })
    })

    it('should show loading states', async () => {
      const mockGetCredentialTypes = verificationClient.getCredentialTypes as jest.MockedFunction<typeof verificationClient.getCredentialTypes>
      mockGetCredentialTypes.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      render(<VerificationWizard />)
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })
}) 