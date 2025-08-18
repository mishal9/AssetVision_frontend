'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDemoMode } from '@/context/DemoModeContext';
import { 
  User,
  Settings,
  HelpCircle,
  LogOut,
  ExternalLink,
  Clock,
  PlayCircle
} from 'lucide-react';

/**
 * Demo Header Component
 * Top navigation bar specifically for demo mode
 */
export function DemoHeader() {
  const { state, endDemo, getTimeRemaining } = useDemoMode();
  
  // Format time remaining
  const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const timeRemaining = getTimeRemaining();
  const isLowTime = timeRemaining < 30 * 60 * 1000; // Less than 30 minutes

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      {/* Demo Mode Indicator */}
      <div className="flex items-center gap-4">
        <Badge className="bg-blue-600 text-white hover:bg-blue-700">
          <PlayCircle className="h-3 w-3 mr-1" />
          DEMO MODE
        </Badge>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span className={isLowTime ? 'text-orange-600 font-medium' : ''}>
            {formatTimeRemaining(timeRemaining)} remaining
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Help */}
        <Button variant="ghost" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>

        {/* Get Started Button */}
        <Button 
          size="sm"
          onClick={() => window.open('/register', '_blank')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Get Started
        </Button>

        {/* Demo User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={state.session?.user.avatar} 
                  alt={state.session?.user.username || 'Demo User'} 
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {state.session?.user.username || 'Demo User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {state.session?.user.email || 'demo@alphaoptimize.com'}
                </p>
                <Badge variant="secondary" className="text-xs w-fit mt-1">
                  Demo Account
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => window.open('/register', '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Create Real Account</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={endDemo} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Exit Demo</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
