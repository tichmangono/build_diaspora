import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key'

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  if (!isDevelopment) {
    throw new Error('Missing Supabase environment variables')
  }
}

// Create mock client for development
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ 
      data: { 
        user: { 
          id: 'mock-user-id', 
          email: 'test@example.com' 
        } 
      }, 
      error: null 
    }),
    getSession: () => Promise.resolve({ 
      data: { 
        session: { 
          user: { 
            id: 'mock-user-id', 
            email: 'test@example.com' 
          } 
        } 
      }, 
      error: null 
    }),
    onAuthStateChange: (callback: any) => {
      // Mock auth state change listener
      console.log('Mock: Setting up auth state change listener')
      // Simulate initial auth state
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          }
        })
      }, 100)
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('Mock: Unsubscribed from auth state changes')
            }
          }
        }
      }
    },
    signIn: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ data: {}, error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ 
          data: { 
            id: 'mock-id', 
            role: 'admin' 
          }, 
          error: null 
        })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: {}, error: null })
        })
      })
    }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
      createSignedUrl: () => Promise.resolve({ data: { signedUrl: 'mock-url' }, error: null }),
      remove: () => Promise.resolve({ error: null })
    })
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
  }),
  removeChannel: () => {}
})

export const supabase = isDevelopment ? createMockClient() : createBrowserClient(supabaseUrl, supabaseAnonKey)

// Export a function to create a new client instance
export function createClient() {
  return isDevelopment ? createMockClient() : createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Type definitions for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          profession: string | null
          company: string | null
          bio: string | null
          website: string | null
          linkedin_url: string | null
          is_verified: boolean
          verification_type: string | null
          verification_documents: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          profession?: string | null
          company?: string | null
          bio?: string | null
          website?: string | null
          linkedin_url?: string | null
          is_verified?: boolean
          verification_type?: string | null
          verification_documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          profession?: string | null
          company?: string | null
          bio?: string | null
          website?: string | null
          linkedin_url?: string | null
          is_verified?: boolean
          verification_type?: string | null
          verification_documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          verification_type: string
          documents: string[]
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          verification_type: string
          documents: string[]
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          verification_type?: string
          documents?: string[]
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      verification_status: 'pending' | 'approved' | 'rejected'
      verification_type: 'professional' | 'identity' | 'business'
    }
  }
} 