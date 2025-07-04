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
    signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: {} }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@example.com' } }, error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ data: { user: {} }, error: null })
  },
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        eq: (column: string, value: any) => ({
          in: (column: string, values: any[]) => ({
            order: (column: string, { ascending = true } = {}) => ({
              range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
              limit: (count: number) => Promise.resolve({ data: [], error: null })
            }),
            limit: (count: number) => Promise.resolve({ data: [], error: null })
          }),
          order: (column: string, { ascending = true } = {}) => ({
            range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
            limit: (count: number) => Promise.resolve({ data: [], error: null })
          }),
          single: () => Promise.resolve({ data: {}, error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        in: (column: string, values: any[]) => ({
          order: (column: string, { ascending = true } = {}) => ({
            range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
            limit: (count: number) => Promise.resolve({ data: [], error: null })
          }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        order: (column: string, { ascending = true } = {}) => ({
          range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        single: () => Promise.resolve({ data: {}, error: null }),
        range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      in: (column: string, values: any[]) => ({
        order: (column: string, { ascending = true } = {}) => ({
          range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      order: (column: string, { ascending = true } = {}) => ({
        range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      single: () => Promise.resolve({ data: {}, error: null }),
      range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
      limit: (count: number) => Promise.resolve({ data: [], error: null })
    }),
    insert: (values: any) => ({
      select: (columns = '*') => ({
        single: () => Promise.resolve({ data: {}, error: null })
      })
    }),
    upsert: (values: any) => ({
      select: (columns = '*') => ({
        single: () => Promise.resolve({ data: {}, error: null })
      })
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns = '*') => ({
            single: () => Promise.resolve({ data: {}, error: null })
          })
        }),
        select: (columns = '*') => ({
          single: () => Promise.resolve({ data: {}, error: null })
        })
      }),
      select: (columns = '*') => ({
        single: () => Promise.resolve({ data: {}, error: null })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: {}, error: null })
      })
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any, options?: any) => Promise.resolve({
        data: { path: path },
        error: null
      }),
      remove: (paths: string | string[]) => Promise.resolve({
        data: { path: Array.isArray(paths) ? paths[0] : paths },
        error: null
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://example.com/${path}` },
        error: null
      }),
      createSignedUrl: (path: string, expiresIn: number) => Promise.resolve({
        data: { signedUrl: `https://example.com/${path}?token=signed&expiresIn=${expiresIn}` },
        error: null
      }),
      download: (path: string) => Promise.resolve({
        data: new Uint8Array(),
        error: null
      }),
      list: (prefix?: string) => Promise.resolve({
        data: [{ name: prefix || 'mock-file.txt', id: 'mock-id', updated_at: new Date().toISOString() }],
        error: null
      }),
      move: (from: string, to: string) => Promise.resolve({
        data: { path: to },
        error: null
      })
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
          role: string | null
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
          role?: string | null
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
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          verification_type: 'professional' | 'identity' | 'business'
          documents: string[]
          additional_info: string | null
          status: 'pending' | 'approved' | 'rejected'
          reviewer_id: string | null
          reviewer_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          verification_type: 'professional' | 'identity' | 'business'
          documents: string[]
          additional_info?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewer_id?: string | null
          reviewer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          verification_type?: 'professional' | 'identity' | 'business'
          documents?: string[]
          additional_info?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewer_id?: string | null
          reviewer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      compliance_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Record<string, any> | null
          read: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Record<string, any> | null
          read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Record<string, any> | null
          read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consent_records: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          granted: boolean
          granted_at: string
          revoked_at: string | null
          version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          consent_type: string
          granted: boolean
          granted_at?: string
          revoked_at?: string | null
          version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          consent_type?: string
          granted?: boolean
          granted_at?: string
          revoked_at?: string | null
          version?: string | null
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