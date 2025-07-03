import { z } from 'zod'

// Enum schemas matching database types
export const verificationStatusSchema = z.enum([
  'pending',
  'under_review', 
  'approved',
  'rejected',
  'expired',
  'revoked'
])

export const credentialTypeSchema = z.enum([
  'education',
  'certification',
  'employment',
  'skills',
  'identity',
  'business_registration',
  'professional_license',
  'awards_recognition'
])

export const verificationLevelSchema = z.enum([
  'basic',
  'verified',
  'premium',
  'expert',
  'authority'
])

export const documentTypeSchema = z.enum([
  'diploma',
  'certificate',
  'transcript',
  'employment_letter',
  'id_document',
  'business_license',
  'portfolio',
  'reference_letter',
  'other'
])

// File validation schema
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(52428800, 'File size cannot exceed 50MB'),
  type: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ], { errorMap: () => ({ message: 'Invalid file type. Only PDF, JPG, PNG, WEBP, DOC, and DOCX files are allowed.' }) })
})

// Base verification request schema (without refinements)
const baseVerificationRequestSchema = z.object({
  credentialTypeId: z.string().uuid('Invalid credential type'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  institutionName: z.string()
    .max(200, 'Institution name cannot exceed 200 characters')
    .optional(),
  institutionCountry: z.string()
    .max(100, 'Country name cannot exceed 100 characters')
    .optional(),
  startDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid start date')
    .optional(),
  endDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid end date')
    .optional(),
  isCurrent: z.boolean().default(false),
  supportingInfo: z.string()
    .max(2000, 'Supporting information cannot exceed 2000 characters')
    .optional(),
  verificationData: z.record(z.any()).optional()
})

// Refined verification request schema with date validation
export const verificationRequestSchema = baseVerificationRequestSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate)
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
)

// Education-specific verification schema
export const educationVerificationSchema = baseVerificationRequestSchema.extend({
  verificationData: z.object({
    degreeType: z.enum(['associate', 'bachelor', 'master', 'doctorate', 'certificate', 'diploma']),
    fieldOfStudy: z.string().min(1, 'Field of study is required'),
    gpa: z.number().min(0).max(4).optional(),
    honors: z.string().optional(),
    accreditation: z.string().optional()
  }).optional()
})

// Employment verification schema
export const employmentVerificationSchema = baseVerificationRequestSchema.extend({
  verificationData: z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    department: z.string().optional(),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
    salary: z.number().positive().optional(),
    responsibilities: z.string().max(1000).optional(),
    supervisorName: z.string().optional(),
    supervisorEmail: z.string().email().optional()
  }).optional()
})

// Certification verification schema
export const certificationVerificationSchema = baseVerificationRequestSchema.extend({
  verificationData: z.object({
    certificationNumber: z.string().optional(),
    issuingOrganization: z.string().min(1, 'Issuing organization is required'),
    expiryDate: z.string()
      .refine((date) => !isNaN(Date.parse(date)), 'Invalid expiry date')
      .optional(),
    renewalRequired: z.boolean().default(false),
    certificationLevel: z.string().optional()
  }).optional()
})

// Skills verification schema
export const skillsVerificationSchema = baseVerificationRequestSchema.extend({
  verificationData: z.object({
    skillCategory: z.enum(['technical', 'soft', 'language', 'creative', 'analytical']),
    proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    yearsExperience: z.number().min(0).max(50),
    tools: z.array(z.string()).optional(),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      url: z.string().url().optional()
    })).optional()
  }).optional()
})

// Document upload schema
export const documentUploadSchema = z.object({
  verificationRequestId: z.string().uuid('Invalid verification request ID'),
  documentType: documentTypeSchema,
  file: fileValidationSchema
})

// Verification review schema (admin)
export const verificationReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNotes: z.string()
    .min(10, 'Review notes must be at least 10 characters')
    .max(1000, 'Review notes cannot exceed 1000 characters'),
  verificationScore: z.number()
    .min(0, 'Score cannot be less than 0')
    .max(100, 'Score cannot exceed 100')
    .optional()
})

