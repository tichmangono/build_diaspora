// Authentication Context Hooks
export { useAuth, useRequireAuth, useUser } from '@/lib/contexts/AuthContext'

// Specialized Authentication Hooks
export {
  useAuthRedirect,
  useProtectedRoute,
  useProfileCompletion,
  useAuthForm,
  useUserAvatar,
  useUserVerification,
  useUserActivity,
  useAuthFormState,
  useSession,
} from './useAuthHooks'

// Re-export types for convenience
export type { Profile, AuthContextType } from '@/lib/contexts/AuthContext'

// Authentication hooks
export * from './useAuthHooks'

// Auth guard components
export { AuthGuard, RequireAuth, RequireVerification, RequireCompleteProfile } from '@/components/auth/AuthGuard'
export { 
  ProtectedRoute, 
  withAuth, 
  VerifiedRoute, 
  CompleteProfileRoute, 
  AdminRoute, 
  useRouteProtection 
} from '@/components/auth/ProtectedRoute' 