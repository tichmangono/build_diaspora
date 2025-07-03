'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Settings,
  Clock,
  Lock
} from 'lucide-react'

interface PrivacySettings {
  userId: string
  dataProcessingConsent: boolean
  marketingConsent: boolean
  analyticsConsent: boolean
  profilingConsent: boolean
  dataRetentionPeriod: number
  anonymizeAfterDeletion: boolean
  allowDataExport: boolean
  updatedAt: string
}

interface ConsentRecord {
  consentType: 'essential' | 'analytics' | 'marketing' | 'profiling'
  granted: boolean
  grantedAt: string
  revokedAt?: string
  version: string
}

export function PrivacyDashboard() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [consentHistory, setConsentHistory] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    try {
      const [settingsRes, consentRes] = await Promise.all([
        fetch('/api/privacy/settings'),
        fetch('/api/privacy/consent-history')
      ])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData.settings)
      }

      if (consentRes.ok) {
        const consentData = await consentRes.json()
        setConsentHistory(consentData.history || [])
      }
    } catch (error) {
      console.error('Failed to load privacy data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConsent = async (consentType: string, granted: boolean) => {
    setActionLoading(`consent-${consentType}`)
    try {
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType,
          granted,
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent,
          version: '1.0'
        })
      })

      if (response.ok) {
        await loadPrivacyData()
      }
    } catch (error) {
      console.error('Failed to update consent:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const exportData = async () => {
    setActionLoading('export')
    try {
      const response = await fetch('/api/privacy/export-data', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setExportUrl(data.downloadUrl)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const requestDeletion = async (deletionType: 'soft' | 'hard') => {
    const confirmed = confirm(
      deletionType === 'hard' 
        ? 'This will permanently delete all your data. This action cannot be undone. Are you sure?'
        : 'This will anonymize your account. You can still log in but your personal data will be removed. Continue?'
    )

    if (!confirmed) return

    setActionLoading(`delete-${deletionType}`)
    try {
      const response = await fetch('/api/privacy/delete-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletionType })
      })

      if (response.ok) {
        if (deletionType === 'hard') {
          // Redirect to goodbye page
          window.location.href = '/goodbye'
        } else {
          await loadPrivacyData()
        }
      }
    } catch (error) {
      console.error('Failed to delete data:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/privacy/client-ip')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Dashboard</h1>
          <p className="text-gray-600">Manage your privacy settings and data rights</p>
        </div>
      </div>

      {/* Data Rights Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Data Rights
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">Export Your Data</h3>
                <p className="text-sm text-blue-700">Download all your personal data</p>
              </div>
              <Button
                onClick={exportData}
                disabled={actionLoading === 'export'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading === 'export' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>

            {exportUrl && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">Your data export is ready!</p>
                <a 
                  href={exportUrl}
                  className="text-sm text-green-600 hover:text-green-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Export File (expires in 7 days)
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h3 className="font-medium text-yellow-900">Anonymize Account</h3>
                <p className="text-sm text-yellow-700">Remove personal data but keep account</p>
              </div>
              <Button
                onClick={() => requestDeletion('soft')}
                disabled={actionLoading === 'delete-soft'}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                {actionLoading === 'delete-soft' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700">Permanently delete all data</p>
              </div>
              <Button
                onClick={() => requestDeletion('hard')}
                disabled={actionLoading === 'delete-hard'}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {actionLoading === 'delete-hard' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Consent Management */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Consent Management
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Essential Cookies</h3>
              <p className="text-sm text-gray-600">Required for basic site functionality</p>
            </div>
            <Badge variant="secondary">Always Active</Badge>
          </div>

          {[
            {
              type: 'analytics',
              title: 'Analytics Cookies',
              description: 'Help us understand how you use our site',
              current: settings?.analyticsConsent || false
            },
            {
              type: 'marketing',
              title: 'Marketing Cookies',
              description: 'Used to show relevant advertisements',
              current: settings?.marketingConsent || false
            },
            {
              type: 'profiling',
              title: 'Profiling',
              description: 'Create personalized experiences',
              current: settings?.profilingConsent || false
            }
          ].map((consent) => (
            <div key={consent.type} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{consent.title}</h3>
                <p className="text-sm text-gray-600">{consent.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => updateConsent(consent.type, !consent.current)}
                  disabled={actionLoading === `consent-${consent.type}`}
                  variant={consent.current ? "default" : "outline"}
                  size="sm"
                >
                  {actionLoading === `consent-${consent.type}` ? (
                    <LoadingSpinner size="sm" />
                  ) : consent.current ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {consent.current ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Advanced Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Privacy Settings
          </h2>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
          >
            {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  Data Retention
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your data will be kept for {settings?.dataRetentionPeriod || 365} days after account deletion
                </p>
                <Badge variant="outline">
                  {settings?.anonymizeAfterDeletion ? 'Auto-anonymize enabled' : 'Manual deletion'}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4" />
                  Data Export
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {settings?.allowDataExport ? 'You can export your data' : 'Data export is restricted'}
                </p>
                <Badge variant={settings?.allowDataExport ? "default" : "secondary"}>
                  {settings?.allowDataExport ? 'Export Allowed' : 'Export Restricted'}
                </Badge>
              </div>
            </div>

            {/* Consent History */}
            {consentHistory.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Recent Consent Changes</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {consentHistory.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="capitalize">{record.consentType}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.granted ? "default" : "secondary"} size="sm">
                          {record.granted ? 'Granted' : 'Revoked'}
                        </Badge>
                        <span className="text-gray-500">
                          {new Date(record.grantedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Compliance Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-900">
          <AlertTriangle className="h-5 w-5" />
          Your Privacy Rights
        </h2>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Under GDPR and CCPA, you have the right to:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Access your personal data (Right to Access)</li>
            <li>Correct inaccurate data (Right to Rectification)</li>
            <li>Delete your data (Right to Erasure)</li>
            <li>Export your data (Right to Data Portability)</li>
            <li>Restrict data processing (Right to Restriction)</li>
            <li>Object to data processing (Right to Object)</li>
          </ul>
          <p className="mt-3">
            For questions about your privacy rights, contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@builddiaspora.com" className="underline">
              privacy@builddiaspora.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
} 