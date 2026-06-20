import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import venezaLogo from '@/assets/veneza-logo.png';
import venezaLogoWhite from '@/assets/veneza-logo-white.svg';

export function Header() {
  // Lê a classe já aplicada pelo script anti-flash no <head> (sem piscar o logo)
  const [dark, setDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('veneza-theme', next ? 'dark' : 'light');
    } catch {}
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={dark ? venezaLogoWhite : venezaLogo}
              alt="Veneza"
              className="h-11 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-xl">Veneza</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Tráfego do Recife em tempo real
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              title={dark ? 'Tema claro' : 'Tema escuro'}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
