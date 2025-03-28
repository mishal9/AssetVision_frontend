'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store';
import { toggleTheme } from '@/lib/features/appSlice';
import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

export function Header() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.app.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="border-b border-[hsl(var(--border))]">

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Asset Vision</h1>
          <nav className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Overview</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Customers</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Products</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Settings</a>
          </nav>
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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">AK</span>
          </div>
        </div>
      </div>
    </header>
  );
}
