'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDemoMode } from '@/context/DemoModeContext';
import { 
  Clock, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  ExternalLink,
  PlayCircle 
} from 'lucide-react';

/**
 * Demo Session Indicator Component
 * Shows session status, time remaining, and provides session management
 */
export function DemoSessionIndicator() {
  const { state, endDemo, extendSession, getTimeRemaining, isSessionExpired } = useDemoMode();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Update time remaining every second
  useEffect(() => {
    if (!state.session) return;

    const updateTimer = () => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
      
      // Show warning when less than 5 minutes remain
      const fiveMinutes = 5 * 60 * 1000;
      setShowWarning(remaining < fiveMinutes && remaining > 0);
      
      // Auto-cleanup if expired
      if (remaining <= 0 || isSessionExpired()) {
        endDemo();
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [state.session, getTimeRemaining, isSessionExpired, endDemo]);

  // Don't render if not in demo mode
  if (!state.isDemo || !state.session) {
    return null;
  }

  // Format time for display
  const formatTime = (milliseconds: number): string => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate progress percentage (6 hours = 100%)
  const totalSessionTime = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  const progressPercentage = Math.max(0, (timeRemaining / totalSessionTime) * 100);

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className={`${
            showWarning 
              ? 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100' 
              : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
          }`}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Demo: {formatTime(timeRemaining)}
          {showWarning && <AlertTriangle className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    );
  }

  // Full view
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-white text-blue-600 hover:bg-gray-100">
              <PlayCircle className="h-3 w-3 mr-1" />
              DEMO MODE
            </Badge>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {formatTime(timeRemaining)} remaining
              </span>
              {showWarning && (
                <div className="flex items-center gap-1 text-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Low time!</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-32 bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  showWarning ? 'bg-orange-400' : 'bg-white'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showWarning && (
              <Button
                onClick={extendSession}
                size="sm"
                variant="secondary"
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
            )}
            
            <Button
              onClick={() => window.open('/register', '_blank')}
              size="sm"
              variant="secondary"
              className="bg-green-500 hover:bg-green-600 text-white border-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Started
            </Button>
            
            <Button
              onClick={endDemo}
              size="sm"
              variant="secondary"
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              Exit Demo
            </Button>
            
            <Button
              onClick={() => setIsMinimized(true)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warning message for low time */}
        {showWarning && (
          <div className="mt-2 p-2 bg-orange-500/20 rounded border border-orange-400/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Your demo session will expire soon. Extend it to continue exploring, or create a real account to save your progress.</span>
              </div>
              <Button
                onClick={() => window.open('/register', '_blank')}
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-100 ml-4"
              >
                Sign Up Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
