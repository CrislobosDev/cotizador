'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-2 py-1 dark:border-gray-700 dark:bg-gray-900/80">
      <Sun className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-amber-500'}`} />
      <Switch
        aria-label="Cambiar modo oscuro"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
      <Moon className={`h-4 w-4 ${isDark ? 'text-cyan-300' : 'text-gray-500'}`} />
    </div>
  );
}
