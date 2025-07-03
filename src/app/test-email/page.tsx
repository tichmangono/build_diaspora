'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { toast } from '@/lib/toast'

export default function TestEmailPage() {
  const [testData, setTestData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com'
  })
  const [loading, setLoading] = useState<string | null>(null)

  const sendTestEmail = async (type: string) => {
    setLoading(type)
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: {
            user: testData,
            verificationLink: type === 'verification' ? 'https://builddiaspora.com/verify?token=test123' : undefined,
            resetLink: type === 'password_reset' ? 'https://builddiaspora.com/reset?token=test123' : undefined,
            verificationDetails: type.includes('verification_') ? {
              credentialType: 'Education',
              institutionName: 'University of Zimbabwe'
            } : undefined
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`${type} email sent successfully!`)
        console.log('Email result:', result)
      } else {
        toast.error(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error('Email error:', error)
      toast.error(`Error sending email`)
    } finally {
      setLoading(null)
    }
  }

  const emailTypes = [
    { type: 'welcome', title: 'Welcome Email', icon: '🎉' },
    { type: 'verification', title: 'Email Verification', icon: '📧' },
    { type: 'password_reset', title: 'Password Reset', icon: '🔒' },
    { type: 'verification_approved', title: 'Verification Approved', icon: '✅' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">📧 Email System Test</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={testData.name}
                onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Test Name"
              />
              <Input
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Test Email"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emailTypes.map((emailType) => (
            <Card key={emailType.type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {emailType.icon} {emailType.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => sendTestEmail(emailType.type)}
                  disabled={loading === emailType.type}
                  className="w-full"
                >
                  {loading === emailType.type ? 'Sending...' : `Send ${emailType.title}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 