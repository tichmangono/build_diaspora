# BuildDiaspora Zimbabwe - API Documentation

## Overview

The BuildDiaspora Zimbabwe platform provides a comprehensive REST API for authentication, professional verification, email notifications, and data privacy management. All API endpoints are built with Next.js 15 App Router and follow REST conventions.

## Base URL

- **Development**: `http://localhost:3003/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via Supabase Auth. Include the authorization header in your requests:

```http
Authorization: Bearer <access_token>
```

### Authentication Flow

1. **Sign Up**: Use Supabase Auth client-side SDK
2. **Sign In**: Use Supabase Auth client-side SDK  
3. **Get User**: Server-side validation via `createRouteHandlerClient`
4. **Refresh Token**: Handled automatically by Supabase

## Rate Limiting

- **Email API**: 5 requests per minute per user
- **Verification API**: Standard rate limiting applied
- **Admin API**: Higher limits for admin users

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## API Endpoints

### 🔐 Authentication

#### Example Registration Handler
**Endpoint**: `POST /api/auth/example`
**Description**: Example secure registration with input sanitization
**Authentication**: Not required (example endpoint)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "confirmPassword": "securePassword123!",
  "fullName": "John Doe",
  "profession": "Software Engineer",
  "location": "Harare, Zimbabwe"
}
```

**Response**:
```json
{
  "message": "Registration data processed successfully",
  "user": {
    "email": "user@example.com",
    "fullName": "John Doe",
    "profession": "Software Engineer",
    "location": "Harare, Zimbabwe"
  }
}
```

---

### 📧 Email System

#### Send Email
**Endpoint**: `POST /api/email/send`
**Description**: Send various types of authentication emails
**Authentication**: Required (bypassed in development)
**Rate Limit**: 5 requests per minute per user

**Request Body**:
```json
{
  "type": "welcome|verification|password_reset|password_changed|login_alert|verification_submitted|verification_approved|verification_rejected",
  "data": {
    "user": {
      "name": "John Doe",
      "email": "user@example.com"
    },
    "verificationLink": "https://app.com/verify?token=...", // For verification emails
    "resetLink": "https://app.com/reset?token=...", // For password reset
    "expirationTime": "2024-01-20T10:00:00Z",
    "ipAddress": "192.168.1.1", // For security alerts
    "location": "Harare, Zimbabwe",
    "userAgent": "Mozilla/5.0...",
    "verificationDetails": { // For verification status emails
      "credentialType": "Education",
      "institutionName": "University of Zimbabwe",
      "reviewerNotes": "Verified successfully"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_12345",
  "provider": "mock",
  "error": null
}
```

#### Email Service Statistics
**Endpoint**: `GET /api/email/send`
**Description**: Get email service health and statistics
**Authentication**: Not required

**Response**:
```json
{
  "stats": {
    "totalSent": 150,
    "totalFailed": 2,
    "successRate": 98.67
  },
  "connection": {
    "status": "healthy",
    "provider": "mock"
  },
  "supportedTypes": [
    "welcome",
    "verification",
    "password_reset",
    "password_changed",
    "login_alert",
    "verification_submitted",
    "verification_approved",
    "verification_rejected"
  ]
}
```

---

### ✅ Professional Verification

#### Submit Verification Request
**Endpoint**: `POST /api/verification/request`
**Description**: Submit a new professional verification request
**Authentication**: Required

**Request Body**:
```json
{
  "credentialTypeId": "1",
  "title": "BSc Computer Science",
  "description": "Bachelor's degree in Computer Science",
  "institutionName": "University of Zimbabwe",
  "institutionCountry": "Zimbabwe",
  "startDate": "2018-09-01",
  "endDate": "2022-06-30",
  "isCurrent": false,
  "supportingInfo": "Graduated with First Class Honours",
  "verificationData": {
    "graduationYear": "2022",
    "gpa": "4.0",
    "honors": "First Class"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "req_12345",
    "title": "BSc Computer Science",
    "description": "Bachelor's degree in Computer Science",
    "status": "pending",
    "submitted_at": "2024-01-15T10:00:00Z",
    "credential_type": {
      "id": "1",
      "name": "Education Verification",
      "type": "education",
      "description": "Academic qualifications and degrees"
    }
  }
}
```

