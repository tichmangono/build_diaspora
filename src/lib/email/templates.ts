import { emailConfig } from './config'

export interface EmailTemplateData {
  user: {
    name: string
    email: string
  }
  verificationLink?: string
  resetLink?: string
  loginLink?: string
  companyName?: string
  supportEmail?: string
  expirationTime?: string
  ipAddress?: string
  userAgent?: string
  location?: string
  verificationDetails?: {
    credentialType: string
    institutionName?: string
    status: string
    reviewerNotes?: string
  }
}

export class EmailTemplates {
  private static getBaseTemplate(content: string, title: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .content h2 {
            color: #1a202c;
            font-size: 20px;
            margin-bottom: 16px;
        }
        
        .content p {
            margin-bottom: 16px;
            color: #4a5568;
            line-height: 1.7;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .button:hover {
            transform: translateY(-1px);
        }
        
        .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .warning-box {
            background-color: #fffbf0;
            border-left: 4px solid #f6ad55;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #718096;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .button {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BuildDiaspora Zimbabwe</h1>
            <p>Connecting Zimbabwean Professionals Worldwide</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p>&copy; 2024 BuildDiaspora Zimbabwe. All rights reserved.</p>
            <p>
                <a href="${emailConfig.baseUrl}/privacy">Privacy Policy</a> | 
                <a href="${emailConfig.baseUrl}/terms">Terms of Service</a> | 
                <a href="${emailConfig.baseUrl}/contact">Contact Us</a>
            </p>
            <p>
                Need help? Contact us at 
                <a href="mailto:${emailConfig.replyTo}">${emailConfig.replyTo}</a>
            </p>
            <div class="social-links">
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
                <a href="#">Facebook</a>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  static welcomeEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const content = `
      <h2>Welcome to BuildDiaspora Zimbabwe! 🎉</h2>
      <p>Hello ${data.user.name},</p>
      <p>Welcome to BuildDiaspora Zimbabwe, the premier platform connecting Zimbabwean professionals worldwide. We're thrilled to have you join our growing community!</p>
      
      <div class="info-box">
        <p><strong>What's Next?</strong></p>
        <p>• Complete your professional profile</p>
        <p>• Verify your credentials to build trust</p>
        <p>• Connect with fellow Zimbabwean professionals</p>
        <p>• Explore opportunities and collaborations</p>
      </div>
      
      <a href="${emailConfig.baseUrl}/profile" class="button">Complete Your Profile</a>
      
      <p>If you have any questions or need assistance getting started, our support team is here to help.</p>
      <p>Welcome aboard!</p>
      <p><strong>The BuildDiaspora Zimbabwe Team</strong></p>
    `

    return {
      subject: 'Welcome to BuildDiaspora Zimbabwe! 🇿🇼',
      html: this.getBaseTemplate(content, 'Welcome to BuildDiaspora Zimbabwe'),
      text: `Welcome to BuildDiaspora Zimbabwe!\n\nHello ${data.user.name},\n\nWelcome to BuildDiaspora Zimbabwe, the premier platform connecting Zimbabwean professionals worldwide. We're thrilled to have you join our growing community!\n\nWhat's Next?\n• Complete your professional profile\n• Verify your credentials to build trust\n• Connect with fellow Zimbabwean professionals\n• Explore opportunities and collaborations\n\nComplete your profile: ${emailConfig.baseUrl}/profile\n\nIf you have any questions or need assistance getting started, our support team is here to help.\n\nWelcome aboard!\nThe BuildDiaspora Zimbabwe Team`
    }
  }

  static emailVerification(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const content = `
      <h2>Verify Your Email Address 📧</h2>
      <p>Hello ${data.user.name},</p>
      <p>Thank you for registering with BuildDiaspora Zimbabwe! To complete your account setup and ensure the security of your account, please verify your email address.</p>
      
      <a href="${data.verificationLink}" class="button">Verify Email Address</a>
      
      <div class="info-box">
        <p><strong>Security Information:</strong></p>
        <p>This verification link will expire in ${data.expirationTime || '24 hours'} for your security.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${data.verificationLink}</p>
      
      <p>Once verified, you'll be able to access all features of BuildDiaspora Zimbabwe and start connecting with professionals in your field.</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Team</strong></p>
    `

    return {
      subject: 'Please verify your email address',
      html: this.getBaseTemplate(content, 'Email Verification'),
      text: `Verify Your Email Address\n\nHello ${data.user.name},\n\nThank you for registering with BuildDiaspora Zimbabwe! To complete your account setup, please verify your email address by clicking this link:\n\n${data.verificationLink}\n\nThis verification link will expire in ${data.expirationTime || '24 hours'} for your security.\n\nIf you didn't create an account with us, please ignore this email.\n\nBest regards,\nThe BuildDiaspora Zimbabwe Team`
    }
  }

  static passwordReset(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const content = `
      <h2>Reset Your Password 🔒</h2>
      <p>Hello ${data.user.name},</p>
      <p>We received a request to reset the password for your BuildDiaspora Zimbabwe account. If you made this request, click the button below to reset your password.</p>
      
      <a href="${data.resetLink}" class="button">Reset Password</a>
      
      <div class="warning-box">
        <p><strong>Security Alert:</strong></p>
        <p>This password reset link will expire in ${data.expirationTime || '1 hour'} for your security.</p>
        <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
      </div>
      
      <div class="info-box">
        <p><strong>Request Details:</strong></p>
        <p>• Time: ${new Date().toLocaleString()}</p>
        ${data.ipAddress ? `<p>• IP Address: ${data.ipAddress}</p>` : ''}
        ${data.location ? `<p>• Location: ${data.location}</p>` : ''}
      </div>
      
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${data.resetLink}</p>
      
      <p>For your security, this link can only be used once. If you need to reset your password again, please request a new reset link.</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Team</strong></p>
    `

    return {
      subject: 'Reset your BuildDiaspora Zimbabwe password',
      html: this.getBaseTemplate(content, 'Password Reset'),
      text: `Reset Your Password\n\nHello ${data.user.name},\n\nWe received a request to reset the password for your BuildDiaspora Zimbabwe account. If you made this request, use this link to reset your password:\n\n${data.resetLink}\n\nThis password reset link will expire in ${data.expirationTime || '1 hour'} for your security.\n\nRequest Details:\n• Time: ${new Date().toLocaleString()}\n${data.ipAddress ? `• IP Address: ${data.ipAddress}\n` : ''}${data.location ? `• Location: ${data.location}\n` : ''}\n\nIf you didn't request this password reset, please ignore this email or contact our support team.\n\nBest regards,\nThe BuildDiaspora Zimbabwe Team`
    }
  }

  static passwordChanged(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const content = `
      <h2>Password Successfully Changed ✅</h2>
      <p>Hello ${data.user.name},</p>
      <p>This email confirms that the password for your BuildDiaspora Zimbabwe account has been successfully changed.</p>
      
      <div class="info-box">
        <p><strong>Change Details:</strong></p>
        <p>• Time: ${new Date().toLocaleString()}</p>
        ${data.ipAddress ? `<p>• IP Address: ${data.ipAddress}</p>` : ''}
        ${data.location ? `<p>• Location: ${data.location}</p>` : ''}
      </div>
      
      <div class="warning-box">
        <p><strong>Security Notice:</strong></p>
        <p>If you didn't make this change, please contact our support team immediately and consider the following:</p>
        <p>• Change your password again</p>
        <p>• Review your account activity</p>
        <p>• Enable two-factor authentication if available</p>
      </div>
      
      <a href="${emailConfig.baseUrl}/profile/security" class="button">Review Security Settings</a>
      
      <p>Your account security is important to us. If you have any concerns, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Team</strong></p>
    `

    return {
      subject: 'Your password has been changed',
      html: this.getBaseTemplate(content, 'Password Changed'),
      text: `Password Successfully Changed\n\nHello ${data.user.name},\n\nThis email confirms that the password for your BuildDiaspora Zimbabwe account has been successfully changed.\n\nChange Details:\n• Time: ${new Date().toLocaleString()}\n${data.ipAddress ? `• IP Address: ${data.ipAddress}\n` : ''}${data.location ? `• Location: ${data.location}\n` : ''}\n\nIf you didn't make this change, please contact our support team immediately.\n\nReview your security settings: ${emailConfig.baseUrl}/profile/security\n\nBest regards,\nThe BuildDiaspora Zimbabwe Team`
    }
  }

  static loginAlert(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const content = `
      <h2>New Login to Your Account 🔐</h2>
      <p>Hello ${data.user.name},</p>
      <p>We detected a new login to your BuildDiaspora Zimbabwe account. If this was you, you can safely ignore this email.</p>
      
      <div class="info-box">
        <p><strong>Login Details:</strong></p>
        <p>• Time: ${new Date().toLocaleString()}</p>
        ${data.ipAddress ? `<p>• IP Address: ${data.ipAddress}</p>` : ''}
        ${data.location ? `<p>• Location: ${data.location}</p>` : ''}
        ${data.userAgent ? `<p>• Device: ${data.userAgent}</p>` : ''}
      </div>
      
      <div class="warning-box">
        <p><strong>Didn't recognize this login?</strong></p>
        <p>If you didn't log in, your account may be compromised. Please take the following steps immediately:</p>
        <p>• Change your password</p>
        <p>• Review your account activity</p>
        <p>• Contact our support team</p>
      </div>
      
      <a href="${emailConfig.baseUrl}/profile/security" class="button">Secure My Account</a>
      
      <p>Your account security is our top priority. We recommend regularly reviewing your security settings and enabling additional security measures.</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Team</strong></p>
    `

    return {
      subject: 'New login to your BuildDiaspora Zimbabwe account',
      html: this.getBaseTemplate(content, 'Login Alert'),
      text: `New Login to Your Account\n\nHello ${data.user.name},\n\nWe detected a new login to your BuildDiaspora Zimbabwe account. If this was you, you can safely ignore this email.\n\nLogin Details:\n• Time: ${new Date().toLocaleString()}\n${data.ipAddress ? `• IP Address: ${data.ipAddress}\n` : ''}${data.location ? `• Location: ${data.location}\n` : ''}${data.userAgent ? `• Device: ${data.userAgent}\n` : ''}\n\nIf you didn't log in, please secure your account: ${emailConfig.baseUrl}/profile/security\n\nBest regards,\nThe BuildDiaspora Zimbabwe Team`
    }
  }

  static verificationSubmitted(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const { verificationDetails } = data
    const content = `
      <h2>Verification Request Submitted 📋</h2>
      <p>Hello ${data.user.name},</p>
      <p>Thank you for submitting your ${verificationDetails?.credentialType} verification request. We've received your application and our team will review it shortly.</p>
      
      <div class="info-box">
        <p><strong>Submission Details:</strong></p>
        <p>• Credential Type: ${verificationDetails?.credentialType}</p>
        ${verificationDetails?.institutionName ? `<p>• Institution: ${verificationDetails.institutionName}</p>` : ''}
        <p>• Submitted: ${new Date().toLocaleString()}</p>
        <p>• Status: Under Review</p>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <p>• Our verification team will review your submission</p>
      <p>• We may contact you if additional information is needed</p>
      <p>• You'll receive an email once the review is complete</p>
      <p>• Typical review time is 3-5 business days</p>
      
      <a href="${emailConfig.baseUrl}/verification/history" class="button">Track Your Request</a>
      
      <p>You can check the status of your verification request anytime by visiting your verification dashboard.</p>
      
      <p>Thank you for helping us build a trusted professional community!</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Verification Team</strong></p>
    `

    return {
      subject: `Your ${verificationDetails?.credentialType} verification has been submitted`,
      html: this.getBaseTemplate(content, 'Verification Submitted'),
      text: `Verification Request Submitted\n\nHello ${data.user.name},\n\nThank you for submitting your ${verificationDetails?.credentialType} verification request. We've received your application and our team will review it shortly.\n\nSubmission Details:\n• Credential Type: ${verificationDetails?.credentialType}\n${verificationDetails?.institutionName ? `• Institution: ${verificationDetails.institutionName}\n` : ''}• Submitted: ${new Date().toLocaleString()}\n• Status: Under Review\n\nWhat happens next?\n• Our verification team will review your submission\n• We may contact you if additional information is needed\n• You'll receive an email once the review is complete\n• Typical review time is 3-5 business days\n\nTrack your request: ${emailConfig.baseUrl}/verification/history\n\nBest regards,\nThe BuildDiaspora Zimbabwe Verification Team`
    }
  }

  static verificationApproved(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const { verificationDetails } = data
    const content = `
      <h2>Verification Approved! 🎉</h2>
      <p>Hello ${data.user.name},</p>
      <p>Congratulations! Your ${verificationDetails?.credentialType} verification has been approved. Your credential has been verified and a verification badge has been added to your profile.</p>
      
      <div class="info-box">
        <p><strong>Verification Details:</strong></p>
        <p>• Credential Type: ${verificationDetails?.credentialType}</p>
        ${verificationDetails?.institutionName ? `<p>• Institution: ${verificationDetails.institutionName}</p>` : ''}
        <p>• Approved: ${new Date().toLocaleString()}</p>
        <p>• Status: ✅ Verified</p>
      </div>
      
      <p><strong>What this means:</strong></p>
      <p>• Your profile now displays a verification badge</p>
      <p>• Increased trust and credibility with other professionals</p>
      <p>• Access to verified-only networking opportunities</p>
      <p>• Enhanced visibility in search results</p>
      
      <a href="${emailConfig.baseUrl}/profile/badges" class="button">View Your Badge</a>
      
      <p>Thank you for contributing to our trusted professional community. Consider verifying additional credentials to further enhance your profile!</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Verification Team</strong></p>
    `

    return {
      subject: `🎉 Your ${verificationDetails?.credentialType} verification has been approved!`,
      html: this.getBaseTemplate(content, 'Verification Approved'),
      text: `Verification Approved!\n\nHello ${data.user.name},\n\nCongratulations! Your ${verificationDetails?.credentialType} verification has been approved. Your credential has been verified and a verification badge has been added to your profile.\n\nVerification Details:\n• Credential Type: ${verificationDetails?.credentialType}\n${verificationDetails?.institutionName ? `• Institution: ${verificationDetails.institutionName}\n` : ''}• Approved: ${new Date().toLocaleString()}\n• Status: ✅ Verified\n\nWhat this means:\n• Your profile now displays a verification badge\n• Increased trust and credibility with other professionals\n• Access to verified-only networking opportunities\n• Enhanced visibility in search results\n\nView your badge: ${emailConfig.baseUrl}/profile/badges\n\nBest regards,\nThe BuildDiaspora Zimbabwe Verification Team`
    }
  }

  static verificationRejected(data: EmailTemplateData): { subject: string; html: string; text: string } {
    const { verificationDetails } = data
    const content = `
      <h2>Verification Update Required 📝</h2>
      <p>Hello ${data.user.name},</p>
      <p>Thank you for submitting your ${verificationDetails?.credentialType} verification request. After careful review, we need additional information or clarification before we can approve your verification.</p>
      
      <div class="warning-box">
        <p><strong>Review Notes:</strong></p>
        <p>${verificationDetails?.reviewerNotes || 'Please review the requirements and resubmit with complete documentation.'}</p>
      </div>
      
      <div class="info-box">
        <p><strong>Next Steps:</strong></p>
        <p>• Review the feedback provided above</p>
        <p>• Gather any additional required documentation</p>
        <p>• Resubmit your verification request</p>
        <p>• Contact support if you have questions</p>
      </div>
      
      <a href="${emailConfig.baseUrl}/verification/resubmit" class="button">Resubmit Verification</a>
      
      <p>We're committed to maintaining the highest standards for our verification process. This ensures that all verified credentials on our platform are authentic and trustworthy.</p>
      
      <p>If you have questions about the review or need assistance with resubmission, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br><strong>The BuildDiaspora Zimbabwe Verification Team</strong></p>
    `

    return {
      subject: `Action required: ${verificationDetails?.credentialType} verification needs update`,
      html: this.getBaseTemplate(content, 'Verification Update Required'),
      text: `Verification Update Required\n\nHello ${data.user.name},\n\nThank you for submitting your ${verificationDetails?.credentialType} verification request. After careful review, we need additional information or clarification before we can approve your verification.\n\nReview Notes:\n${verificationDetails?.reviewerNotes || 'Please review the requirements and resubmit with complete documentation.'}\n\nNext Steps:\n• Review the feedback provided above\n• Gather any additional required documentation\n• Resubmit your verification request\n• Contact support if you have questions\n\nResubmit verification: ${emailConfig.baseUrl}/verification/resubmit\n\nBest regards,\nThe BuildDiaspora Zimbabwe Verification Team`
    }
  }
} 