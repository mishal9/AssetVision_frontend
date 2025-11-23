/**
 * Security utility functions
 * Provides input sanitization and validation helpers to prevent XSS and injection attacks
 */

/**
 * Sanitize a string to prevent XSS attacks
 * Removes HTML tags and encodes special characters
 * @param input The string to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  
  // Remove HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, '');
  
  // Encode special characters to prevent XSS
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = withoutTags;
    return div.innerHTML;
  }
  
  // Fallback for server-side: basic HTML entity encoding
  return withoutTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize email address
 * @param email Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  // Additional length check
  if (trimmed.length > 254) {
    return null;
  }
  
  return trimmed;
}

/**
 * Validate and sanitize URL
 * @param url URL to validate
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate input length to prevent DoS attacks
 * @param input Input string
 * @param maxLength Maximum allowed length
 * @returns Truncated string if needed
 */
export function limitLength(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  return input.length > maxLength ? input.substring(0, maxLength) : input;
}

/**
 * Sanitize object keys to prevent prototype pollution
 * @param obj Object to sanitize
 * @returns New object with sanitized keys
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const key in obj) {
    // Prevent prototype pollution by checking for __proto__, constructor, etc.
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
}

/**
 * Escape special characters in a string for use in JSON
 * This is a safety measure, though JSON.stringify already handles this
 * @param input String to escape
 * @returns Escaped string
 */
export function escapeJsonString(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

