'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Shield, Award, BookOpen, Briefcase } from 'lucide-react'
import VerificationWizard from '@/components/verification/VerificationWizard'
import { RequireAuth } from '@/components/auth/AuthGuard'

export default function VerificationPage() {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8">
          <VerificationWizard
            onComplete={(verificationId) => {
              router.push(`/verification/requests/${verificationId}`)
            }}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Professional Verification</h1>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Verify your credentials to build trust and credibility in the BuildDiaspora community.
              Showcase your education, certifications, and professional experience.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Build Credibility</h3>
                <p className="text-sm text-slate-600">
                  Verified credentials increase trust and opportunities in the diaspora network.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Showcase Skills</h3>
                <p className="text-sm text-slate-600">
                  Display your education, certifications, and professional achievements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Career Growth</h3>
                <p className="text-sm text-slate-600">
                  Verified profiles attract better opportunities and professional connections.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Verification Types */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What Can You Verify?</h2>
              <p className="text-slate-600">
                Choose from various verification types to showcase your professional background.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  type: 'education',
                  title: 'Education',
                  description: 'Degrees, diplomas, and academic achievements',
                  icon: '🎓',
                  examples: ['Bachelor\'s Degree', 'Master\'s Degree', 'Diploma', 'Certificate']
                },
                {
                  type: 'certification',
                  title: 'Certifications',
                  description: 'Professional certifications and licenses',
                  icon: '📜',
                  examples: ['AWS Certified', 'PMP', 'CPA', 'Professional License']
                },
                {
                  type: 'employment',
                  title: 'Employment',
                  description: 'Work experience and professional roles',
                  icon: '💼',
                  examples: ['Senior Developer', 'Project Manager', 'Consultant', 'Executive']
                },
                {
                  type: 'skills',
                  title: 'Skills',
                  description: 'Technical and professional competencies',
                  icon: '⚡',
                  examples: ['Programming', 'Design', 'Management', 'Languages']
                }
              ].map((item) => (
                <Card key={item.type} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                      </div>
                      <div className="space-y-1">
                        {item.examples.map((example, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Process */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Verification Process</h2>
              <p className="text-slate-600">
                Our streamlined process ensures quick and secure credential verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: 1,
                  title: 'Submit Request',
                  description: 'Fill out the verification form and upload required documents'
                },
                {
                  step: 2,
                  title: 'Document Review',
                  description: 'Our team reviews your documents and verifies authenticity'
                },
                {
                  step: 3,
                  title: 'Verification',
                  description: 'We contact institutions or employers for confirmation'
                },
                {
                  step: 4,
                  title: 'Badge Issued',
                  description: 'Receive your verification badge and display on your profile'
                }
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">{step.step}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Get Verified?</h2>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  Start your verification journey today and unlock new opportunities 
                  in the BuildDiaspora Zimbabwe community.
                </p>
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    onClick={() => setShowWizard(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Start Verification
                  </Button>
                  <div className="text-sm text-slate-500">
                    Processing time: 3-5 business days • Free for all members
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">View My Requests</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Check the status of your verification requests and manage your submissions.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/verification/requests')}
                >
                  View Requests
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Help & Support</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Need help with verification? Check our FAQ or contact support.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/help/verification')}
                >
                  Get Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
} 