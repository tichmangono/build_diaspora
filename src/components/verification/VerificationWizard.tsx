'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  FileText, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  X
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { 
  getRequiredDocuments,
  getVerificationSteps,
  type CredentialType,
  type VerificationRequest,
  type DocumentType
} from '@/lib/validations/verification'
import { verificationClient, type CredentialTypeOption } from '@/lib/verification/client'

interface VerificationWizardProps {
  credentialTypeId?: string
  onComplete?: (verificationId: string) => void
  onCancel?: () => void
}

interface FormData extends Partial<VerificationRequest> {
  documents: {
    type: DocumentType
    file: File | null
    uploaded: boolean
    id?: string
  }[]
}

export default function VerificationWizard({ 
  credentialTypeId, 
  onComplete, 
  onCancel 
}: VerificationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeOption[]>([])
  const [selectedCredentialType, setSelectedCredentialType] = useState<CredentialTypeOption | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    credentialTypeId: credentialTypeId || '',
    title: '',
    description: '',
    institutionName: '',
    institutionCountry: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    supportingInfo: '',
    verificationData: {},
    documents: []
  })

  // Load credential types and initialize form
  useEffect(() => {
    async function loadCredentialTypes() {
      try {
        const types = await verificationClient.getCredentialTypes()
        setCredentialTypes(types)

        if (credentialTypeId) {
          const selectedType = types.find(t => t.id === credentialTypeId)
          if (selectedType) {
            setSelectedCredentialType(selectedType)
            initializeDocuments(selectedType)
          }
        }
      } catch (error) {
        toast.error('Failed to load credential types')
      }
    }

    loadCredentialTypes()
  }, [credentialTypeId])

  const initializeDocuments = (credentialType: CredentialTypeOption) => {
    const requiredDocs = getRequiredDocuments(credentialType.type)
    const documents = requiredDocs.map(docType => ({
      type: docType,
      file: null,
      uploaded: false
    }))

    setFormData(prev => ({
      ...prev,
      credentialTypeId: credentialType.id,
      documents
    }))
  }

  const handleCredentialTypeSelect = (type: CredentialTypeOption) => {
    setSelectedCredentialType(type)
    initializeDocuments(type)
    setCurrentStep(1)
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCredentialType) return

    setIsSubmitting(true)
    try {
      // Submit verification request
      const verificationId = await verificationClient.submitVerificationRequest({
        credentialTypeId: formData.credentialTypeId!,
        title: formData.title!,
        description: formData.description,
        institutionName: formData.institutionName,
        institutionCountry: formData.institutionCountry,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        supportingInfo: formData.supportingInfo,
        verificationData: formData.verificationData
      })

      // Upload documents
      const uploadPromises = formData.documents
        ?.filter(doc => doc.file)
        .map(doc => 
          verificationClient.uploadDocument(verificationId, doc.file!, doc.type)
        ) || []

      await Promise.all(uploadPromises)

      toast.success('Verification request submitted successfully!')
      
      if (onComplete) {
        onComplete(verificationId)
      } else {
        router.push('/verification/requests')
      }
    } catch (error) {
      toast.error('Failed to submit verification request')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Credential Type Selection Screen
  if (!selectedCredentialType && !credentialTypeId) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Choose Verification Type</CardTitle>
          <CardDescription>
            Select the type of credential you want to verify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentialTypes.map((type) => (
              <Card 
                key={type.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCredentialTypeSelect(type)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{type.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{type.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{type.type}</Badge>
                    <span className="text-slate-500">
                      ~{type.estimatedProcessingDays} days
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedCredentialType) {
    return <div>Loading...</div>
  }

  const steps = getVerificationSteps(selectedCredentialType.type)
  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verification Request</h1>
          <p className="text-slate-600">{selectedCredentialType.name}</p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-slate-600">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                {index + 1 < currentStep ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : index + 1 === currentStep ? (
                  <Circle className="h-5 w-5 text-blue-600 fill-current" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                <span className={`ml-2 text-sm ${
                  index + 1 <= currentStep ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <BasicInfoStep
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              credentialType={selectedCredentialType}
            />
          )}
          {currentStep === 2 && (
            <DetailsStep
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onPrev={handlePrev}
              credentialType={selectedCredentialType}
            />
          )}
          {currentStep === 3 && (
            <DocumentsStep
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onPrev={handlePrev}
              credentialType={selectedCredentialType}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 4 && (
            <ReviewStep
              data={formData}
              onPrev={handlePrev}
              credentialType={selectedCredentialType}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Step Components
interface StepProps {
  data: FormData
  onUpdate: (data: Partial<FormData>) => void
  onNext?: () => void
  onPrev?: () => void
  credentialType: CredentialTypeOption
  isSubmitting?: boolean
}

function BasicInfoStep({ data, onUpdate, onNext, credentialType }: StepProps) {
  const [form, setForm] = useState({
    title: data.title || '',
    description: data.description || '',
    institutionName: data.institutionName || '',
    institutionCountry: data.institutionCountry || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    
    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onUpdate(form)
      onNext?.()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
        <p className="text-sm text-slate-600">
          Provide basic details about your {credentialType.name.toLowerCase()} verification.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Bachelor's Degree in Computer Science"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Additional details about this credential..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="institutionName">Institution/Company Name</Label>
          <Input
            id="institutionName"
            value={form.institutionName}
            onChange={(e) => setForm(prev => ({ ...prev, institutionName: e.target.value }))}
            placeholder="e.g., University of Zimbabwe"
          />
        </div>

        <div>
          <Label htmlFor="institutionCountry">Country</Label>
          <Input
            id="institutionCountry"
            value={form.institutionCountry}
            onChange={(e) => setForm(prev => ({ ...prev, institutionCountry: e.target.value }))}
            placeholder="e.g., Zimbabwe"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function DetailsStep({ data, onUpdate, onNext, onPrev, credentialType }: StepProps) {
  const [form, setForm] = useState({
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    isCurrent: data.isCurrent || false,
    verificationData: data.verificationData || {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onUpdate(form)
      onNext?.()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Details</h3>
        <p className="text-sm text-slate-600">
          Provide specific information about this credential.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
              disabled={form.isCurrent}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isCurrent"
            checked={form.isCurrent}
            onChange={(e) => setForm(prev => ({ 
              ...prev, 
              isCurrent: e.target.checked,
              endDate: e.target.checked ? '' : prev.endDate
            }))}
            className="rounded"
          />
          <Label htmlFor="isCurrent">This is my current position/education</Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function DocumentsStep({ data, onUpdate, onNext, onPrev, credentialType, isSubmitting }: StepProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const requiredDocs = getRequiredDocuments(credentialType.type)

  const handleFileUpload = (documentType: DocumentType, file: File) => {
    const updatedDocuments = data.documents?.map(doc => 
      doc.type === documentType 
        ? { ...doc, file, uploaded: false }
        : doc
    ) || []

    onUpdate({ documents: updatedDocuments })
    toast.success('File selected successfully')
  }

  const removeDocument = (documentType: DocumentType) => {
    const updatedDocuments = data.documents?.map(doc => 
      doc.type === documentType 
        ? { ...doc, file: null, uploaded: false }
        : doc
    ) || []

    onUpdate({ documents: updatedDocuments })
  }

  const hasRequiredDocuments = requiredDocs.every(docType => 
    data.documents?.some(doc => doc.type === docType && doc.file)
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
        <p className="text-sm text-slate-600">
          Upload the required documents to support your verification request.
        </p>
      </div>

      <div className="space-y-4">
        {requiredDocs.map((docType) => {
          const document = data.documents?.find(doc => doc.type === docType)

          return (
            <Card key={docType} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium capitalize">
                    {docType.replace('_', ' ')} *
                  </h4>
                  <p className="text-sm text-slate-600">
                    Upload your {docType.replace('_', ' ').toLowerCase()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {document?.file ? (
                    <>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{document.file.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDocument(docType)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id={`file-${docType}`}
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(docType, file)
                          }
                        }}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <label htmlFor={`file-${docType}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          asChild
                        >
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}

        {!hasRequiredDocuments && (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Please upload all required documents to continue.</span>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!hasRequiredDocuments || isSubmitting}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ReviewStep({ 
  data, 
  onPrev, 
  credentialType, 
  isSubmitting, 
  onSubmit 
}: StepProps & { onSubmit: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
        <p className="text-sm text-slate-600">
          Please review your verification request before submitting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{data.title}</CardTitle>
          <CardDescription>{credentialType.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-slate-600">{data.description}</p>
            </div>
          )}

          {data.institutionName && (
            <div>
              <Label className="text-sm font-medium">Institution</Label>
              <p className="text-sm text-slate-600">
                {data.institutionName}
                {data.institutionCountry && `, ${data.institutionCountry}`}
              </p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Duration</Label>
            <p className="text-sm text-slate-600">
              {data.startDate} - {data.isCurrent ? 'Present' : data.endDate}
            </p>
          </div>

          {data.documents && data.documents.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Documents</Label>
              <div className="space-y-1">
                {data.documents.filter(doc => doc.file).map((doc) => (
                  <div key={doc.type} className="flex items-center space-x-2 text-sm text-slate-600">
                    <FileText className="h-3 w-3" />
                    <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                    <span>- {doc.file?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your request will be reviewed by our verification team</li>
          <li>• Processing typically takes 3-5 business days</li>
          <li>• You'll receive email updates on the status</li>
          <li>• Once approved, your verification badge will appear on your profile</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </div>
  )
} 