#### Get User Verification Requests
**Endpoint**: `GET /api/verification/request`
**Description**: Get user's verification requests with filtering
**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status (pending, under_review, approved, rejected)
- `credentialType` - Filter by credential type
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "req_12345",
      "title": "BSc Computer Science",
      "description": "Bachelor's degree in Computer Science",
      "status": "approved",
      "submitted_at": "2024-01-15T10:00:00Z",
      "reviewed_at": "2024-01-20T14:30:00Z",
      "review_notes": "Credentials verified successfully",
      "verification_score": 95,
      "credential_type": {
        "id": "1",
        "name": "Education Verification",
        "type": "education"
      },
      "documents": [
        {
          "id": "doc_123",
          "document_type": "diploma",
          "file_name": "BSc_Diploma.pdf",
          "file_size": 2048000,
          "uploaded_at": "2024-01-15T10:05:00Z"
        }
      ],
      "badge": {
        "id": "badge_456",
        "title": "Computer Science Degree",
        "verification_level": "expert",
        "issued_at": "2024-01-20T14:30:00Z",
        "is_public": true
      }
    }
  ]
}
```

#### Upload Verification Documents
**Endpoint**: `POST /api/verification/documents`
**Description**: Upload supporting documents for verification
**Authentication**: Required
**Content-Type**: `multipart/form-data`

**Form Data**:
- `verificationRequestId` - ID of the verification request
- `documentType` - Type of document (diploma, certificate, transcript, etc.)
- `files` - File uploads (max 5 files, 10MB each)

**Supported File Types**:
- PDF (`application/pdf`)
- Images (`image/jpeg`, `image/png`, `image/webp`)
- Word Documents (`application/msword`, `.docx`)

**Response**:
```json
{
  "success": true,
  "data": {
    "uploadedFiles": [
      {
        "id": "doc_123",
        "fileName": "diploma.pdf",
        "fileSize": 2048000,
        "documentType": "diploma",
        "uploadedAt": "2024-01-15T10:05:00Z"
      }
    ],
    "verificationRequestId": "req_12345"
  }
}
```

#### Get Verification History
**Endpoint**: `GET /api/verification/history`
**Description**: Get user's complete verification history
**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status
- `type` - Filter by credential type
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "req_123",
      "title": "BSc Computer Science",
      "status": "approved",
      "verification_score": 98,
      "verification_level": "expert",
      "submitted_at": "2024-01-10T14:30:00Z",
      "reviewed_at": "2024-01-15T10:00:00Z",
      "credential_type": {
        "type": "education",
        "name": "Education Verification"
      },
      "badge": {
        "title": "Computer Science Degree",
        "issued_at": "2024-01-15T10:00:00Z",
        "is_public": true
      }
    }
  ],
  "stats": {
    "total": 3,
    "approved": 2,
    "pending": 1,
    "rejected": 0,
    "badges_earned": 2,
    "average_score": 94
  },
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Get User Badges
**Endpoint**: `GET /api/verification/badges`
**Description**: Get user's verification badges
**Authentication**: Required for private badges

**Query Parameters**:
- `userId` - Target user ID (optional, defaults to current user)
- `public` - Show only public badges (true/false)
- `type` - Filter by credential type
- `limit` - Number of results (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "badge_123",
      "title": "Computer Science Expert",
      "description": "Verified Bachelor's degree in Computer Science",
      "verification_level": "expert",
      "verification_score": 98,
      "issued_at": "2024-01-15T10:00:00Z",
      "is_public": true,
      "credential_type": "education",
      "institution": "University of Zimbabwe"
    }
  ]
}
```

---

### 🛡️ Admin Verification Management

#### Get Verification Queue
**Endpoint**: `GET /api/verification/admin/queue`
**Description**: Get verification requests queue for admin review
**Authentication**: Required (Admin role)

