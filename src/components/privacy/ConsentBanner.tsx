'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Cookie, 
  Shield, 
  Settings, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

interface ConsentSettings {
  essential: boolean
  analytics: boolean
  marketing: boolean
  profiling: boolean
}

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consents, setConsents] = useState<ConsentSettings>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    profiling: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkConsentStatus()
  }, [])

  const checkConsentStatus = async () => {
    try {
      // Check if user has already given consent
      const consentGiven = localStorage.getItem('builddiaspora-consent-given')
      const consentTimestamp = localStorage.getItem('builddiaspora-consent-timestamp')
      
      // Show banner if no consent given or consent is older than 1 year
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000)
      const shouldShowBanner = !consentGiven || 
        !consentTimestamp || 
        parseInt(consentTimestamp) < oneYearAgo

      if (shouldShowBanner) {
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Error checking consent status:', error)
      setIsVisible(true) // Show banner on error to be safe
    }
  }

  const recordConsent = async (consentData: ConsentSettings) => {
    try {
      const clientIP = await fetch('/api/privacy/client-ip').then(res => res.json())
      
      // Record each consent type
      const consentPromises = Object.entries(consentData).map(([type, granted]) => 
        fetch('/api/privacy/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consentType: type,
            granted,
            ipAddress: clientIP.ip,
            userAgent: navigator.userAgent,
            version: '1.0'
          })
        })
      )

      await Promise.all(consentPromises)
    } catch (error) {
      console.error('Error recording consent:', error)
      // Continue anyway - we'll store locally as fallback
    }
  }

  const handleAcceptAll = async () => {
    setLoading(true)
    try {
      const allConsents = {
        essential: true,
        analytics: true,
        marketing: true,
        profiling: true
      }
      
      await recordConsent(allConsents)
      
      // Store consent in localStorage
      localStorage.setItem('builddiaspora-consent-given', 'true')
      localStorage.setItem('builddiaspora-consent-timestamp', Date.now().toString())
      localStorage.setItem('builddiaspora-consent-settings', JSON.stringify(allConsents))
      
      setIsVisible(false)
    } catch (error) {
      console.error('Error accepting all consents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptSelected = async () => {
    setLoading(true)
    try {
      await recordConsent(consents)
      
      // Store consent in localStorage
      localStorage.setItem('builddiaspora-consent-given', 'true')
      localStorage.setItem('builddiaspora-consent-timestamp', Date.now().toString())
      localStorage.setItem('builddiaspora-consent-settings', JSON.stringify(consents))
      
      setIsVisible(false)
    } catch (error) {
      console.error('Error accepting selected consents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectAll = async () => {
    setLoading(true)
    try {
      const essentialOnly = {
        essential: true,
        analytics: false,
        marketing: false,
        profiling: false
      }
      
      await recordConsent(essentialOnly)
      
      // Store consent in localStorage
      localStorage.setItem('builddiaspora-consent-given', 'true')
      localStorage.setItem('builddiaspora-consent-timestamp', Date.now().toString())
      localStorage.setItem('builddiaspora-consent-settings', JSON.stringify(essentialOnly))
      
      setIsVisible(false)
    } catch (error) {
      console.error('Error rejecting consents:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConsent = (type: keyof ConsentSettings, value: boolean) => {
    if (type === 'essential') return // Essential cookies cannot be disabled
    
    setConsents(prev => ({
      ...prev,
      [type]: value
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/20 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto p-6 border-2 border-blue-200 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Cookie className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We value your privacy
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies and similar technologies to provide, protect, and improve our services. 
                Some cookies are essential for our site to work, while others help us understand how you use our services 
                so we can make improvements and show you relevant content.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAcceptAll}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept All
              </Button>
              
              <Button
                onClick={handleRejectAll}
                disabled={loading}
                variant="outline"
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Essential Only
              </Button>
              
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
                {showDetails ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>

            {/* Detailed Settings */}
            {showDetails && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-gray-900">Cookie Preferences</h4>
                
                <div className="grid gap-4">
                  {/* Essential Cookies */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900">Essential Cookies</h5>
                        <Badge variant="secondary" size="sm">Required</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        Necessary for basic site functionality, security, and authentication.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="default">Always Active</Badge>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">Analytics Cookies</h5>
                      <p className="text-xs text-gray-600">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => updateConsent('analytics', !consents.analytics)}
                        variant={consents.analytics ? "default" : "outline"}
                        size="sm"
                      >
                        {consents.analytics ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">Marketing Cookies</h5>
                      <p className="text-xs text-gray-600">
                        Used to show you relevant advertisements and measure ad effectiveness.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => updateConsent('marketing', !consents.marketing)}
                        variant={consents.marketing ? "default" : "outline"}
                        size="sm"
                      >
                        {consents.marketing ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Profiling Cookies */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">Profiling Cookies</h5>
                      <p className="text-xs text-gray-600">
                        Create personalized experiences based on your preferences and behavior.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => updateConsent('profiling', !consents.profiling)}
                        variant={consents.profiling ? "default" : "outline"}
                        size="sm"
                      >
                        {consents.profiling ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <a 
                      href="/privacy-policy" 
                      className="hover:text-blue-600 flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Shield className="h-3 w-3" />
                      Privacy Policy
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a 
                      href="/cookie-policy" 
                      className="hover:text-blue-600 flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Cookie className="h-3 w-3" />
                      Cookie Policy
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <Button
                    onClick={handleAcceptSelected}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Your privacy choices are protected under GDPR and CCPA regulations.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 