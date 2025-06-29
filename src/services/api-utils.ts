/**
 * API utilities for Asset Vision
 * Handles communication with Django backend
 */

import { API_BASE_URL } from '@/config/api';

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
 * @returns {Promise<T>} A promise that resolves to the API response data of type T
 * @throws {Error} Throws an error if the API request fails or returns an error status
 */
export async function fetchWithAuth<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  // Check if the endpoint is already a full URL (starts with http:// or https://)
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  
  // If it's a full URL, use it directly; otherwise, append it to the API base URL
  const url = isFullUrl ? endpoint : (
    endpoint.startsWith('/') 
      ? `${API_BASE_URL}${endpoint}` 
      : `${API_BASE_URL}/${endpoint}`
  );
  
  // Get the JWT token from cookies or localStorage
  let token;
  
  // Try to get from cookies first
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }
  
  // Fall back to localStorage
  if (!token && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }
  
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
  } as RequestInit;

  try {
    console.log(`API Request to ${url}:`, { 
      method: config.method || 'GET',
      hasAuthToken: !!token,
      bodySize: config.body ? JSON.stringify(config.body).length : 0
    });
    
    const response = await fetch(url, config);
    
    // For 204 No Content responses
    if (response.status === 204) {
      console.log(`API Response from ${url}: [204 No Content]`);
      return {} as T;
    }
    
    // Parse JSON response - only parse once to avoid 'body stream already read' error
    let data;
    try {
      data = await response.json();
      
      // For successful responses, just log the data
      if (response.ok) {
        console.log(`API Response from ${url}:`, data);
        return data as T;
      }
      
      // Handle error responses with JSON bodies
      const errorMessage = data.error || data.message || `API error: ${response.status}`;
      console.error(`API Error ${response.status} from ${url}: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch (e) {
      // Handle parse errors or non-JSON error responses
      if (!response.ok) {
        // Only try to read the error text if we couldn't parse JSON
        const errorText = await response.text().catch(() => response.statusText);
        const errorMessage = `HTTP error ${response.status}: ${errorText || response.statusText}`;
        console.error(`API Error from ${url}: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      // JSON parsing error for a successful response
      console.error(`Error parsing JSON from ${url}:`, e);
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }
  } catch (error) {
    // Only log the error once at this level - don't duplicate logs
    if (!(error instanceof Error)) {
      console.error('API request failed with unknown error type');
    }
    throw error;
  }
}
