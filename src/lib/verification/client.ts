import { createClient } from '@/lib/supabase/client'
import type { 
  VerificationRequest, 
  VerificationStatus,
  CredentialType,
  DocumentUpload,
  VerificationSearch 
} from '@/lib/validations/verification'

export interface VerificationRequestWithDetails extends VerificationRequest {
  id: string
  userId: string
  status: VerificationStatus
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  verificationScore?: number
  credentialType: {
    id: string
    name: string
    type: CredentialType
    description?: string
  }
  documents: {
    id: string
    documentType: string
    fileName: string
    fileSize: number
    uploadedAt: string
  }[]
  badge?: {
    id: string
    title: string
    description?: string
    verificationLevel: string
    issuedAt: string
    expiresAt?: string
    isPublic: boolean
  }
}

export interface CredentialTypeOption {
  id: string
  name: string
  type: CredentialType
  description?: string
  isActive: boolean
  requiredDocuments: string[]
  estimatedProcessingDays: number
}

export interface VerificationStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageProcessingTime: number
  verificationRate: number
}

// Mock data for development
const mockCredentialTypes: CredentialTypeOption[] = [
  {
    id: '1',
    name: 'Education Verification',
    type: 'education',
    description: 'Verify your educational qualifications, degrees, and academic achievements',
    isActive: true,
    requiredDocuments: ['diploma', 'transcript'],
    estimatedProcessingDays: 5
  },
  {
    id: '2',
    name: 'Employment Verification',
    type: 'employment',
    description: 'Verify your work experience, current employment, and professional history',
    isActive: true,
    requiredDocuments: ['employment_letter', 'reference_letter'],
    estimatedProcessingDays: 3
  },
  {
    id: '3',
    name: 'Professional Certification',
    type: 'certification',
    description: 'Verify professional certifications, licenses, and industry credentials',
    isActive: true,
    requiredDocuments: ['certificate'],
    estimatedProcessingDays: 7
  },
  {
    id: '4',
    name: 'Skills Assessment',
    type: 'skills',
    description: 'Verify your technical skills, competencies, and expertise level',
    isActive: true,
    requiredDocuments: ['certificate', 'portfolio'],
    estimatedProcessingDays: 10
  }
]

const mockVerificationRequests: VerificationRequestWithDetails[] = [
  {
    id: '1',
    userId: 'mock-user-id',
    credentialTypeId: '1',
    title: 'BSc Computer Science - University of Zimbabwe',
    description: 'Bachelor of Science degree in Computer Science',
    status: 'pending',
    submittedAt: '2024-01-15T10:00:00Z',
    credentialType: {
      id: '1',
      name: 'Education Verification',
      type: 'education',
      description: 'Educational qualifications verification'
    },
    documents: [
      {
        id: '1',
        documentType: 'diploma',
        fileName: 'BSc_Diploma.pdf',
        fileSize: 2048000,
        uploadedAt: '2024-01-15T10:05:00Z'
      }
    ]
  }
]

// Mock badge data for development
const mockVerificationBadges = [
  {
    id: '1',
    title: 'Software Engineer',
    description: 'Verified professional software engineer with 5+ years experience',
    credentialType: 'employment' as const,
    verificationLevel: 'premium' as const,
    issuedAt: '2024-01-15T10:00:00Z',
    isPublic: true,
    verificationScore: 95,
    issuerName: 'BuildDiaspora Verification',
    documentCount: 3
  },
  {
    id: '2',
    title: 'Computer Science Degree',
    description: 'Bachelor of Science in Computer Science from University of Zimbabwe',
    credentialType: 'education' as const,
    verificationLevel: 'expert' as const,
    issuedAt: '2024-02-01T14:30:00Z',
    isPublic: true,
    verificationScore: 98,
    issuerName: 'BuildDiaspora Verification',
    documentCount: 2
  },
  {
    id: '3',
    title: 'AWS Solutions Architect',
    description: 'AWS Certified Solutions Architect - Professional',
    credentialType: 'certification' as const,
    verificationLevel: 'expert' as const,
    issuedAt: '2024-02-15T09:15:00Z',
    isPublic: true,
    verificationScore: 92,
    issuerName: 'BuildDiaspora Verification',
    documentCount: 1
  },
  {
    id: '4',
    title: 'React Development',
    description: 'Advanced React development skills assessment',
    credentialType: 'skills' as const,
    verificationLevel: 'basic' as const,
    issuedAt: '2024-03-01T16:45:00Z',
    isPublic: true,
    verificationScore: 88,
    issuerName: 'BuildDiaspora Verification',
    documentCount: 1
  }
]

const isDevelopment = process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

class VerificationClient {
  private supabase = createClient()
  private baseUrl = '/api/verification'

