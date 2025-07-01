// Authentication forms
export { LoginForm } from './LoginForm'
export { RegisterForm } from './RegisterForm'
export { ForgotPasswordForm } from './ForgotPasswordForm'
export { ResetPasswordForm } from './ResetPasswordForm'

// Authentication layout
export { AuthLayout } from './AuthLayout'

// Authentication guards and protection
export { AuthGuard, RequireAuth, RequireVerification, RequireCompleteProfile } from './AuthGuard'
export { 
  ProtectedRoute, 
  withAuth, 
  VerifiedRoute, 
  CompleteProfileRoute, 
  AdminRoute, 
  useRouteProtection 
} from './ProtectedRoute'

// Re-export types
export type { AuthContextType, Profile } from '@/lib/contexts/AuthContext' 