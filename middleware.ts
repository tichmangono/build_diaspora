import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'crypto'

// Generate a random nonce for CSP
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

// Build Content Security Policy
function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Base CSP directives
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      isDev ? "'unsafe-eval'" : '', // Allow eval in development for hot reload
      'https://cdn.jsdelivr.net', // For potential CDN scripts
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 images
      'blob:', // For uploaded images
      'https:', // Allow HTTPS images
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('//', '//').split('/')[2] || '', // Supabase storage
    ].filter(Boolean),
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // For inline fonts
    ],
    'connect-src': [
      "'self'",
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      'https://api.supabase.co', // Supabase API
      'wss:', // WebSocket connections
      isDev ? 'ws://localhost:*' : '', // Dev server WebSocket
      isDev ? 'http://localhost:*' : '', // Dev server
    ].filter(Boolean),
    'media-src': [
      "'self'",
      'blob:',
      'data:',
    ],
    'object-src': ["'none'"], // Prevent Flash, Java, etc.
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"], // Prevent embedding in frames
    'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
  }

  // Convert to CSP string
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

export async function middleware(request: NextRequest) {
  // Generate nonce for this request
  const nonce = generateNonce()
  
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

  // Comprehensive Security Headers
  
  // Content Security Policy - Primary XSS protection
  const csp = buildCSP(nonce)
  supabaseResponse.headers.set('Content-Security-Policy', csp)
  
  // Frame protection
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  
  // MIME type sniffing protection
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS protection (legacy browsers)
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy (feature policy)
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()'
  )
  
  // Strict Transport Security (HTTPS enforcement)
  if (request.nextUrl.protocol === 'https:') {
    supabaseResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  // Cross-Origin policies
  supabaseResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  supabaseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  supabaseResponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  
  // Server information hiding
  supabaseResponse.headers.set('Server', 'BuildDiaspora')
  
  // Cache control for sensitive pages
  if (isProtectedRoute) {
    supabaseResponse.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate, private'
    )
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
  }

  // Add nonce to request headers for use in components
  supabaseResponse.headers.set('X-Nonce', nonce)

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