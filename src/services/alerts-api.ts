import { fetchWithAuth } from './api-utils';
import { 
  AlertRule, 
  AlertHistory, 
  AlertRuleResponse, 
  AlertHistoryResponse, 
  AlertRuleInput,
  AlertStatus,
  AlertFrequency,
  ConditionType,
  ActionType,
  AlertStats,
  PortfolioDrift
} from '../types/alerts';

// Define alert API endpoints as a constant
const ALERT_ENDPOINTS = {
  RULES: '/alerts/rules/',
  HISTORY: '/alerts/history/',
  STATS: '/alerts/stat/',
  DRIFT: '/portfolio/drift/',
  RULE_DETAIL: (id: string) => `/alerts/rules/${id}/`,
  HISTORY_DETAIL: (id: string) => `/alerts/history/${id}/`,
};

/**
 * Transform API response to frontend model
 */
const transformAlertRule = (response: AlertRuleResponse): AlertRule => {
  // Validate condition type and ensure it's a valid enum value
  const validConditionTypes = Object.values(ConditionType);
  const conditionType = validConditionTypes.includes(response.condition_type as ConditionType)
    ? response.condition_type as ConditionType
    : ConditionType.CUSTOM; // Default to CUSTOM if invalid

  // Validate status and ensure it's a valid enum value
  const validStatusTypes = Object.values(AlertStatus);
  const status = validStatusTypes.includes(response.status as AlertStatus)
    ? response.status as AlertStatus
    : response.is_active ? AlertStatus.ACTIVE : AlertStatus.PAUSED; // Default based on is_active

  // Validate action type
  const validActionTypes = Object.values(ActionType);
  const actionType = validActionTypes.includes(response.action_type as ActionType)
    ? response.action_type as ActionType
    : ActionType.NOTIFICATION; // Default to NOTIFICATION if invalid
  
  // Validate frequency
  const validFrequencyTypes = Object.values(AlertFrequency);
  const frequency = validFrequencyTypes.includes(response.frequency as AlertFrequency)
    ? response.frequency as AlertFrequency
    : AlertFrequency.IMMEDIATE; // Default to IMMEDIATE if invalid

  const transformed = {
    id: response.id,
    userId: response.user,
    name: response.name,
    isActive: response.is_active,
    status: status,
    frequency: frequency,
    conditionType: conditionType,
    conditionConfig: response.condition_config,
    actionType: actionType,
    actionConfig: response.action_config,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    lastTriggered: response.last_triggered,
    lastChecked: response.last_checked,
    portfolioId: response.portfolio,
    accountId: response.account,
  };


  return transformed;
};

/**
 * Transform API response to frontend model for alert history
 */
const transformAlertHistory = (response: AlertHistoryResponse): AlertHistory => ({
  id: response.id,
  alertRuleId: response.alert_rule,
  triggeredAt: response.triggered_at,
  resolvedAt: response.resolved_at,
  wasTriggered: response.was_triggered,
  contextData: response.context_data,
  actionResults: response.action_results,
});

/**
 * Alerts API service
 */
