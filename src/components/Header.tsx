'use client';

import React, { useState, useEffect } from 'react';
import { useTerminal } from '../context/TerminalContext';

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const { setActiveTab, setIsLoginOpen, operator, metrics } = useTerminal();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono text-sm uppercase tracking-wider border-b flex justify-between items-center w-full px-4 md:px-8 py-3 ${
        isScrolled
          ? 'bg-[#051424]/80 backdrop-blur-md border-[#3b494c]/60 shadow-lg'
          : 'bg-[#051424] border-[#3b494c] shadow-md'
      }`}
    >
      {/* Far Left: Hamburger Toggle + AeroLock Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="material-symbols-outlined text-[#00e5ff] hover:text-[#d4e4fa] cursor-pointer p-1 transition-colors bg-transparent border-none flex items-center justify-center"
          title={isSidebarOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          {isSidebarOpen ? 'menu_open' : 'menu'}
        </button>

        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className="font-bold text-lg text-[#00e5ff] tracking-tighter cursor-pointer flex items-center gap-2 group border-none bg-transparent p-0"
        >
          <span className="material-symbols-outlined text-[#00e5ff] group-hover:rotate-90 transition-transform duration-300">
            radar
          </span>
          AEROLOCK
        </button>
      </div>

      {/* Far Right: Controls & Clearance Badge */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 border border-[#3b494c] bg-[#122131] text-[10px] text-[#bac9cc]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{metrics.systemStatus}</span>
        </div>

        <button
          onClick={() => setActiveTab('SYSTEM')}
          title="System Diagnostic Console"
          className="material-symbols-outlined text-[#849396] cursor-pointer hover:text-[#00e5ff] p-1 transition-colors bg-transparent border-none"
        >
          settings
        </button>

        <button
          onClick={() => setIsLoginOpen(true)}
          className="ml-2 border border-[#00e5ff] px-3 py-1 text-[#00e5ff] font-bold text-xs hover:bg-[#00e5ff] hover:text-[#051424] active:bg-[#00e5ff] transition-none flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>{operator.clearance.replace('_', ' ')}</span>
        </button>
      </div>
    </header>
  );
};
