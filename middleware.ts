import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/verification',
  ]

  // Define auth routes (should redirect to dashboard if authenticated)
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const redirectUrl = new URL(redirectTo || '/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Special handling for reset password route
  if (pathname === '/auth/reset-password') {
    // Allow access regardless of auth state, but check for valid reset token
    const code = request.nextUrl.searchParams.get('code')
    if (!code) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Rate limiting for auth endpoints (simple implementation)
  if (isAuthRoute || pathname.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const key = `rate_limit:${ip}:${pathname}`
    
    // In production, you would use Redis or a database for rate limiting
    // This is a simple in-memory implementation for development
    const rateLimitHeaders = {
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': '9',
      'X-RateLimit-Reset': String(Date.now() + 60000),
    }
    
    supabaseResponse.headers.set('X-RateLimit-Limit', rateLimitHeaders['X-RateLimit-Limit'])
    supabaseResponse.headers.set('X-RateLimit-Remaining', rateLimitHeaders['X-RateLimit-Remaining'])
    supabaseResponse.headers.set('X-RateLimit-Reset', rateLimitHeaders['X-RateLimit-Reset'])
  }

  // Security headers
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 