**Query Parameters**:
- `status` - Filter by status
- `credentialType` - Filter by type
- `assignedTo` - Filter by assigned reviewer
- `priority` - Filter by priority
- `dateFrom` - Filter by date range
- `dateTo` - Filter by date range
- `query` - Search term
- `limit` - Results limit (default: 50)
- `offset` - Pagination offset

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "req_123",
      "title": "BSc Computer Science",
      "status": "pending",
      "priority": "medium",
      "submitted_at": "2024-01-15T10:00:00Z",
      "user": {
        "id": "user_456",
        "full_name": "John Doe",
        "email": "john.doe@example.com"
      },
      "credential_type": {
        "type": "education",
        "name": "Education Verification"
      },
      "documents": [
        {
          "document_type": "diploma",
          "file_name": "BSc_Diploma.pdf",
          "file_size": 2048000
        }
      ],
      "assigned_to": null,
      "estimated_completion": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "summary": {
    "pending": 15,
    "under_review": 8,
    "overdue": 2
  }
}
```

#### Update Verification Status
**Endpoint**: `POST /api/verification/admin/status`
**Description**: Update status of a verification request
**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "requestId": "req_123",
  "status": "approved",
  "reviewNotes": "Credentials verified successfully",
  "verificationScore": 95,
  "assignedTo": "admin_456",
  "rejectionReason": null
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "req_123",
    "status": "approved",
    "reviewedBy": "admin_456",
    "reviewedAt": "2024-01-20T14:30:00Z",
    "badge": {
      "id": "badge_789",
      "title": "Professional Verification",
      "verification_level": "expert",
      "issued_at": "2024-01-20T14:30:00Z",
      "is_public": true,
      "verification_score": 95
    }
  }
}
```

#### Bulk Status Update
**Endpoint**: `PUT /api/verification/admin/status`
**Description**: Update multiple verification requests
**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "requestIds": ["req_123", "req_456", "req_789"],
  "status": "under_review",
  "reviewNotes": "Batch assigned for review",
  "assignedTo": "admin_456"
}
```

#### Get Admin Statistics
**Endpoint**: `GET /api/verification/admin/statistics`
**Description**: Get verification system statistics
**Authentication**: Required (Admin role)

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_requests": 1250,
      "pending": 45,
      "under_review": 23,
      "approved": 1089,
      "rejected": 93
    },
    "performance": {
      "average_processing_time_hours": 72,
      "approval_rate": 92.1,
      "current_queue_size": 68
    },
    "trends": {
      "requests_this_week": 15,
      "requests_last_week": 12,
      "growth_rate": 25.0
    }
  }
}
```

---

### 🔒 Privacy & Data Management

#### Request Data Deletion
**Endpoint**: `POST /api/privacy/delete-data`
**Description**: Request user data deletion (GDPR compliance)
**Authentication**: Required

**Request Body**:
```json
{
  "deletionType": "soft" // or "hard"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "del_123",
    "deletionType": "soft",
    "status": "pending",
    "estimatedCompletion": "2024-01-22T10:00:00Z",
    "requestedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## Error Codes

### Authentication Errors
- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Invalid data format

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `QUOTA_EXCEEDED` - Daily/monthly quota exceeded

### Business Logic Errors
- `DUPLICATE_REQUEST` - Resource already exists
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `OPERATION_NOT_ALLOWED` - Operation not permitted

### System Errors
- `INTERNAL_ERROR` - Internal server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `DATABASE_ERROR` - Database operation failed

---

## Development Notes

### Mock Data
In development mode, most endpoints return mock data for testing purposes. This allows frontend development without requiring a complete backend setup.

### Environment Variables
Required environment variables for production:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Email provider keys (SMTP, Resend, SendGrid, etc.)

### Security Features
- Input sanitization on all endpoints
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration
- Secure file upload validation

---

## Support

For API support and questions:
- **Email**: api-support@builddiaspora.zw
- **Documentation**: [Full API Docs](https://docs.builddiaspora.zw)
- **Status Page**: [API Status](https://status.builddiaspora.zw) 