/**
 * Cookie utility functions for token management
 * 
 * Security Note: HttpOnly flag cannot be set from client-side JavaScript.
 * For maximum security, consider setting authentication cookies server-side
 * using Next.js API routes or middleware where HttpOnly can be properly set.
 */

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1].trim()) : null;
}

/**
 * Set a cookie with expiration and security flags
 * @param name Cookie name
 * @param value Cookie value
 * @param maxAge Max age in seconds
 * @param options Additional cookie options
 */
export function setCookie(
  name: string, 
  value: string, 
  maxAge: number,
  options: {
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): void {
  if (typeof document === 'undefined') return;
  
  // Encode value to handle special characters
  const encodedValue = encodeURIComponent(value);
  
  // Determine if we should use Secure flag (HTTPS only in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = options.secure !== undefined 
    ? options.secure 
    : (isProduction && typeof window !== 'undefined' && window.location.protocol === 'https:');
  
  // Use SameSite=Strict by default for CSRF protection
  const sameSite = options.sameSite || 'Strict';
  
  // Build cookie string with security flags
  let cookieString = `${name}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=${sameSite}`;
  
  // Add Secure flag only in production with HTTPS
  if (isSecure) {
    cookieString += '; Secure';
  }
  
  document.cookie = cookieString;
}

/**
 * Delete a cookie
 * @param name Cookie name
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = isProduction && typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  let cookieString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
  
  if (isSecure) {
    cookieString += '; Secure';
  }
  
  document.cookie = cookieString;
}

