import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from './client'

export function createClient() {
  const cookieStore = cookies()

  // Check if we're in development mode and missing environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found, using mock client for development')
    
    // Return a mock client for development
    return {
      auth: {
        getUser: async () => ({
          data: { 
            user: {
              id: 'mock-user-id',
              email: 'dev@builddiaspora.com',
              user_metadata: {
                full_name: 'Development User',
                avatar_url: null
              }
            }
          },
          error: null
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } })
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            range: async () => ({ data: [], error: null })
          }),
          order: () => ({
            range: async () => ({ data: [], error: null })
          }),
          range: async () => ({ data: [], error: null })
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: 'mock-id' }, error: null })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: { id: 'mock-id' }, error: null })
            })
          })
        }),
        delete: () => ({
          eq: async () => ({ error: null })
        })
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: { path: 'mock-path' }, error: null }),
          remove: async () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } })
        })
      }
    }
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export function createClientForRequest(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found, using mock client for development')
    
    // Return mock client and response for development
    return {
      supabase: {
        auth: {
          getUser: async () => ({
            data: { 
              user: {
                id: 'mock-user-id',
                email: 'dev@builddiaspora.com',
                user_metadata: {
                  full_name: 'Development User',
                  avatar_url: null
                }
              }
            },
            error: null
          })
        }
      },
      response
    }
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

} 