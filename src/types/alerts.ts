/**
 * Alert Type Definitions
 * Contains type definitions for alert-related data
 */

// API Response Types (snake_case as returned from backend)
export interface AlertResponse {
  id: string;
  user_id: string;
  symbol: string;
  alert_type: string;
  threshold_value: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  triggered_at?: string;
  notes?: string;
}

// Frontend Types (camelCase for React components)
export interface Alert {
  id: string;
  userId: string;
  symbol: string;
  alertType: string;
  thresholdValue: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  triggeredAt?: string;
  notes?: string;
}

export interface AlertInput {
  symbol: string;
  alertType: string;
  thresholdValue: number;
  isActive?: boolean;
  notes?: string;
}
