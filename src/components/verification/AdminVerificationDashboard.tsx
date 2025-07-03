'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Download, 
  User, 
  Calendar,
  AlertCircle,
  MoreHorizontal,
  Archive,
  Flag
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { 
  type VerificationStatus,
  type CredentialType,
  verificationStatusSchema,
  credentialTypeSchema
} from '@/lib/validations/verification'
import { verificationClient, type VerificationRequestWithDetails } from '@/lib/verification/client'

interface AdminVerificationDashboardProps {
  className?: string
}

interface VerificationFilters {
  status?: VerificationStatus
  credentialType?: CredentialType
  dateFrom?: string
  dateTo?: string
  assignedTo?: string
  query?: string
}

interface VerificationStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  avgProcessingTime: number
}

export default function AdminVerificationDashboard({ className }: AdminVerificationDashboardProps) {
  const [requests, setRequests] = useState<VerificationRequestWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestWithDetails | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [filters, setFilters] = useState<VerificationFilters>({})
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    avgProcessingTime: 0
  })
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'assign' | null>(null)

  // Load verification requests
  const loadRequests = async () => {
    setLoading(true)
    try {
      // Load admin verification requests with filters
      const data = await verificationClient.getAllVerificationRequests(filters)
      setRequests(data)
      
      // Load statistics
      const statsData = await verificationClient.getVerificationStatistics()
      setStats({
        total: statsData.total,
        pending: statsData.pending,
        underReview: statsData.under_review,
        approved: statsData.approved,
        rejected: statsData.rejected,
        avgProcessingTime: statsData.avgProcessingTime
      })
    } catch (error) {
      toast.error('Failed to load verification requests')
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [filters])

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected', notes: string) => {
    try {
      await verificationClient.updateVerificationStatus(requestId, status, notes)
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status, reviewNotes: notes, reviewedAt: new Date().toISOString() }
          : req
      ))
      
      toast.success(`Verification request ${status}`)
      setShowReviewModal(false)
      setSelectedRequest(null)
      
      // Reload data to get updated stats
      loadRequests()
    } catch (error) {
      toast.error('Failed to update verification status')
      console.error('Status update error:', error)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRequests.length === 0) return

    try {
      const status = bulkAction === 'approve' ? 'approved' : 'rejected'
      await verificationClient.bulkUpdateVerificationStatus(
        selectedRequests,
        status,
        `Bulk ${status} action`
      )
      
      toast.success(`Bulk action completed for ${selectedRequests.length} requests`)
      setSelectedRequests([])
      setBulkAction(null)
      loadRequests()
    } catch (error) {
      toast.error('Failed to perform bulk action')
      console.error('Bulk action error:', error)
    }
  }

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'revoked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'under_review': return <Eye className="h-4 w-4" />
      case 'approved': return <CheckCircle2 className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'expired': return <AlertCircle className="h-4 w-4" />
      case 'revoked': return <Flag className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Processing</p>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}d</p>
              </div>
              <Calendar className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search requests..."
                  value={filters.query || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as VerificationStatus || undefined }))}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            <div>
              <Label htmlFor="credentialType">Type</Label>
              <select
                id="credentialType"
                value={filters.credentialType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, credentialType: e.target.value as CredentialType || undefined }))}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="education">Education</option>
                <option value="certification">Certification</option>
                <option value="employment">Employment</option>
                <option value="skills">Skills</option>
                <option value="identity">Identity</option>
                <option value="business_registration">Business Registration</option>
                <option value="professional_license">Professional License</option>
                <option value="awards_recognition">Awards & Recognition</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedRequests.length} request(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkAction('approve')}
                    disabled={bulkAction !== null}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkAction('reject')}
                    disabled={bulkAction !== null}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkAction('assign')}
                    disabled={bulkAction !== null}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {bulkAction && (
                  <Button size="sm" onClick={handleBulkAction}>
                    Confirm {bulkAction}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRequests([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            Manage and review verification requests from community members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No verification requests found
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRequests(prev => [...prev, request.id])
                            } else {
                              setSelectedRequests(prev => prev.filter(id => id !== request.id))
                            }
                          }}
                          className="rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{request.title}</h3>
                            <Badge className={`${getStatusColor(request.status)} border-0`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                <span className="capitalize">{request.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                            <Badge variant="secondary">
                              {request.credentialType.name}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>User ID: {request.userId.slice(0, 8)}...</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{request.documents.length} document(s)</span>
                            </div>
                          </div>

                          {request.institutionName && (
                            <div className="mt-2 text-sm text-slate-600">
                              <span className="font-medium">Institution:</span> {request.institutionName}
                              {request.institutionCountry && `, ${request.institutionCountry}`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowReviewModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(request.id, 'approved', 'Quick approval')}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(request.id, 'rejected', 'Quick rejection')}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedRequest(null)
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

// Review Modal Component
interface ReviewModalProps {
  request: VerificationRequestWithDetails
  onClose: () => void
  onStatusUpdate: (requestId: string, status: 'approved' | 'rejected', notes: string) => Promise<void>
}

function ReviewModal({ request, onClose, onStatusUpdate }: ReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history'>('details')

  const handleSubmit = async (status: 'approved' | 'rejected') => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes')
      return
    }

    setSubmitting(true)
    try {
      await onStatusUpdate(request.id, status, reviewNotes)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{request.title}</h2>
              <p className="text-slate-600">{request.credentialType.name}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="flex gap-4 mt-4">
            {(['details', 'documents', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Institution</Label>
                  <p className="text-sm text-slate-600">
                    {request.institutionName || 'Not specified'}
                    {request.institutionCountry && `, ${request.institutionCountry}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-slate-600">
                    {request.startDate} - {request.isCurrent ? 'Present' : request.endDate || 'Not specified'}
                  </p>
                </div>
              </div>
              
              {request.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-slate-600">{request.description}</p>
                </div>
              )}

              {request.supportingInfo && (
                <div>
                  <Label className="text-sm font-medium">Supporting Information</Label>
                  <p className="text-sm text-slate-600">{request.supportingInfo}</p>
                </div>
              )}

              {request.verificationData && Object.keys(request.verificationData).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Additional Details</Label>
                  <pre className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                    {JSON.stringify(request.verificationData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {request.documents.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No documents uploaded</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium capitalize">
                              {doc.documentType.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-slate-600">{doc.fileName}</p>
                            <p className="text-sm text-slate-500">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Request Submitted</p>
                    <p className="text-sm text-slate-600">
                      {new Date(request.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {request.reviewedAt && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md">
                    <div className={`w-2 h-2 rounded-full ${
                      request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">
                        Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(request.reviewedAt).toLocaleString()}
                      </p>
                      {request.reviewNotes && (
                        <p className="text-sm text-slate-700 mt-1">{request.reviewNotes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {request.status === 'pending' && (
          <div className="p-6 border-t bg-slate-50">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reviewNotes">Review Notes *</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide detailed notes about your review decision..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('rejected')}
                  disabled={submitting}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleSubmit('approved')}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 