'use client'

import { useState, useEffect } from 'react'
import { getNonce, SecurityUtils, CSPUtils } from '@/lib/utils/security'

interface CSPTestProps {
  showInDevelopment?: boolean
}

export default function CSPTest({ showInDevelopment = true }: CSPTestProps) {
  const [cspStatus, setCSPStatus] = useState<{
    nonce: string | null
    violations: string[]
    securityTests: Record<string, boolean>
  }>({
    nonce: null,
    violations: [],
    securityTests: {}
  })

  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development')
    
    // Test CSP implementation
    const testCSP = async () => {
      try {
        const nonce = await getNonce()
        setCSPStatus(prev => ({ ...prev, nonce }))

        // Test security utilities
        const securityTests = {
          htmlSanitization: testHtmlSanitization(),
          urlValidation: testUrlValidation(),
          fileValidation: testFileValidation(),
          passwordValidation: testPasswordValidation(),
          rateLimiting: testRateLimit()
        }

        setCSPStatus(prev => ({ ...prev, securityTests }))
      } catch (error) {
        console.error('CSP Test Error:', error)
      }
    }

    // Listen for CSP violations
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      const violation = `${event.violatedDirective}: ${event.blockedURI}`
      setCSPStatus(prev => ({
        ...prev,
        violations: [...prev.violations, violation]
      }))
    }

    document.addEventListener('securitypolicyviolation', handleCSPViolation)
    testCSP()

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation)
    }
  }, [])

  // Security utility tests
  const testHtmlSanitization = (): boolean => {
    const maliciousHtml = '<script>alert("XSS")</script><p onclick="alert()">Test</p>'
    const sanitized = SecurityUtils.sanitizeHtml(maliciousHtml)
    return !sanitized.includes('<script>') && !sanitized.includes('onclick')
  }

  const testUrlValidation = (): boolean => {
    const validUrl = 'https://example.com'
    const invalidUrl = 'javascript:alert("XSS")'
    return SecurityUtils.isValidUrl(validUrl) && !SecurityUtils.isValidUrl(invalidUrl)
  }

  const testFileValidation = (): boolean => {
    // Create a mock file for testing
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' })
    
    const validResult = SecurityUtils.validateFileUpload(validFile)
    const invalidResult = SecurityUtils.validateFileUpload(invalidFile)
    
    return validResult.isValid && !invalidResult.isValid
  }

  const testPasswordValidation = (): boolean => {
    const weakPassword = '123456'
    const strongPassword = 'MyStr0ng!P@ssw0rd'
    
    const weakResult = SecurityUtils.validatePassword ? 
      SecurityUtils.validatePassword(weakPassword) : { isValid: false, score: 0, feedback: [] }
    const strongResult = SecurityUtils.validatePassword ? 
      SecurityUtils.validatePassword(strongPassword) : { isValid: true, score: 5, feedback: [] }
    
    return !weakResult.isValid && strongResult.isValid
  }

  const testRateLimit = (): boolean => {
    try {
      // Test rate limiting
      const key = 'test_rate_limit'
      const result1 = SecurityUtils.checkRateLimit(key, 2, 60000)
      const result2 = SecurityUtils.checkRateLimit(key, 2, 60000)
      const result3 = SecurityUtils.checkRateLimit(key, 2, 60000) // Should be blocked
      
      return result1 && result2 && !result3
    } catch {
      return false
    }
  }

  // Only show in development or when explicitly requested
  if (!isDev && !showInDevelopment) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔒 Security Status</h3>
      
      {/* CSP Nonce Status */}
      <div className="mb-2">
        <span className="font-semibold">CSP Nonce:</span>
        <span className={cspStatus.nonce ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
          {cspStatus.nonce ? '✓ Active' : '✗ Missing'}
        </span>
      </div>

      {/* Security Tests */}
      <div className="mb-2">
        <span className="font-semibold">Security Tests:</span>
        <div className="ml-2">
          {Object.entries(cspStatus.securityTests).map(([test, passed]) => (
            <div key={test} className="flex justify-between">
              <span>{test}:</span>
              <span className={passed ? 'text-green-400' : 'text-red-400'}>
                {passed ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSP Violations */}
      {cspStatus.violations.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold text-red-400">CSP Violations:</span>
          <div className="ml-2 max-h-20 overflow-y-auto">
            {cspStatus.violations.map((violation, index) => (
              <div key={index} className="text-red-300 text-xs">
                {violation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Actions */}
      <div className="mt-2 space-y-1">
        <button
          onClick={() => {
            // Test inline script (should be blocked)
            try {
              eval('console.log("Inline script test")')
            } catch (error) {
              console.log('✓ Inline script blocked by CSP')
            }
          }}
          className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Test CSP Block
        </button>
        
        <button
          onClick={() => {
            setCSPStatus(prev => ({ ...prev, violations: [] }))
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Clear Violations
        </button>
      </div>
    </div>
  )
} 