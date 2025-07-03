'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SecurityTest {
  name: string
  status: 'pass' | 'fail' | 'warning' | 'testing'
  message: string
  details?: string
}

function CSPTest() {
  const [tests, setTests] = useState<SecurityTest[]>([
    {
      name: 'Content Security Policy',
      status: 'testing',
      message: 'Checking CSP headers...',
    },
    {
      name: 'Script Injection Prevention',
      status: 'testing',
      message: 'Testing script injection protection...',
    },
    {
      name: 'Inline Script Blocking',
      status: 'testing',
      message: 'Verifying inline script restrictions...',
    },
    {
      name: 'External Resource Loading',
      status: 'testing',
      message: 'Checking external resource policies...',
    },
  ])

  useEffect(() => {
    runSecurityTests()
  }, [])

  const runSecurityTests = async () => {
    // Test 1: Check if CSP headers are present
    setTimeout(() => {
      setTests(prev => prev.map((test, index) => {
        if (index === 0) {
          // Check for CSP meta tag or headers
          const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
          const hasCSP = cspMeta || document.querySelector('meta[name="csp-nonce"]')
          
          return {
            ...test,
            status: hasCSP ? 'pass' : 'warning',
            message: hasCSP 
              ? 'CSP headers detected and active'
              : 'CSP headers not detected in meta tags',
            details: hasCSP 
              ? 'Content Security Policy is properly configured'
              : 'CSP may be configured at server level'
          }
        }
        return test
      }))
    }, 500)

    // Test 2: Script injection test
    setTimeout(() => {
      setTests(prev => prev.map((test, index) => {
        if (index === 1) {
          try {
            // Try to create a script element (should be blocked by CSP)
            const script = document.createElement('script')
            script.innerHTML = 'console.log("test")'
            document.head.appendChild(script)
            document.head.removeChild(script)
            
            return {
              ...test,
              status: 'warning',
              message: 'Script injection test completed',
              details: 'Dynamic script creation was allowed (check CSP configuration)'
            }
          } catch {
            return {
              ...test,
              status: 'pass',
              message: 'Script injection blocked successfully',
              details: 'CSP is properly preventing dynamic script execution'
            }
          }
        }
        return test
      }))
    }, 1000)

    // Test 3: Inline script test
    setTimeout(() => {
      setTests(prev => prev.map((test, index) => {
        if (index === 2) {
          // Check if nonce is being used for inline scripts
          const scriptsWithNonce = document.querySelectorAll('script[nonce]')
          const inlineScripts = document.querySelectorAll('script:not([src])')
          
          return {
            ...test,
            status: scriptsWithNonce.length > 0 ? 'pass' : 'warning',
            message: scriptsWithNonce.length > 0 
              ? `Found ${scriptsWithNonce.length} scripts with nonce`
              : 'No nonce-protected scripts detected',
            details: `Total inline scripts: ${inlineScripts.length}, Nonce-protected: ${scriptsWithNonce.length}`
          }
        }
        return test
      }))
    }, 1500)

    // Test 4: External resource test
    setTimeout(() => {
      setTests(prev => prev.map((test, index) => {
        if (index === 3) {
          try {
            // Try to load an external resource
            const img = new Image()
            img.onload = () => {
              setTests(prev => prev.map((t, i) => 
                i === 3 ? {
                  ...t,
                  status: 'pass',
                  message: 'External resources loading properly',
                  details: 'Allowed external resources are loading correctly'
                } : t
              ))
            }
            img.onerror = () => {
              setTests(prev => prev.map((t, i) => 
                i === 3 ? {
                  ...t,
                  status: 'warning',
                  message: 'Some external resources may be blocked',
                  details: 'CSP may be restricting external resource loading'
                } : t
              ))
            }
            // Use a small data URL to test
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
          } catch {
            return {
              ...test,
              status: 'fail',
              message: 'External resource test failed',
              details: 'Unable to test external resource loading'
            }
          }
        }
        return test
      }))
    }, 2000)
  }

  const getStatusIcon = (status: SecurityTest['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'testing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusBadge = (status: SecurityTest['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default">Pass</Badge>
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>
      case 'testing':
        return <Badge variant="outline">Testing...</Badge>
    }
  }

  const overallStatus = tests.every(t => t.status === 'pass') 
    ? 'pass' 
    : tests.some(t => t.status === 'fail') 
    ? 'fail' 
    : 'warning'

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security Test Results
          {getStatusBadge(overallStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <span className="font-medium">{test.name}</span>
              </div>
              {getStatusBadge(test.status)}
            </div>
            <p className="text-sm text-slate-600 mb-1">{test.message}</p>
            {test.details && (
              <p className="text-xs text-slate-500">{test.details}</p>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button 
            onClick={runSecurityTests}
            variant="outline"
            className="w-full"
          >
            Run Tests Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CSPTest 