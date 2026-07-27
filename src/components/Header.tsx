'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTerminal } from '../context/TerminalContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { setIsLoginOpen, operator, metrics } = useTerminal();

  return (
    <header className="bg-[#051424] text-[#00e5ff] font-mono text-sm uppercase tracking-wider sticky top-0 border-b border-[#3b494c] flex justify-between items-center w-full px-4 md:px-8 py-3 z-50 shadow-md">
      {/* Brand */}
      <Link 
        href="/" 
        className="font-bold text-lg text-[#00e5ff] tracking-tighter cursor-pointer flex items-center gap-2 group"
      >
        <span className="material-symbols-outlined text-[#00e5ff] group-hover:rotate-90 transition-transform duration-300">
          radar
        </span>
        AEROLOCK
      </Link>

      {/* Center Nav Links */}
      <nav className="hidden md:flex gap-8 items-center">
        <Link
          href="/search"
          className={`pb-1 cursor-crosshair transition-none border-b-2 ${
            pathname === '/search'
              ? 'text-[#00e5ff] border-[#00e5ff] font-bold'
              : 'text-[#849396] border-transparent hover:text-[#00e5ff]'
          }`}
        >
          FLIGHTS
        </Link>
        <Link
          href="/fleet"
          className={`pb-1 cursor-crosshair transition-none border-b-2 ${
            pathname === '/fleet'
              ? 'text-[#00e5ff] border-[#00e5ff] font-bold'
              : 'text-[#849396] border-transparent hover:text-[#00e5ff]'
          }`}
        >
          FLEET
        </Link>
        <Link
          href="/protocols"
          className={`pb-1 cursor-crosshair transition-none border-b-2 ${
            pathname === '/protocols'
              ? 'text-[#00e5ff] border-[#00e5ff] font-bold'
              : 'text-[#849396] border-transparent hover:text-[#00e5ff]'
          }`}
        >
          SECURITY
        </Link>
        <Link
          href="/logs"
          className={`pb-1 cursor-crosshair transition-none border-b-2 ${
            pathname === '/logs'
              ? 'text-[#00e5ff] border-[#00e5ff] font-bold'
              : 'text-[#849396] border-transparent hover:text-[#00e5ff]'
          }`}
        >
          LOGS
        </Link>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 border border-[#3b494c] bg-[#122131] text-[10px] text-[#bac9cc]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{metrics.systemStatus}</span>
        </div>

        <Link 
          href="/system"
          title="System Diagnostic Console" 
          className="material-symbols-outlined text-[#849396] cursor-pointer hover:text-[#00e5ff] p-1 transition-colors"
        >
          settings
        </Link>

        <Link 
          href="/protocols"
          title="Active Sensor Telemetry" 
          className="material-symbols-outlined text-[#849396] cursor-pointer hover:text-[#00e5ff] p-1 transition-colors"
        >
          sensors
        </Link>

        <button
          onClick={() => setIsLoginOpen(true)}
          className="ml-2 border border-[#00e5ff] px-3 py-1 text-[#00e5ff] font-bold text-xs hover:bg-[#00e5ff] hover:text-[#051424] active:bg-[#00e5ff] transition-none flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>{operator.clearance.replace('_', ' ')}</span>
        </button>
      </div>
    </header>
  );
};