  // Get available credential types
  async getCredentialTypes(): Promise<CredentialTypeOption[]> {
    if (isDevelopment) {
      // Return mock data in development
      console.log('🔧 Development mode: Using mock credential types')
      return Promise.resolve(mockCredentialTypes)
    }

    const { data, error } = await this.supabase
      .from('credential_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw new Error(`Failed to fetch credential types: ${error.message}`)
    return data || []
  }

  // Submit verification request
  async submitVerificationRequest(request: VerificationRequest): Promise<string> {
    if (isDevelopment) {
      console.log('🔧 Development mode: Mock verification request submitted', request)
      return Promise.resolve('mock-request-id-' + Date.now())
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('verification_requests')
      .insert({
        user_id: user.id,
        credential_type_id: request.credentialTypeId,
        title: request.title,
        description: request.description,
        institution_name: request.institutionName,
        institution_country: request.institutionCountry,
        start_date: request.startDate,
        end_date: request.endDate,
        is_current: request.isCurrent,
        supporting_info: request.supportingInfo,
        verification_data: request.verificationData,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to submit verification request: ${error.message}`)
    return data.id
  }

  // Upload document for verification request
  async uploadDocument(
    verificationRequestId: string, 
    file: File, 
    documentType: string
  ): Promise<string> {
    if (isDevelopment) {
      console.log('🔧 Development mode: Mock document upload', { verificationRequestId, fileName: file.name, documentType })
      return Promise.resolve('mock-document-id-' + Date.now())
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${verificationRequestId}/${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`)

    // Save document record
    const { data, error } = await this.supabase
      .from('verification_documents')
      .insert({
        verification_request_id: verificationRequestId,
        document_type: documentType,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type
      })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to save document record: ${error.message}`)
    return data.id
  }

  // Get user's verification requests
  async getUserVerificationRequests(
    search?: Partial<VerificationSearch>
  ): Promise<VerificationRequestWithDetails[]> {
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock verification requests')
      return Promise.resolve(mockVerificationRequests)
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = this.supabase
      .from('verification_request_details')
      .select(`
        *,
        credential_type:credential_types(*),
        documents:verification_documents(*),
        badge:verification_badges(*)
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (search?.status) {
      query = query.eq('status', search.status)
    }
    if (search?.credentialType) {
      query = query.eq('credential_type.type', search.credentialType)
    }
    if (search?.dateFrom) {
      query = query.gte('submitted_at', search.dateFrom)
    }
    if (search?.dateTo) {
      query = query.lte('submitted_at', search.dateTo)
    }
    if (search?.query) {
      query = query.or(`title.ilike.%${search.query}%,description.ilike.%${search.query}%`)
    }

    // Apply pagination
    const page = search?.page || 1
    const limit = search?.limit || 20
    const offset = (page - 1) * limit

    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch verification requests: ${error.message}`)
    return data || []
  }

  // Get single verification request
  async getVerificationRequest(id: string): Promise<VerificationRequestWithDetails | null> {
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock verification request for ID:', id)
      return Promise.resolve(mockVerificationRequests[0] || null)
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('verification_request_details')
      .select(`
        *,
        credential_type:credential_types(*),
        documents:verification_documents(*),
        badge:verification_badges(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch verification request: ${error.message}`)
    }

    return data
  }

  // Get user's verification statistics
  async getUserVerificationStats(): Promise<VerificationStats> {
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock verification stats')
      return Promise.resolve({
        totalRequests: 4,
        pendingRequests: 1,
        approvedRequests: 3,
        rejectedRequests: 0,
        averageProcessingTime: 5.2,
        verificationRate: 100
      })
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('verification_requests')
      .select('status, submitted_at, reviewed_at')
      .eq('user_id', user.id)

    if (error) throw new Error(`Failed to fetch verification stats: ${error.message}`)

    const stats = data.reduce((acc, req) => {
      acc.totalRequests++
      switch (req.status) {
        case 'pending':
          acc.pendingRequests++
          break
        case 'approved':
          acc.approvedRequests++
          break
        case 'rejected':
          acc.rejectedRequests++
          break
      }
      return acc
    }, {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      averageProcessingTime: 0,
      verificationRate: 0
    })

    stats.verificationRate = stats.totalRequests > 0 
      ? (stats.approvedRequests / stats.totalRequests) * 100 
      : 0

    return stats
  }

  // Get user's verification badges
  async getUserBadges(): Promise<typeof mockVerificationBadges> {
    if (isDevelopment) {
      console.log('🔧 Development mode: Using mock verification badges')
      return Promise.resolve(mockVerificationBadges)
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('verification_badges')
      .select(`
        id,
        title,
        description,
        verification_level,
        issued_at,
        expires_at,
        is_public,
        verification_score,
        issuer_name,
        credential_types!inner(type)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('issued_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch verification badges: ${error.message}`)

    return data?.map(badge => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      credentialType: badge.credential_types.type,
      verificationLevel: badge.verification_level,
      issuedAt: badge.issued_at,
      expiresAt: badge.expires_at,
      isPublic: badge.is_public,
      verificationScore: badge.verification_score,
      issuerName: badge.issuer_name,
      documentCount: 1 // This would need to be calculated from related documents
    })) || []
  }

  // Cancel verification request (if pending)
  async cancelVerificationRequest(id: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await this.supabase
      .from('verification_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (error) throw new Error(`Failed to cancel verification request: ${error.message}`)
  }

  // Resubmit verification request (if rejected)
  async resubmitVerificationRequest(
    id: string, 
    updates: Partial<VerificationRequest>
  ): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await this.supabase
      .from('verification_requests')
      .update({
        ...updates,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        review_notes: null
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'rejected')

    if (error) throw new Error(`Failed to resubmit verification request: ${error.message}`)
  }

  // Get document download URL
  async getDocumentDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('verification-documents')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) throw new Error(`Failed to get download URL: ${error.message}`)
    return data.signedUrl
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get document details first
    const { data: document, error: fetchError } = await this.supabase
      .from('verification_documents')
      .select('file_path, verification_request_id')
      .eq('id', documentId)
      .single()

    if (fetchError) throw new Error(`Failed to fetch document: ${fetchError.message}`)

    // Verify user owns the verification request
    const { data: request, error: requestError } = await this.supabase
      .from('verification_requests')
      .select('user_id')
      .eq('id', document.verification_request_id)
      .eq('user_id', user.id)
      .single()

    if (requestError) throw new Error('Unauthorized to delete this document')

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from('verification-documents')
      .remove([document.file_path])

    if (storageError) throw new Error(`Failed to delete file: ${storageError.message}`)

    // Delete record
    const { error: deleteError } = await this.supabase
      .from('verification_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) throw new Error(`Failed to delete document record: ${deleteError.message}`)
  }

  // Real-time subscription for verification updates
  subscribeToVerificationUpdates(
    userId: string,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel('verification_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Admin functions
  async getAllVerificationRequests(filters?: {
    status?: string
    credentialType?: string
    dateFrom?: string
    dateTo?: string
    assignedTo?: string
    query?: string
    limit?: number
    offset?: number
  }): Promise<VerificationRequestWithDetails[]> {
    let query = this.supabase
      .from('verification_request_details')
      .select(`
        *,
        credential_type:credential_types(*),
        documents:verification_documents(*),
        user_profile:user_profiles(
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .order('submitted_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.credentialType) {
      query = query.eq('credential_type.type', filters.credentialType)
    }

    if (filters?.dateFrom) {
      query = query.gte('submitted_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('submitted_at', filters.dateTo)
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch verification requests: ${error.message}`)
    return data || []
  }

  async updateVerificationStatus(
    requestId: string,
    status: 'approved' | 'rejected' | 'under_review',
    reviewNotes?: string,
    reviewerId?: string
  ): Promise<VerificationRequestWithDetails> {
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    }

    if (reviewNotes) {
      updateData.review_notes = reviewNotes
    }

    if (reviewerId) {
      updateData.reviewed_by = reviewerId
    }

    const { data, error } = await this.supabase
      .from('verification_requests')
      .update(updateData)
      .eq('id', requestId)
      .select(`
        *,
        credential_type:credential_types(*),
        documents:verification_documents(*)
      `)
      .single()

    if (error) throw new Error(`Failed to update verification status: ${error.message}`)

    // Create audit log entry
    await this.createAuditLogEntry(requestId, status, reviewNotes, reviewerId)

    return data
  }

  async bulkUpdateVerificationStatus(
    requestIds: string[],
    status: 'approved' | 'rejected' | 'under_review',
    reviewNotes?: string,
    reviewerId?: string
  ): Promise<VerificationRequestWithDetails[]> {
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    }

    if (reviewNotes) {
      updateData.review_notes = reviewNotes
    }

    if (reviewerId) {
      updateData.reviewed_by = reviewerId
    }

    const { data, error } = await this.supabase
      .from('verification_requests')
      .update(updateData)
      .in('id', requestIds)
      .select()

    if (error) throw new Error(`Failed to bulk update verification status: ${error.message}`)

    // Create audit log entries for each request
    for (const requestId of requestIds) {
      await this.createAuditLogEntry(requestId, status, reviewNotes, reviewerId)
    }

    return data || []
  }

  async assignVerificationRequest(requestId: string, assignedTo: string): Promise<VerificationRequestWithDetails> {
    const { data, error } = await this.supabase
      .from('verification_requests')
      .update({
        assigned_to: assignedTo,
        status: 'under_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw new Error(`Failed to assign verification request: ${error.message}`)

    await this.createAuditLogEntry(requestId, 'assigned', `Assigned to user ${assignedTo}`)

    return data
  }

  async getVerificationStatistics(): Promise<{
    total: number
    pending: number
    under_review: number
    approved: number
    rejected: number
    expired: number
    revoked: number
    avgProcessingTime: number
  }> {
    const { data, error } = await this.supabase
      .from('verification_requests')
      .select('status, submitted_at, reviewed_at')

    if (error) throw new Error(`Failed to fetch verification statistics: ${error.message}`)

    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      under_review: data.filter(r => r.status === 'under_review').length,
      approved: data.filter(r => r.status === 'approved').length,
      rejected: data.filter(r => r.status === 'rejected').length,
      expired: data.filter(r => r.status === 'expired').length,
      revoked: data.filter(r => r.status === 'revoked').length,
      avgProcessingTime: this.calculateAverageProcessingTime(data),
    }

    return stats
  }

  private async createAuditLogEntry(
    requestId: string,
    action: string,
    notes?: string,
    performedBy?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('verification_audit_log')
      .insert({
        request_id: requestId,
        action,
        notes,
        performed_by: performedBy,
        performed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Failed to create audit log entry:', error)
    }
  }

  private calculateAverageProcessingTime(requests: any[]): number {
    const processedRequests = requests.filter(r => 
      r.reviewed_at && r.submitted_at && 
      (r.status === 'approved' || r.status === 'rejected')
    )

    if (processedRequests.length === 0) return 0

    const totalTime = processedRequests.reduce((sum, request) => {
      const submitted = new Date(request.submitted_at).getTime()
      const reviewed = new Date(request.reviewed_at).getTime()
      return sum + (reviewed - submitted)
    }, 0)

    const avgTimeMs = totalTime / processedRequests.length
    return Math.round(avgTimeMs / (1000 * 60 * 60 * 24)) // Convert to days
  }

  // API Integration Methods
  
  // Submit verification request via API
  async submitVerificationRequestAPI(request: VerificationRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit verification request')
      }

      const result = await response.json()
      return result.data.id
    } catch (error) {
      console.error('Error submitting verification request:', error)
      throw error
    }
  }

  // Upload documents via API
  async uploadDocumentsAPI(
    verificationRequestId: string,
    files: File[],
    documentType: string
  ): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('verificationRequestId', verificationRequestId)
      formData.append('documentType', documentType)
      
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${this.baseUrl}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload documents')
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading documents:', error)
      throw error
    }
  }

  // Get verification badges via API
  async getVerificationBadgesAPI(params?: {
    userId?: string
    public?: boolean
    type?: string
    limit?: number
  }): Promise<any> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.userId) searchParams.append('userId', params.userId)
      if (params?.public !== undefined) searchParams.append('public', params.public.toString())
      if (params?.type) searchParams.append('type', params.type)
      if (params?.limit) searchParams.append('limit', params.limit.toString())

