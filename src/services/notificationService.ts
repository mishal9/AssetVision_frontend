/**
 * Efficient notification service with intelligent caching and reduced API calls
 */

import { alertsApi } from './alerts-api';
import { createAlertNotification } from './notifications';
import { AlertRule } from '../types/alerts';

interface CachedAlertRule {
  rule: AlertRule;
  lastChecked: number;
  lastTriggered?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private alertRulesCache: Map<string, CachedAlertRule> = new Map();
  private lastFullCheck: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly FULL_CHECK_INTERVAL = 120000; // 2 minutes

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Efficiently check for new alert triggers with intelligent caching
   */
  async checkForNewAlerts(): Promise<void> {
    const now = Date.now();
    
    // Only do full check every 2 minutes
    const shouldDoFullCheck = (now - this.lastFullCheck) > this.FULL_CHECK_INTERVAL;
    
    if (shouldDoFullCheck) {
      await this.performFullCheck();
      this.lastFullCheck = now;
    } else {
      await this.performIncrementalCheck();
    }
  }

  /**
   * Full check - fetch all alert rules and check for recent triggers
   */
  private async performFullCheck(): Promise<void> {
    try {
      const alertRules = await alertsApi.getAlertRules();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      console.log('🔍 Full check - looking for alerts triggered since:', oneHourAgo);
      console.log('📊 Total alert rules found:', alertRules.length);
      
      for (const rule of alertRules) {
        const cached = this.alertRulesCache.get(rule.id);
        
        // Special debugging for the specific alert rule
        if (rule.id === '514e2aa0-29cf-4187-8182-295caa957fb7') {
          console.log('🎯 Debugging specific alert rule:', {
            id: rule.id,
            name: rule.name,
            lastTriggered: rule.lastTriggered,
            oneHourAgo,
            isRecent: rule.lastTriggered && rule.lastTriggered > oneHourAgo,
            cached: cached ? { lastTriggered: cached.lastTriggered } : null,
            shouldCreateNotification: rule.lastTriggered && rule.lastTriggered > oneHourAgo && (!cached || cached.lastTriggered !== rule.lastTriggered)
          });
        }
        
        // Check if this rule has a recent trigger
        if (rule.lastTriggered && rule.lastTriggered > oneHourAgo) {
          // Check if we've already processed this trigger
          if (!cached || cached.lastTriggered !== rule.lastTriggered) {
            console.log('🔔 Creating notification for alert:', rule.id, rule.name);
            await createAlertNotification(rule);
          } else {
            console.log('⏭️ Skipping already processed trigger for:', rule.id);
          }
        }
        
        // Update cache
        this.alertRulesCache.set(rule.id, {
          rule,
          lastChecked: Date.now(),
          lastTriggered: rule.lastTriggered
        });
      }
    } catch (error) {
      console.error('❌ Error in full check:', error);
    }
  }

  /**
   * Incremental check - only check specific alert rules that might have changed
   */
  private async performIncrementalCheck(): Promise<void> {
    const now = Date.now();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Check cached rules that might have recent activity
    for (const [ruleId, cached] of this.alertRulesCache.entries()) {
      // Skip if we checked this rule recently
      if ((now - cached.lastChecked) < this.CACHE_DURATION) {
        continue;
      }

      try {
        // Fetch just this specific alert rule
        const rule = await alertsApi.getAlertRule(ruleId);
        
        // Check if lastTriggered has changed
        if (rule.lastTriggered && rule.lastTriggered > oneHourAgo) {
          if (cached.lastTriggered !== rule.lastTriggered) {
            await createAlertNotification(rule);
          }
        }
        
        // Update cache
        this.alertRulesCache.set(ruleId, {
          rule,
          lastChecked: now,
          lastTriggered: rule.lastTriggered
        });
      } catch (error) {
        console.error(`❌ Error checking alert rule ${ruleId}:`, error);
      }
    }
  }

  /**
   * Force refresh - bypass cache and check immediately
   */
  async forceRefresh(): Promise<void> {
    console.log('🔄 Force refresh triggered - bypassing cache');
    this.lastFullCheck = 0; // Force full check
    await this.checkForNewAlerts();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return {
      cachedRules: this.alertRulesCache.size,
      lastFullCheck: new Date(this.lastFullCheck).toISOString(),
      cacheAge: Date.now() - this.lastFullCheck
    };
  }
}

export const notificationService = NotificationService.getInstance();
