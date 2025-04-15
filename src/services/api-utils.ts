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
    
    // Handle errors
    if (!response.ok) {
      console.error(`API Error ${response.status} from ${url}`);
      let errorData;
      try {
        errorData = await response.json();
        console.error('API Error details:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('API Error response text:', errorText);
        errorData = {
          error: `HTTP error ${response.status}`,
          message: response.statusText,
          responseText: errorText
        };
      }
      
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    let data;
    try {
      data = await response.json();
      console.log(`API Response from ${url}:`, data);
    } catch (e) {
      console.error(`Error parsing JSON from ${url}:`, e);
      const responseText = await response.text();
      console.log('Response as text:', responseText);
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }
    
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