      const response = await fetch(`${this.baseUrl}/badges?${searchParams}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch verification badges')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching verification badges:', error)
      throw error
    }
  }

  // Get verification history via API
  async getVerificationHistoryAPI(params?: {
    status?: string
    type?: string
    limit?: number
    offset?: number
  }): Promise<any> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.type) searchParams.append('type', params.type)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())

      const response = await fetch(`${this.baseUrl}/history?${searchParams}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch verification history')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching verification history:', error)
      throw error
    }
  }

  // Admin API methods
  
  // Get admin verification queue via API
  async getAdminVerificationQueueAPI(params?: {
    status?: string
    credentialType?: string
    assignedTo?: string
    query?: string
    limit?: number
    offset?: number
  }): Promise<any> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.credentialType) searchParams.append('credentialType', params.credentialType)
      if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo)
      if (params?.query) searchParams.append('query', params.query)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())

      const response = await fetch(`${this.baseUrl}/admin/queue?${searchParams}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch admin verification queue')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching admin verification queue:', error)
      throw error
    }
  }

  // Update verification status via API
  async updateVerificationStatusAPI(data: {
    requestId: string
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_more_info'
    reviewNotes?: string
    verificationScore?: number
    assignedTo?: string
    rejectionReason?: string
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update verification status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating verification status:', error)
      throw error
    }
  }

  // Get admin statistics via API
  async getAdminStatisticsAPI(params?: {
    period?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<any> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.period) searchParams.append('period', params.period)
      if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom)
      if (params?.dateTo) searchParams.append('dateTo', params.dateTo)

      const response = await fetch(`${this.baseUrl}/admin/statistics?${searchParams}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch admin statistics')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching admin statistics:', error)
      throw error
    }
  }
}

// Export singleton instance
export const verificationClient = new VerificationClient()
export default verificationClient 