export const alertsApi = {
  // Get all alert rules for the current user
  getAlertRules: async (): Promise<AlertRule[]> => {
    const response = await fetchWithAuth<AlertRuleResponse[]>(ALERT_ENDPOINTS.RULES);
    return Array.isArray(response) ? response.map(transformAlertRule) : [];
  },

  // Compatibility method - maps to getAlertRules
  getAlerts: async (): Promise<AlertRule[]> => {
    return alertsApi.getAlertRules();
  },

  // Get a specific alert rule by ID
  getAlertRule: async (id: string): Promise<AlertRule> => {
    const response = await fetchWithAuth<AlertRuleResponse>(ALERT_ENDPOINTS.RULE_DETAIL(id));
    
    // Debug logging for specific alert rule
    if (id === '514e2aa0-29cf-4187-8182-295caa957fb7') {
      console.log('🎯 Raw API response for specific alert rule:', response);
    }
    
    return transformAlertRule(response);
  },

  // Create a new alert rule
  createAlertRule: async (alertRule: AlertRuleInput): Promise<AlertRule> => {
    // Transform frontend model to API expected format
    const apiAlertRule = {
      name: alertRule.name,
      is_active: alertRule.isActive,
      status: alertRule.status,
      frequency: alertRule.frequency,
      condition_type: alertRule.conditionType,
      condition_config: alertRule.conditionConfig,
      action_type: alertRule.actionType,
      action_config: alertRule.actionConfig,
      portfolio: alertRule.portfolioId ? parseInt(alertRule.portfolioId) : 1, // Convert string to number, default to 1
      account: alertRule.accountId,
    };

    // Create the alert using fetchWithAuth directly
    const response = await fetchWithAuth<AlertRuleResponse>(ALERT_ENDPOINTS.RULES, {
      method: 'POST',
      body: JSON.stringify(apiAlertRule),
    });
    
    return transformAlertRule(response);
  },

  // Update an existing alert rule
  updateAlertRule: async (id: string, alertRule: Partial<AlertRuleInput>): Promise<AlertRule> => {
    // Transform frontend model to API expected format
    const apiAlertRule: Record<string, unknown> = {};
    
    // Log what we're about to update
    console.warn('🔄 Updating alert rule:', id, 'with data:', alertRule);
    
    // Process each field that needs updating
    if (alertRule.name !== undefined) apiAlertRule.name = alertRule.name;
    
    // Make sure both isActive and status are updated together for consistency
    if (alertRule.isActive !== undefined) {
      apiAlertRule.is_active = alertRule.isActive;
      // If status wasn't explicitly provided but isActive was, derive status from isActive
      if (alertRule.status === undefined) {
        apiAlertRule.status = alertRule.isActive ? AlertStatus.ACTIVE : AlertStatus.PAUSED;
      }
    }
    
    // If status is being updated, ensure it's a valid enum value
    if (alertRule.status !== undefined) {
      const validStatusTypes = Object.values(AlertStatus);
      if (validStatusTypes.includes(alertRule.status)) {
        apiAlertRule.status = alertRule.status;
        
        // Ensure isActive matches the status for consistency if not explicitly set
        if (alertRule.isActive === undefined) {
          apiAlertRule.is_active = alertRule.status === AlertStatus.ACTIVE;
        }
      } else {
        console.error('❌ Invalid alert status:', alertRule.status);
      }
    }
    
    // Process other fields
    if (alertRule.frequency !== undefined) apiAlertRule.frequency = alertRule.frequency;
    if (alertRule.conditionType !== undefined) apiAlertRule.condition_type = alertRule.conditionType;
    if (alertRule.conditionConfig !== undefined) apiAlertRule.condition_config = alertRule.conditionConfig;
    if (alertRule.actionType !== undefined) apiAlertRule.action_type = alertRule.actionType;
    if (alertRule.actionConfig !== undefined) apiAlertRule.action_config = alertRule.actionConfig;
    if (alertRule.portfolioId !== undefined) apiAlertRule.portfolio = alertRule.portfolioId;
    if (alertRule.accountId !== undefined) apiAlertRule.account = alertRule.accountId;

    console.warn('📤 Sending API request:', apiAlertRule);
    
    try {
      const response = await fetchWithAuth<AlertRuleResponse>(ALERT_ENDPOINTS.RULE_DETAIL(id), {
        method: 'PATCH',
        body: JSON.stringify(apiAlertRule),
      });
      
      console.warn('📥 API response received:', response);
      const transformed = transformAlertRule(response);
      console.warn('✅ Transformed response:', transformed);
      return transformed;
    } catch (error) {
      console.error('❌ Error updating alert rule:', error);
      throw error;
    }
  },

  // Delete an alert rule
  deleteAlertRule: async (id: string): Promise<void> => {
    await fetchWithAuth(ALERT_ENDPOINTS.RULE_DETAIL(id), {
      method: 'DELETE',
    });
  },

  // Get alert history
  getAlertHistory: async (alertRuleId?: string): Promise<AlertHistory[]> => {
    let endpoint = ALERT_ENDPOINTS.HISTORY;
    if (alertRuleId) {
      endpoint += `?alert_rule=${alertRuleId}`;
    }
    const response = await fetchWithAuth<AlertHistoryResponse[]>(endpoint);
    return Array.isArray(response) ? response.map(transformAlertHistory) : [];
  },

  // Get alert statistics
  getAlertStats: async (): Promise<AlertStats> => {
    return await fetchWithAuth<AlertStats>(ALERT_ENDPOINTS.STATS);
  },

  // Get current drift information for a portfolio
  getPortfolioDrift: async (): Promise<PortfolioDrift> => {
    // The backend endpoint uses the active user's portfolio
    return await fetchWithAuth<PortfolioDrift>(ALERT_ENDPOINTS.DRIFT);
  },

  // Mark an alert history item as resolved
  resolveAlertHistory: async (historyId: string): Promise<AlertHistory> => {
    const response = await fetchWithAuth<AlertHistoryResponse>(`${ALERT_ENDPOINTS.HISTORY_DETAIL(historyId)}/resolve`, {
      method: 'POST',
    });
    return transformAlertHistory(response);
  },
};

export default alertsApi;
