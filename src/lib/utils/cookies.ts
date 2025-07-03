import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Cookie security configuration
export const COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Sensitive cookie configuration (shorter expiry)
export const SENSITIVE_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: 60 * 60 * 2, // 2 hours
  secure: true, // Always secure for sensitive data
};

/**
 * Set a secure cookie (server-side)
 */
export async function setSecureCookie(
  name: string,
  value: string,
  options: Partial<typeof COOKIE_CONFIG> = {}
): Promise<void> {
  const cookieStore = await cookies();
  const config = { ...COOKIE_CONFIG, ...options };
  
  cookieStore.set(name, value, config);
}

/**
 * Get a cookie value (server-side)
 */
export async function getSecureCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

/**
 * Delete a cookie (server-side)
 */
export async function deleteSecureCookie(name: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

/**
 * Set cookie in middleware/API routes
 */
export function setResponseCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: Partial<typeof COOKIE_CONFIG> = {}
): void {
  const config = { ...COOKIE_CONFIG, ...options };
  
  response.cookies.set(name, value, config);
}

/**
 * Get cookie from request
 */
export function getRequestCookie(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}

/**
 * Delete cookie in response
 */
export function deleteResponseCookie(response: NextResponse, name: string): void {
  response.cookies.delete(name);
}

/**
 * Set multiple secure cookies at once
 */
export async function setMultipleSecureCookies(
  cookies: Array<{ name: string; value: string; options?: Partial<typeof COOKIE_CONFIG> }>
): Promise<void> {
  for (const cookie of cookies) {
    await setSecureCookie(cookie.name, cookie.value, cookie.options);
  }
}

/**
 * Clear all authentication-related cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const authCookieNames = [
    'builddiaspora_session',
    'csrf_token',
    'remember_token',
    'device_id',
  ];
  
  for (const cookieName of authCookieNames) {
    await deleteSecureCookie(cookieName);
  }
}

/**
 * Set CSRF token cookie
 */
export async function setCSRFCookie(token: string): Promise<void> {
  await setSecureCookie('csrf_token', token, {
    httpOnly: false, // Needs to be accessible by JavaScript
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFCookie(): Promise<string | undefined> {
  return await getSecureCookie('csrf_token');
}

/**
 * Set remember me token (for persistent login)
 */
export async function setRememberToken(token: string): Promise<void> {
  await setSecureCookie('remember_token', token, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Get remember me token
 */
export async function getRememberToken(): Promise<string | undefined> {
  return await getSecureCookie('remember_token');
}

/**
 * Clear remember me token
 */
export async function clearRememberToken(): Promise<void> {
  await deleteSecureCookie('remember_token');
}

/**
 * Set device identifier for security tracking
 */
export async function setDeviceId(deviceId: string): Promise<void> {
  await setSecureCookie('device_id', deviceId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Get device identifier
 */
export async function getDeviceId(): Promise<string | undefined> {
  return await getSecureCookie('device_id');
}

/**
 * Generate and set a new device ID if none exists
 */
export async function ensureDeviceId(): Promise<string> {
  let deviceId = await getDeviceId();
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    await setDeviceId(deviceId);
  }
  
  return deviceId;
}

/**
 * Generate a unique device identifier
 */
function generateDeviceId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Cookie consent management
 */
export async function setCookieConsent(
  essential: boolean = true,
  analytics: boolean = false,
  marketing: boolean = false
): Promise<void> {
  const consent = {
    essential,
    analytics,
    marketing,
    timestamp: Date.now(),
  };
  
  await setSecureCookie('cookie_consent', JSON.stringify(consent), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Needs to be accessible by JavaScript
  });
}

/**
 * Get cookie consent preferences
 */
export async function getCookieConsent(): Promise<{
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
} | null> {
  const consentCookie = await getSecureCookie('cookie_consent');
  
  if (!consentCookie) {
    return null;
  }
  
  try {
    return JSON.parse(consentCookie);
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return null;
  }
}

/**
 * Check if analytics cookies are allowed
 */
export async function areAnalyticsCookiesAllowed(): Promise<boolean> {
  const consent = await getCookieConsent();
  return consent?.analytics ?? false;
}

/**
 * Check if marketing cookies are allowed
 */
export async function areMarketingCookiesAllowed(): Promise<boolean> {
  const consent = await getCookieConsent();
  return consent?.marketing ?? false;
} 