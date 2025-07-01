import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

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