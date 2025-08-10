'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

/**
 * Root page component
 * Shows landing page with demo access or redirects authenticated users
 */
export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-semibold mb-2">AlphaOptimize</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-12 w-12 text-blue-600" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AlphaOptimize
              </h1>
            </div>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered portfolio optimization that could save you thousands in taxes
            </p>
          </div>

          {/* Demo CTA */}
          <Card className="max-w-2xl mx-auto border-2 border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6" />
                See Your Tax Savings Potential
              </CardTitle>
              <CardDescription className="text-lg">
                Interactive demo with a $100k portfolio • No signup required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">$2,847</div>
                  <div className="text-sm text-muted-foreground">Annual tax savings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">$1,825</div>
                  <div className="text-sm text-muted-foreground">Tax-loss harvesting</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">$34,200</div>
                  <div className="text-sm text-muted-foreground">10-year projection</div>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push('/demo')}
                size="lg"
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try Interactive Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                See real tax optimization in action • Takes 2 minutes
              </p>
            </CardContent>
          </Card>

          {/* Login Option */}
          <div className="space-y-4">
            <p className="text-muted-foreground">Already have an account?</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="px-8"
            >
              Sign In
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
