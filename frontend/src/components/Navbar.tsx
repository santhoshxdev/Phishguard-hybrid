'use client';

import React from 'react';
import { Shield, ShieldAlert, Zap, Moon, Sun, Activity, Terminal } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  apiHealthy: boolean | null;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  apiHealthy,
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                PhishGuard
              </span>
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase tracking-wider">
                Hybrid ML
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Lexical Stable Detection • Low-Latency Prototype
            </p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <a href="#scanner" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            Scanner
          </a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Pipeline Flow
          </a>
          <a href="#research-context" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-400" />
            Research Problem
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* API Health Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-slate-700/60 bg-slate-900/60">
            <span
              className={`w-2 h-2 rounded-full ${
                apiHealthy === true
                  ? 'bg-emerald-400 animate-pulse'
                  : apiHealthy === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-slate-300 text-[11px]">
              {apiHealthy === true
                ? 'API Online'
                : apiHealthy === false
                ? 'API Offline'
                : 'Connecting...'}
            </span>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-1.5 text-slate-200"
            title="Scan History"
          >
            <span>History</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-600/80 text-white text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 transition-all text-slate-300 hover:text-white"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
