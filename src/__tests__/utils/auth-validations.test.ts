import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  SecurityValidation
} from '@/lib/validations/auth'

describe('Authentication Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
        expect(result.data.password).toBe('password123')
        expect(result.data.rememberMe).toBe(true)
      }
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user..name@domain.com',
        'user@domain',
        'user@.domain.com',
        'user@domain..com'
      ]

      invalidEmails.forEach(email => {
        const result = loginSchema.safeParse({
          email,
          password: 'password123'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('email')
          )).toBe(true)
        }
      })
    })

    it('should require password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('password')
        )).toBe(true)
      }
    })

    it('should normalize email to lowercase', () => {
      const result = loginSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'password123'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
      }
    })

    it('should handle optional rememberMe field', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBeUndefined()
      }
    })
  })

  describe('registerSchema', () => {
    const validRegistrationData = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      fullName: 'John Doe',
      phone: '+263712345678',
      profession: 'Software Engineer',
      location: 'Harare, Zimbabwe',
      acceptTerms: true
    }

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validRegistrationData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
        expect(result.data.fullName).toBe('John Doe')
        expect(result.data.acceptTerms).toBe(true)
      }
    })

    it('should require password confirmation match', () => {
      const result = registerSchema.safeParse({
        ...validRegistrationData,
        confirmPassword: 'DifferentPassword123!'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('confirmPassword')
        )).toBe(true)
      }
    })

    it('should enforce strong password requirements', () => {
      const weakPasswords = [
        'password',        // Too common
        '12345678',       // No letters
        'abcdefgh',       // No numbers/special chars
        'Pass123',        // Too short
        'PASSWORD123!',   // No lowercase
        'password123!',   // No uppercase
        'Password!',      // No numbers
        'Password123'     // No special chars
      ]

      weakPasswords.forEach(password => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('password')
          )).toBe(true)
        }
      })
    })

    it('should validate full name format', () => {
      const invalidNames = [
        'J',              // Too short
        'John123',        // Contains numbers
        'John@Doe',       // Invalid characters
        'John  Doe',      // Multiple spaces
        '',               // Empty
        'a'.repeat(101)   // Too long
      ]

      invalidNames.forEach(fullName => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          fullName
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('fullName')
          )).toBe(true)
        }
      })
    })

    it('should require terms acceptance', () => {
      const result = registerSchema.safeParse({
        ...validRegistrationData,
        acceptTerms: false
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('acceptTerms')
        )).toBe(true)
      }
    })

    it('should handle optional fields', () => {
      const minimalData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        fullName: 'John Doe',
        acceptTerms: true
      }

      const result = registerSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBeUndefined()
        expect(result.data.profession).toBeUndefined()
        expect(result.data.location).toBeUndefined()
      }
    })

    it('should validate phone number format', () => {
      const validPhones = [
        '+263712345678',
        '+1234567890',
        '0712345678'
      ]

      validPhones.forEach(phone => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          phone
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'user@example.com'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
      }
    })

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'invalid-email'
      })
      expect(result.success).toBe(false)
    })

    it('should require email field', () => {
      const result = forgotPasswordSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewSecurePass123!',
        confirmPassword: 'NewSecurePass123!'
      })
      expect(result.success).toBe(true)
    })

    it('should reject non-matching passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewSecurePass123!',
        confirmPassword: 'DifferentPass123!'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('confirmPassword')
        )).toBe(true)
      }
    })

    it('should enforce password strength', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'weak',
        confirmPassword: 'weak'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('changePasswordSchema', () => {
    it('should validate correct password change data', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123!',
        newPassword: 'NewSecurePass123!',
        confirmNewPassword: 'NewSecurePass123!'
      })
      expect(result.success).toBe(true)
    })

    it('should require new password to be different', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'SamePass123!',
        newPassword: 'SamePass123!',
        confirmNewPassword: 'SamePass123!'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('newPassword')
        )).toBe(true)
      }
    })

    it('should require new password confirmation match', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'DifferentPass123!'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('confirmNewPassword')
        )).toBe(true)
      }
    })
  })

  describe('SecurityValidation', () => {
    describe('sanitizeInput', () => {
      it('should remove HTML tags', () => {
        const input = '<script>alert("xss")</script>Hello World'
        const result = SecurityValidation.sanitizeInput(input)
        expect(result).toBe('Hello World')
        expect(result).not.toContain('<script>')
      })

      it('should remove control characters', () => {
        const input = 'Hello\x00\x1FWorld\x7F'
        const result = SecurityValidation.sanitizeInput(input)
        expect(result).toBe('HelloWorld')
      })

      it('should trim whitespace', () => {
        const input = '  Hello World  '
        const result = SecurityValidation.sanitizeInput(input)
        expect(result).toBe('Hello World')
      })

      it('should limit length to prevent DoS', () => {
        const input = 'a'.repeat(20000)
        const result = SecurityValidation.sanitizeInput(input)
        expect(result.length).toBe(10000)
      })
    })

    describe('validateSecurity', () => {
      it('should detect SQL injection patterns', () => {
        const maliciousInputs = [
          "'; DROP TABLE users; --",
          "1' OR '1'='1",
          "UNION SELECT * FROM users"
        ]

        maliciousInputs.forEach(input => {
          expect(() => SecurityValidation.validateSecurity(input, 'test'))
            .toThrow('contains potentially malicious content')
        })
      })

      it('should detect XSS patterns', () => {
        const xssInputs = [
          '<script>alert("xss")</script>',
          'javascript:alert("xss")',
          '<iframe src="evil.com"></iframe>',
          'onload="alert(1)"'
        ]

        xssInputs.forEach(input => {
          expect(() => SecurityValidation.validateSecurity(input, 'test'))
            .toThrow('contains potentially malicious content')
        })
      })

      it('should detect path traversal patterns', () => {
        const pathTraversalInputs = [
          '../../../etc/passwd',
          '..\\..\\windows\\system32',
          './../../config'
        ]

        pathTraversalInputs.forEach(input => {
          expect(() => SecurityValidation.validateSecurity(input, 'test'))
            .toThrow('contains invalid characters')
        })
      })

      it('should allow safe input', () => {
        const safeInputs = [
          'Hello World',
          'user@example.com',
          'John Doe',
          'Software Engineer'
        ]

        safeInputs.forEach(input => {
          expect(() => SecurityValidation.validateSecurity(input, 'test'))
            .not.toThrow()
        })
      })
    })

    describe('SECURITY_PATTERNS', () => {
      it('should have all required security patterns', () => {
        expect(SecurityValidation.SECURITY_PATTERNS.SQL_INJECTION).toBeInstanceOf(RegExp)
        expect(SecurityValidation.SECURITY_PATTERNS.XSS_PATTERNS).toBeInstanceOf(RegExp)
        expect(SecurityValidation.SECURITY_PATTERNS.PATH_TRAVERSAL).toBeInstanceOf(RegExp)
        expect(SecurityValidation.SECURITY_PATTERNS.COMMAND_INJECTION).toBeInstanceOf(RegExp)
        expect(SecurityValidation.SECURITY_PATTERNS.HTML_TAGS).toBeInstanceOf(RegExp)
        expect(SecurityValidation.SECURITY_PATTERNS.CONTROL_CHARS).toBeInstanceOf(RegExp)
      })

      it('should detect SQL injection patterns correctly', () => {
        const pattern = SecurityValidation.SECURITY_PATTERNS.SQL_INJECTION
        expect(pattern.test("'; DROP TABLE users; --")).toBe(true)
        expect(pattern.test("UNION SELECT")).toBe(true)
        expect(pattern.test("normal text")).toBe(false)
      })

      it('should detect XSS patterns correctly', () => {
        const pattern = SecurityValidation.SECURITY_PATTERNS.XSS_PATTERNS
        expect(pattern.test('<script>')).toBe(true)
        expect(pattern.test('javascript:')).toBe(true)
        expect(pattern.test('normal text')).toBe(false)
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty strings', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: ''
      })
      expect(result.success).toBe(false)
    })

    it('should handle null and undefined values', () => {
      const result = loginSchema.safeParse({
        email: null,
        password: undefined
      })
      expect(result.success).toBe(false)
    })

    it('should handle very long inputs', () => {
      const longEmail = 'a'.repeat(300) + '@example.com'
      const result = loginSchema.safeParse({
        email: longEmail,
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should handle unicode characters safely', () => {
      const unicodeInput = 'test\u0000\u001F\u007F'
      const sanitized = SecurityValidation.sanitizeInput(unicodeInput)
      expect(sanitized).not.toContain('\u0000')
      expect(sanitized).not.toContain('\u001F')
      expect(sanitized).not.toContain('\u007F')
    })

    it('should handle mixed case emails correctly', () => {
      const result = registerSchema.safeParse({
        email: 'User.Name+Tag@Example.COM',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        fullName: 'User Name',
        acceptTerms: true
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user.name+tag@example.com')
      }
    })
  })

  describe('Performance and Security', () => {
    it('should process validation quickly', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        loginSchema.safeParse({
          email: `user${i}@example.com`,
          password: 'password123'
        })
      }
      
      const end = performance.now()
      expect(end - start).toBeLessThan(1000) // Should complete in under 1 second
    })

    it('should handle malicious input without crashing', () => {
      const maliciousInputs = [
        '<script>while(true){}</script>',
        'x'.repeat(100000),
        '\x00\x01\x02\x03\x04\x05',
        '𝕏𝕐𝕑', // Unicode mathematical symbols
        '💩🔥💯', // Emojis
      ]

      maliciousInputs.forEach(input => {
        expect(() => {
          SecurityValidation.sanitizeInput(input)
        }).not.toThrow()
      })
    })
  })
}) 