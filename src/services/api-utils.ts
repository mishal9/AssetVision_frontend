/**
 * API utilities for AlphaOptimize
 * Handles communication with Django backend
 */

import { API_BASE_URL } from '@/config/api';
import { getCookie } from '@/utils/cookies';

/**
 * Generic fetch wrapper with authentication and error handling
 * 
 * This function handles API requests to the backend server with automatic authentication.
 * It supports both relative paths (which are appended to API_BASE_URL) and absolute URLs.
 * 
 * Authentication is handled by automatically retrieving JWT tokens from cookies or localStorage
 * and adding them as Authorization Bearer headers to the request.
 * 
 * @template T - The expected return type of the API call
 * @param {string} endpoint - The API endpoint to call (can be a relative path or full URL)
 * @param {RequestInit} [options={}] - Fetch API options (method, body, additional headers, etc.)
 * @param {number} [timeoutMs=10000] - Timeout in milliseconds (default: 10000ms)
 * @returns {Promise<T>} A promise that resolves to the API response data of type T
 * @throws {Error} Throws an error if the API request fails or returns an error status
 */
export async function fetchWithAuth<T>(
  endpoint: string, 
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<T> {
  // Check if the endpoint is already a full URL (starts with http:// or https://)
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  
  // If it's a full URL, use it directly; otherwise, append it to the API base URL
  const url = isFullUrl ? endpoint : (
    endpoint.startsWith('/') 
      ? `${API_BASE_URL}${endpoint}` 
      : `${API_BASE_URL}/${endpoint}`
  );
  
  // Get the JWT token from cookies
  const token = getCookie('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include cookies in cross-origin requests
    mode: 'cors', // Enable CORS for all requests
  } as RequestInit;

  // Add timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const configWithTimeout = {
    ...config,
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, configWithTimeout);
    clearTimeout(timeoutId);
    
    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }
    
    // Parse JSON response - only parse once to avoid 'body stream already read' error
    let data;
    try {
      data = await response.json();
      
      // For successful responses
      if (response.ok) {
        return data as T;
      }
      
      // Handle error responses with JSON bodies
      const errorMessage = data.error || data.message || `API error: ${response.status}`;
      throw new Error(errorMessage);
    } catch (e) {
      // Handle parse errors or non-JSON error responses
      if (!response.ok) {
        // Only try to read the error text if we couldn't parse JSON
        let errorText: string;
        try {
          errorText = await response.text();
        } catch {
          errorText = response.statusText;
        }
        if (!errorText) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      // JSON parsing error for a successful response
      throw new Error(`Failed to parse JSON response: ${e instanceof Error ? e.message : String(e)}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle AbortError specifically for timeouts
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}
