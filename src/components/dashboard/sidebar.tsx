'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearUser, fetchUserInfo } from '@/store/userSlice';
import { authService } from '@/services/auth';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Receipt,
  Bell,
  PieChart,
  Home,
  LogOut,
  User,
  Settings,
  Building2
} from 'lucide-react';

/**
 * Sidebar component for dashboard
 * Provides navigation with always-visible labels and profile menu at bottom
 */
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, user } = useAppSelector((state) => ({
    isAuthenticated: state.user.isAuthenticated,
    user: state.user.user,
  }));

  // Fetch user info when component mounts
  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      name: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      name: 'Tax Strategies',
      icon: <Receipt className="h-5 w-5" />,
      path: '/dashboard/tax-strategies',
    },
    {
      name: 'Portfolio Drift',
      icon: <PieChart className="h-5 w-5" />,
      path: '/dashboard/portfolio-drift',
    },
    {
      name: 'Alert Center',
      icon: <Bell className="h-5 w-5" />,
      path: '/dashboard/alerts',
    },
  ];

  // Check if current path matches nav item path
  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      // For dashboard, only match exact path or dashboard root
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-52 bg-card border-r flex flex-col">
      {/* AlphaOptimize Branding */}
      <div className="p-4 pt-6">
        <button
          className="text-xl font-semibold hover:text-primary transition-colors focus:outline-none w-full text-left"
          onClick={() => router.push('/dashboard')}
          aria-label="Go to main page"
          type="button"
        >
          AlphaOptimize
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        <div className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start px-3",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                )}
                onClick={() => router.push(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Profile Section at Bottom */}
      <div className="p-4 border-t" ref={profileMenuRef}>
        {isAuthenticated && user ? (
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {user?.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user?.username || 'User'} 
                    width={32} 
                    height={32} 
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'UN'}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </button>
            
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-md shadow-lg py-1 z-50">
                <button 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center" 
                  onClick={() => {
                    router.push('/dashboard/connected-accounts');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Brokerage Accounts</span>
                </button>
                
                <button 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center" 
                  onClick={() => {
                    router.push('/dashboard/preferences/');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </button>
                
                <div className="border-t border-border mt-1"></div>
                
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent flex items-center" 
                  onClick={async () => {
                    await authService.logout();
                    dispatch(clearUser());
                    router.push('/login');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Guest</p>
              <p className="text-xs text-muted-foreground">Not logged in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
