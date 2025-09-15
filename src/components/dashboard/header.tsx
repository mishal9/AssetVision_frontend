'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/appSlice';
import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPanel from '@/components/notifications/NotificationPanel';

export function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useAppSelector((state) => ({
    theme: state.app.theme,
  }));

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="relative h-12 flex items-center justify-end gap-2">
      <NotificationPanel />
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
    </header>
  );
}
