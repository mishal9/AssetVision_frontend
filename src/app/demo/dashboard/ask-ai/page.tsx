'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MessageCircle, Bot } from 'lucide-react';

/**
 * Demo Ask AI Page
 * Shows AI assistant interface with demo data
 */
export default function DemoAskAiPage() {
  useEffect(() => {
    // Ensure demo mode is set
    sessionStorage.setItem('demo_mode', 'true');
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-semibold">AI Assistant</h1>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-medium">Portfolio Analysis Assistant</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Ask questions about your portfolio performance, allocation, or get investment insights.
        </p>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Demo Mode:</strong> AI assistant is simulated with pre-defined responses.
            In the full version, this would connect to advanced AI models for real-time portfolio analysis.
          </p>
        </div>
      </Card>
    </div>
  );
}