// Badge configuration schema
export const badgeConfigSchema = z.object({
  badgeTitle: z.string().min(1, 'Badge title is required').max(200),
  badgeDescription: z.string().max(500).optional(),
  verificationLevel: verificationLevelSchema,
  expiresAt: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid expiry date')
    .optional(),
  isPublic: z.boolean().default(true)
})

// Multi-step form progress schema
export const verificationFormProgressSchema = z.object({
  currentStep: z.number().min(1).max(4),
  completedSteps: z.array(z.number()),
  formData: z.record(z.any())
})

// Search and filter schemas
export const verificationSearchSchema = z.object({
  query: z.string().optional(),
  status: verificationStatusSchema.optional(),
  credentialType: credentialTypeSchema.optional(),
  dateFrom: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid from date')
    .optional(),
  dateTo: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid to date')
    .optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

// Type exports
export type VerificationStatus = z.infer<typeof verificationStatusSchema>
export type CredentialType = z.infer<typeof credentialTypeSchema>
export type VerificationLevel = z.infer<typeof verificationLevelSchema>
export type DocumentType = z.infer<typeof documentTypeSchema>
export type VerificationRequest = z.infer<typeof verificationRequestSchema>
export type EducationVerification = z.infer<typeof educationVerificationSchema>
export type EmploymentVerification = z.infer<typeof employmentVerificationSchema>
export type CertificationVerification = z.infer<typeof certificationVerificationSchema>
export type SkillsVerification = z.infer<typeof skillsVerificationSchema>
export type DocumentUpload = z.infer<typeof documentUploadSchema>
export type VerificationReview = z.infer<typeof verificationReviewSchema>
export type BadgeConfig = z.infer<typeof badgeConfigSchema>
export type VerificationFormProgress = z.infer<typeof verificationFormProgressSchema>
export type VerificationSearch = z.infer<typeof verificationSearchSchema>

// Helper functions for validation
export function validateVerificationByType(
  type: CredentialType,
  data: any
): z.SafeParseResult<any> {
  switch (type) {
    case 'education':
      return educationVerificationSchema.safeParse(data)
    case 'employment':
      return employmentVerificationSchema.safeParse(data)
    case 'certification':
      return certificationVerificationSchema.safeParse(data)
    case 'skills':
      return skillsVerificationSchema.safeParse(data)
    default:
      return verificationRequestSchema.safeParse(data)
  }
}

export function getRequiredDocuments(credentialType: CredentialType): DocumentType[] {
  const documentMap: Record<CredentialType, DocumentType[]> = {
    education: ['diploma', 'transcript'],
    certification: ['certificate'],
    employment: ['employment_letter', 'reference_letter'],
    skills: ['certificate', 'portfolio'],
    identity: ['id_document'],
    business_registration: ['business_license'],
    professional_license: ['business_license', 'certificate'],
    awards_recognition: ['certificate', 'other']
  }
  
  return documentMap[credentialType] || []
}

export function getVerificationSteps(credentialType: CredentialType): string[] {
  const stepMap: Record<CredentialType, string[]> = {
    education: ['Basic Info', 'Institution Details', 'Documents', 'Review'],
    employment: ['Basic Info', 'Employment Details', 'Documents', 'Review'],
    certification: ['Basic Info', 'Certification Details', 'Documents', 'Review'],
    skills: ['Basic Info', 'Skills Assessment', 'Portfolio', 'Review'],
    identity: ['Basic Info', 'Identity Documents', 'Review'],
    business_registration: ['Basic Info', 'Business Details', 'Documents', 'Review'],
    professional_license: ['Basic Info', 'License Details', 'Documents', 'Review'],
    awards_recognition: ['Basic Info', 'Award Details', 'Documents', 'Review']
  }
  
  return stepMap[credentialType] || ['Basic Info', 'Details', 'Documents', 'Review']
} 