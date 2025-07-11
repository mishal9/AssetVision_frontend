/**
 * Alert Type Definitions
 * Contains type definitions for alert-related data
 */

// Alert Status Enum (matches backend)
export enum AlertStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  DELETED = "deleted",
}

// Alert Frequency Enum (matches backend)
export enum AlertFrequency {
  IMMEDIATE = "immediate",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

// Alert Condition Types (matches backend)
export enum ConditionType {
  PRICE_MOVEMENT = "price_movement",
  DRIFT = "drift",
  CASH_IDLE = "cash_idle",
  VOLATILITY = "volatility",
  DIVIDEND = "dividend",
  CUSTOM = "custom",
  SECTOR_DRIFT = "sector_drift",
  ASSET_CLASS_DRIFT = "asset_class_drift",
  PERFORMANCE = "performance",
  VOLUME = "volume",
  NEWS = "news",
}

// Alert Action Types (matches backend)
export enum ActionType {
  NOTIFICATION = "notification",
  EMAIL = "email",
  IN_APP = "in_app",
  SUGGEST_REBALANCE = "suggest_rebalance",
  CREATE_TASK = "create_task",
  LOG_TO_JOURNAL = "log_to_journal",
  WEBHOOK = "webhook",
  EXECUTE_TRADE = "execute_trade",
}

// API Response Types (snake_case as returned from backend)
export interface AlertRuleResponse {
  id: string;
  user: string;
  name: string;
  is_active: boolean;
  status: string;
  frequency: string;
  condition_type: string;
  condition_config: Record<string, ConfigValue>;
  action_type: string;
  action_config: Record<string, ConfigValue>;
  created_at: string;
  updated_at: string;
  last_triggered?: string;
  last_checked?: string;
  portfolio?: string;
  account?: string;
}

export interface AlertHistoryResponse {
  id: string;
  alert_rule: string;
  triggered_at: string;
  resolved_at?: string;
  was_triggered: boolean;
  context_data: Record<string, ConfigValue>;
  action_results: Record<string, ConfigValue>;
}

// Frontend Types (camelCase for React components)
export interface AlertRule {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  status: AlertStatus;
  frequency: AlertFrequency;
  conditionType: ConditionType;
  conditionConfig: Record<string, ConfigValue>;
  actionType: ActionType;
  actionConfig: Record<string, ConfigValue>;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  lastChecked?: string;
  portfolioId?: string;
  accountId?: string;
}

export interface AlertHistory {
  id: string;
  alertRuleId: string;
  triggeredAt: string;
  resolvedAt?: string;
  wasTriggered: boolean;
  contextData: ConfigObject;
  actionResults: ConfigObject;
}

// Base configuration types
export type ConfigValue = string | number | boolean | null | string[] | number[] | ConfigObject;
export interface ConfigObject {
  [key: string]: ConfigValue;
}

// Specific drift alert condition configurations
export interface DriftConditionConfig {
  portfolioId: string;
  thresholdPercent: number;
  driftType: 'absolute' | 'relative';
}

export interface SectorDriftConditionConfig extends DriftConditionConfig {
  sectorId?: string; 
  excludedSectors?: string[]; 
}

export interface AssetClassDriftConditionConfig extends DriftConditionConfig {
  assetClassId?: string; // If specified, only track drift for this asset class
  excludedAssetClasses?: string[]; // Asset classes to exclude from drift calculation
}

// Alert input types (for creating/updating alerts)
export interface AlertRuleInput {
  name: string;
  isActive?: boolean;
  status?: AlertStatus;
  frequency?: AlertFrequency;
  conditionType: ConditionType;
  conditionConfig: Record<string, ConfigValue>;
  actionType: ActionType;
  actionConfig: Record<string, ConfigValue>;
  portfolioId?: string;
  accountId?: string;
}

// Legacy alert interfaces (preserved for backward compatibility)
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

// Alert statistics interface
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredToday: number;
  triggeredThisWeek: number;
  triggeredThisMonth: number;
  byType: Record<ConditionType, number>;
  byStatus: Record<AlertStatus, number>;
}

// Portfolio drift interface
export interface PortfolioDrift {
  portfolioId: string;
  calculatedAt: string;
  overallDrift: number;
  assetClassDrift: Array<{
    assetClass: string;
    currentAllocation: number;
    targetAllocation: number;
    drift: number;
  }>;
  sectorDrift: Array<{
    sector: string;
    currentAllocation: number;
    targetAllocation: number;
    drift: number;
  }>;
}
