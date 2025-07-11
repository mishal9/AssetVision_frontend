'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/appSlice';
import { clearUser, fetchUserInfo } from '@/store/userSlice';
import { LogOut, Moon, Sun, User, Settings, Building2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme, isAuthenticated, user } = useAppSelector((state) => ({
    theme: state.app.theme,
    isAuthenticated: state.user.isAuthenticated,
    user: state.user.user,
  }));

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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



  return (
    <header className="border-b border-[hsl(var(--border))] relative">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <div className="flex items-center space-x-4">
          <button
            className="text-xl font-semibold hover:text-primary transition-colors focus:outline-none"
            onClick={() => router.push('/dashboard')}
            aria-label="Go to main page"
            type="button"
          >
            Asset Vision
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          {isAuthenticated && user ? (
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
              >
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
              </button>
              
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-border">
                    {user?.username ? (
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground truncate">john.doe@example.com</p>
                      </div>
                    )}
                  </div>
                  
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
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
