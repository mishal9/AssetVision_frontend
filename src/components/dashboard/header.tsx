'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/appSlice';
import { clearUser, fetchUserInfo } from '@/store/userSlice';
import { LogOut, Moon, Sun, User, Settings, Building2 } from 'lucide-react';
import { useEffect } from 'react';
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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useAppSelector((state) => state.app.theme);
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

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

  // Debug logging
  useEffect(() => {
    console.log('Header - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);

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
          {/* Always show dropdown for debugging, fallback to default user */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                onClick={() => console.log('Profile button clicked!')}
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
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'JD'}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-[9999] bg-white border border-gray-200 shadow-lg" style={{ zIndex: 9999 }}>
              <DropdownMenuLabel>
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
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/dashboard/connected-accounts')}>
                <Building2 className="mr-2 h-4 w-4" />
                <span>Brokerage Accounts</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/dashboard/preferences/')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive" 
                onClick={async () => {
                  await authService.logout();
                  dispatch(clearUser());
                  router.push('/login');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
