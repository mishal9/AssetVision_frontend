import { alertsApi as api } from './api';
import { fetchWithAuth } from './api-utils';
import { 
  AlertRule, 
  AlertHistory, 
  AlertRuleResponse, 
  AlertHistoryResponse, 
  AlertRuleInput 
} from '../types/alerts';

// Define alert API endpoints as a constant
const ALERT_ENDPOINTS = {
  RULES: '/alerts/rules/',
  HISTORY: '/alerts/history/',
  STATS: '/alerts/stat/',
  DRIFT: '/alerts/drift/',
  RULE_DETAIL: (id: string) => `/alerts/rules/${id}/`,
  HISTORY_DETAIL: (id: string) => `/alerts/history/${id}/`,
};

/**
 * Transform API response to frontend model
 */
const transformAlertRule = (response: AlertRuleResponse): AlertRule => ({
  id: response.id,
  userId: response.user,
  name: response.name,
  isActive: response.is_active,
  status: response.status as any,
  frequency: response.frequency as any,
  conditionType: response.condition_type as any,
  conditionConfig: response.condition_config,
  actionType: response.action_type as any,
  actionConfig: response.action_config,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  lastTriggered: response.last_triggered,
  lastChecked: response.last_checked,
  portfolioId: response.portfolio,
  accountId: response.account,
});

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
    const response = await api.getAlerts();
    return Array.isArray(response) ? response.map(transformAlertRule) : [];
  },

  // Get a specific alert rule by ID
  getAlertRule: async (id: string): Promise<AlertRule> => {
    const response = await fetchWithAuth<AlertRuleResponse>(ALERT_ENDPOINTS.RULE_DETAIL(id));
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
      portfolio: alertRule.portfolioId,
      account: alertRule.accountId,
    };

    // Use the createAlert method from the alertsApi instead of post
    const response = await api.createAlert(apiAlertRule);
    return transformAlertRule(response);
  },

  // Update an existing alert rule
  updateAlertRule: async (id: string, alertRule: Partial<AlertRuleInput>): Promise<AlertRule> => {
    // Transform frontend model to API expected format
    const apiAlertRule: Record<string, any> = {};
    if (alertRule.name !== undefined) apiAlertRule.name = alertRule.name;
    if (alertRule.isActive !== undefined) apiAlertRule.is_active = alertRule.isActive;
    if (alertRule.status !== undefined) apiAlertRule.status = alertRule.status;
    if (alertRule.frequency !== undefined) apiAlertRule.frequency = alertRule.frequency;
    if (alertRule.conditionType !== undefined) apiAlertRule.condition_type = alertRule.conditionType;
    if (alertRule.conditionConfig !== undefined) apiAlertRule.condition_config = alertRule.conditionConfig;
    if (alertRule.actionType !== undefined) apiAlertRule.action_type = alertRule.actionType;
    if (alertRule.actionConfig !== undefined) apiAlertRule.action_config = alertRule.actionConfig;
    if (alertRule.portfolioId !== undefined) apiAlertRule.portfolio = alertRule.portfolioId;
    if (alertRule.accountId !== undefined) apiAlertRule.account = alertRule.accountId;

    const response = await fetchWithAuth<AlertRuleResponse>(ALERT_ENDPOINTS.RULE_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify(apiAlertRule),
    });
    return transformAlertRule(response);
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
  getAlertStats: async (): Promise<any> => {
    return await fetchWithAuth(ALERT_ENDPOINTS.STATS);
  },

  // Get current drift information for a portfolio
  getPortfolioDrift: async (portfolioId: string): Promise<any> => {
    const endpoint = `${ALERT_ENDPOINTS.DRIFT}/${portfolioId}`;
    return await fetchWithAuth(endpoint);
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
