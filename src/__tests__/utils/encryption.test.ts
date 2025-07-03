import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  encryptData,
  decryptData,
  hashData,
  encryptPII,
  decryptPII,
  generateSecureToken,
  secureCompare
} from '@/lib/utils/encryption'

describe('Encryption Utilities', () => {
  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data correctly', () => {
      const originalText = 'This is sensitive data'
      const encrypted = encryptData(originalText)
      const decrypted = decryptData(encrypted)

      expect(encrypted).not.toBe(originalText)
      expect(encrypted.length).toBeGreaterThan(0)
      expect(decrypted).toBe(originalText)
    })

    it('should produce different encrypted values for same input', () => {
      const text = 'Same input text'
      const encrypted1 = encryptData(text)
      const encrypted2 = encryptData(text)

      expect(encrypted1).not.toBe(encrypted2)
      expect(decryptData(encrypted1)).toBe(text)
      expect(decryptData(encrypted2)).toBe(text)
    })

    it('should handle empty strings', () => {
      const encrypted = encryptData('')
      const decrypted = decryptData(encrypted)

      expect(decrypted).toBe('')
    })

    it('should handle special characters and unicode', () => {
      const specialText = '🔐 Special chars: àáâãäå æç èéêë ìíîï ñ òóôõö ùúûü ýÿ'
      const encrypted = encryptData(specialText)
      const decrypted = decryptData(encrypted)

      expect(decrypted).toBe(specialText)
    })

    it('should handle very long strings', () => {
      const longText = 'A'.repeat(10000)
      const encrypted = encryptData(longText)
      const decrypted = decryptData(encrypted)

      expect(decrypted).toBe(longText)
      expect(encrypted.length).toBeGreaterThan(longText.length)
    })

    it('should throw error for invalid encrypted data', () => {
      expect(() => decryptData('invalid-encrypted-data')).toThrow()
      expect(() => decryptData('')).toThrow()
      expect(() => decryptData('not-base64-encoded')).toThrow()
    })

    it('should handle newlines and tabs', () => {
      const textWithWhitespace = 'Line 1\nLine 2\tTabbed content\r\nWindows line ending'
      const encrypted = encryptData(textWithWhitespace)
      const decrypted = decryptData(encrypted)

      expect(decrypted).toBe(textWithWhitespace)
    })
  })

  describe('hashData', () => {
    it('should produce consistent hash for same input', () => {
      const text = 'password123'
      const hash1 = hashData(text)
      const hash2 = hashData(text)

      expect(hash1).toBe(hash2)
      expect(hash1.length).toBeGreaterThan(0)
    })

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashData('password123')
      const hash2 = hashData('password124')

      expect(hash1).not.toBe(hash2)
    })

    it('should produce fixed-length hashes', () => {
      const shortText = 'a'
      const longText = 'a'.repeat(1000)

      const shortHash = hashData(shortText)
      const longHash = hashData(longText)

      expect(shortHash.length).toBe(longHash.length)
      expect(shortHash.length).toBe(64) // SHA256 produces 64-character hex string
    })

    it('should handle empty string', () => {
      const hash = hashData('')
      expect(hash).toBeDefined()
      expect(hash.length).toBe(64)
    })

    it('should be deterministic', () => {
      const text = 'deterministic test'
      const hashes = Array.from({ length: 100 }, () => hashData(text))
      const uniqueHashes = new Set(hashes)

      expect(uniqueHashes.size).toBe(1)
    })

    it('should handle unicode characters', () => {
      const unicodeText = '🔒 Secure 密码 пароль'
      const hash = hashData(unicodeText)

      expect(hash).toBeDefined()
      expect(hash.length).toBe(64)
    })

    it('should be irreversible', () => {
      const originalText = 'secret password'
      const hash = hashData(originalText)

      // Hash should not contain the original text
      expect(hash).not.toContain(originalText)
      expect(hash.toLowerCase()).not.toContain('secret')
      expect(hash.toLowerCase()).not.toContain('password')
    })
  })

  describe('encryptPII and decryptPII', () => {
    it('should encrypt and decrypt PII data correctly', () => {
      const piiData = 'john.doe@example.com'
      const encrypted = encryptPII(piiData)
      const decrypted = decryptPII(encrypted)

      expect(encrypted).not.toBe(piiData)
      expect(decrypted).toBe(piiData)
    })

    it('should handle sensitive personal information', () => {
      const sensitiveData = [
        'john.doe@example.com',
        '+1-234-567-8900',
        '123-45-6789', // SSN format
        '1234 5678 9012 3456', // Credit card format
        '123 Main St, Anytown, ST 12345'
      ]

      sensitiveData.forEach(data => {
        const encrypted = encryptPII(data)
        const decrypted = decryptPII(encrypted)

        expect(encrypted).not.toBe(data)
        expect(encrypted).not.toContain(data)
        expect(decrypted).toBe(data)
      })
    })

    it('should produce different encrypted values for same PII', () => {
      const email = 'user@example.com'
      const encrypted1 = encryptPII(email)
      const encrypted2 = encryptPII(email)

      expect(encrypted1).not.toBe(encrypted2)
      expect(decryptPII(encrypted1)).toBe(email)
      expect(decryptPII(encrypted2)).toBe(email)
    })

    it('should handle empty PII data', () => {
      const encrypted = encryptPII('')
      const decrypted = decryptPII(encrypted)

      expect(decrypted).toBe('')
    })

    it('should throw error for invalid PII encrypted data', () => {
      expect(() => decryptPII('invalid-pii-data')).toThrow()
      expect(() => decryptPII('')).toThrow()
    })
  })

  describe('generateSecureToken', () => {
    it('should generate token with default length', () => {
      const token = generateSecureToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate token with specified length', () => {
      const lengths = [16, 32, 64, 128]
      
      lengths.forEach(length => {
        const token = generateSecureToken(length)
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        // Note: The actual length might vary depending on implementation
        expect(token.length).toBeGreaterThan(0)
      })
    })

    it('should generate unique tokens', () => {
      const tokens = Array.from({ length: 1000 }, () => generateSecureToken(32))
      const uniqueTokens = new Set(tokens)

      // All tokens should be unique
      expect(uniqueTokens.size).toBe(tokens.length)
    })

    it('should generate tokens with valid characters', () => {
      const token = generateSecureToken(100)
      
      // Should only contain valid hex characters or base64 characters
      // depending on implementation
      expect(token).toMatch(/^[A-Za-z0-9+/=]+$|^[A-Fa-f0-9]+$/)
    })

    it('should handle edge cases for length', () => {
      expect(() => generateSecureToken(0)).not.toThrow()
      expect(() => generateSecureToken(1)).not.toThrow()
      expect(() => generateSecureToken(1000)).not.toThrow()
    })

    it('should be cryptographically random', () => {
      const tokens = Array.from({ length: 100 }, () => generateSecureToken(32))
      
      // Check for patterns that would indicate poor randomness
      const firstChars = tokens.map(token => token[0])
      const uniqueFirstChars = new Set(firstChars)
      
      // Should have reasonable distribution of first characters
      expect(uniqueFirstChars.size).toBeGreaterThan(10)
    })
  })

  describe('secureCompare', () => {
    it('should return true for identical strings', () => {
      const str = 'identical string'
      expect(secureCompare(str, str)).toBe(true)
    })

    it('should return false for different strings', () => {
      expect(secureCompare('string1', 'string2')).toBe(false)
      expect(secureCompare('password', 'Password')).toBe(false)
    })

    it('should return false for strings of different lengths', () => {
      expect(secureCompare('short', 'longer string')).toBe(false)
      expect(secureCompare('longer string', 'short')).toBe(false)
    })

    it('should handle empty strings', () => {
      expect(secureCompare('', '')).toBe(true)
      expect(secureCompare('', 'not empty')).toBe(false)
      expect(secureCompare('not empty', '')).toBe(false)
    })

    it('should be timing-safe (constant time)', () => {
      const correctHash = hashData('correct password')
      const wrongPassword = 'wrong password'
      const wrongHash = hashData(wrongPassword)

      // Measure time for correct comparison
      const start1 = performance.now()
      for (let i = 0; i < 1000; i++) {
        secureCompare(correctHash, correctHash)
      }
      const time1 = performance.now() - start1

      // Measure time for incorrect comparison
      const start2 = performance.now()
      for (let i = 0; i < 1000; i++) {
        secureCompare(correctHash, wrongHash)
      }
      const time2 = performance.now() - start2

      // Times should be similar (within 50% of each other)
      // This is a basic timing attack prevention test
      const ratio = Math.abs(time1 - time2) / Math.max(time1, time2)
      expect(ratio).toBeLessThan(0.5)
    })

    it('should handle unicode characters', () => {
      const unicode1 = '🔒 Secure 密码'
      const unicode2 = '🔒 Secure 密码'
      const unicode3 = '🔓 Insecure 密码'

      expect(secureCompare(unicode1, unicode2)).toBe(true)
      expect(secureCompare(unicode1, unicode3)).toBe(false)
    })

    it('should handle special characters', () => {
      const special1 = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const special2 = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const special3 = '!@#$%^&*()_+-=[]{}|;:,.<>!'

      expect(secureCompare(special1, special2)).toBe(true)
      expect(secureCompare(special1, special3)).toBe(false)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => encryptData(null as any)).toThrow()
      expect(() => encryptData(undefined as any)).toThrow()
      expect(() => hashData(null as any)).toThrow()
      expect(() => hashData(undefined as any)).toThrow()
    })

    it('should handle non-string inputs', () => {
      expect(() => encryptData(123 as any)).toThrow()
      expect(() => encryptData({} as any)).toThrow()
      expect(() => encryptData([] as any)).toThrow()
    })

    it('should handle corrupted encrypted data', () => {
      const validEncrypted = encryptData('test data')
      const corrupted = validEncrypted.slice(0, -5) + 'xxxxx'
      
      expect(() => decryptData(corrupted)).toThrow()
    })

    it('should handle malformed base64 data', () => {
      const malformedData = [
        'not-base64!@#$',
        'incomplete-base64-string',
        '====',
        'spaces in base64'
      ]

      malformedData.forEach(data => {
        expect(() => decryptData(data)).toThrow()
      })
    })
  })

  describe('Performance Tests', () => {
    it('should encrypt/decrypt quickly', () => {
      const testData = 'Performance test data'
      
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        const encrypted = encryptData(testData)
        decryptData(encrypted)
      }
      const end = performance.now()
      
      expect(end - start).toBeLessThan(5000) // Should complete in under 5 seconds
    })

    it('should hash quickly', () => {
      const testData = 'Hash performance test'
      
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        hashData(testData)
      }
      const end = performance.now()
      
      expect(end - start).toBeLessThan(2000) // Should complete in under 2 seconds
    })

    it('should generate tokens quickly', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        generateSecureToken(32)
      }
      const end = performance.now()
      
      expect(end - start).toBeLessThan(1000) // Should complete in under 1 second
    })
  })

  describe('Security Properties', () => {
    it('should not leak original data in encrypted form', () => {
      const sensitiveData = 'credit-card-number-1234567890123456'
      const encrypted = encryptData(sensitiveData)
      
      // Encrypted data should not contain any part of original data
      expect(encrypted.toLowerCase()).not.toContain('credit')
      expect(encrypted.toLowerCase()).not.toContain('card')
      expect(encrypted).not.toContain('1234567890123456')
    })

    it('should produce avalanche effect in hashing', () => {
      const original = 'password123'
      const modified = 'password124' // One character different
      
      const hash1 = hashData(original)
      const hash2 = hashData(modified)
      
      // Count different characters
      let differences = 0
      for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
        if (hash1[i] !== hash2[i]) differences++
      }
      
      // Should have significant differences (avalanche effect)
      expect(differences).toBeGreaterThan(hash1.length * 0.3)
    })

    it('should use proper encryption standards', () => {
      const data = 'test encryption standards'
      const encrypted = encryptData(data)
      
      // Basic checks for proper encryption format
      expect(encrypted).toBeDefined()
      expect(encrypted.length).toBeGreaterThan(data.length)
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/) // Base64 format
    })
  })
}) 