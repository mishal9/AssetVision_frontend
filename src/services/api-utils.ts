/**
 * API utilities for Asset Vision
 * Handles communication with Django backend
 */

import { API_BASE_URL } from '@/config/api';

/**
 * Generic fetch wrapper with error handling
 * Automatically adds authentication headers and handles errors
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
    const response = await fetch(url, config);
    
    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP error ${response.status}`,
        message: response.statusText
      }));
      
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
