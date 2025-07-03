import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Session configuration
const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_change_in_production',
  cookieName: 'builddiaspora_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax' as const,
    path: '/',
  },
};

// Session data interface
export interface SessionData {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
  profileComplete?: boolean;
  isVerified?: boolean;
  lastActivity?: number;
  loginAttempts?: number;
  lockedUntil?: number;
  csrfToken?: string;
  twoFactorEnabled?: boolean;
  role?: 'user' | 'admin' | 'moderator';
}

// Default session data
const defaultSession: SessionData = {
  isLoggedIn: false,
  lastActivity: Date.now(),
  loginAttempts: 0,
};

/**
 * Get session from server-side (App Router)
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  // Initialize session with defaults if empty
  if (!session.isLoggedIn) {
    Object.assign(session, defaultSession);
  }
  
  return session;
}

/**
 * Get session from middleware or API routes
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<IronSession<SessionData>> {
  const response = new NextResponse();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  
  // Initialize session with defaults if empty
  if (!session.isLoggedIn) {
    Object.assign(session, defaultSession);
  }
  
  return session;
}

/**
 * Create a new authenticated session
 */
export async function createSession(userData: {
  userId: string;
  email: string;
  profileComplete?: boolean;
  isVerified?: boolean;
  role?: 'user' | 'admin' | 'moderator';
}): Promise<void> {
  const session = await getSession();
  
  session.userId = userData.userId;
  session.email = userData.email;
  session.isLoggedIn = true;
  session.profileComplete = userData.profileComplete || false;
  session.isVerified = userData.isVerified || false;
  session.role = userData.role || 'user';
  session.lastActivity = Date.now();
  session.loginAttempts = 0;
  session.lockedUntil = undefined;
  session.csrfToken = generateCSRFToken();
  
  await session.save();
}

/**
 * Update session data
 */
export async function updateSession(updates: Partial<SessionData>): Promise<void> {
  const session = await getSession();
  
  Object.assign(session, updates);
  session.lastActivity = Date.now();
  
  await session.save();
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Check if session is valid and not expired
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return false;
    }
    
    // Check if session is expired (24 hours of inactivity)
    const maxInactivity = 24 * 60 * 60 * 1000; // 24 hours
    const lastActivity = session.lastActivity || 0;
    const now = Date.now();
    
    if (now - lastActivity > maxInactivity) {
      await destroySession();
      return false;
    }
    
    // Check if account is locked
    if (session.lockedUntil && session.lockedUntil > now) {
      return false;
    }
    
    // Update last activity
    session.lastActivity = now;
    await session.save();
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

/**
 * Increment login attempts and lock account if necessary
 */
export async function handleFailedLogin(_email: string): Promise<{ locked: boolean; attemptsLeft: number }> {
  const session = await getSession();
  
  session.loginAttempts = (session.loginAttempts || 0) + 1;
  
  const maxAttempts = 5;
  const lockDuration = 15 * 60 * 1000; // 15 minutes
  
  if (session.loginAttempts >= maxAttempts) {
    session.lockedUntil = Date.now() + lockDuration;
    session.loginAttempts = 0; // Reset attempts after locking
    await session.save();
    
    return { locked: true, attemptsLeft: 0 };
  }
  
  await session.save();
  return { locked: false, attemptsLeft: maxAttempts - session.loginAttempts };
}

/**
 * Reset login attempts on successful login
 */
export async function resetLoginAttempts(): Promise<void> {
  const session = await getSession();
  session.loginAttempts = 0;
  session.lockedUntil = undefined;
  await session.save();
}

/**
 * Generate CSRF token for form protection
 */
export function generateCSRFToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  const session = await getSession();
  return session.csrfToken === token;
}

/**
 * Refresh session with new activity timestamp
 */
export async function refreshSession(): Promise<void> {
  const session = await getSession();
  if (session.isLoggedIn) {
    session.lastActivity = Date.now();
    await session.save();
  }
}

/**
 * Get session data for client-side use (sanitized)
 */
export async function getClientSessionData(): Promise<{
  isLoggedIn: boolean;
  userId?: string;
  email?: string;
  profileComplete?: boolean;
  isVerified?: boolean;
  role?: string;
}> {
  const session = await getSession();
  
  return {
    isLoggedIn: session.isLoggedIn,
    userId: session.userId,
    email: session.email,
    profileComplete: session.profileComplete,
    isVerified: session.isVerified,
    role: session.role,
  };
} 