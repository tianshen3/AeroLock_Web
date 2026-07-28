'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTerminal } from '../context/TerminalContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { getResolvedFullName, getStoredUserObject } from '../utils/userUtils';

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const router = useRouter();
  const { setActiveTab, setIsLoginOpen, operator, metrics, handleLogout } = useTerminal();
  const { data: userProfile } = useUserProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getDisplayName = () => {
    const fromProfile = getResolvedFullName(userProfile);
    if (fromProfile) return fromProfile.toUpperCase();

    const storedUser = getStoredUserObject();
    const fromStored = getResolvedFullName(storedUser);
    if (fromStored && fromStored !== 'OPERATOR_01') return fromStored.toUpperCase();

    if (operator?.name && !operator.name.startsWith('OPERATOR_01')) {
      return operator.name.toUpperCase();
    }

    return 'OPERATOR';
  };

  const displayName = getDisplayName();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('accessToken') ||
          localStorage.getItem('auth_token') ||
          localStorage.getItem('token');
        const auth = !!token;
        setIsAuthenticated(auth);
        if (!auth) setIsUserMenuOpen(false);
      }
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
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

        <Link
          href="/"
          className="font-bold text-lg text-[#00e5ff] tracking-tighter flex items-center gap-2 cursor-pointer transition-colors hover:text-[#00cbe3] group no-underline"
        >
          <span className="material-symbols-outlined text-inherit group-hover:rotate-90 transition-transform duration-300">
            radar
          </span>
          <span>AEROLOCK</span>
        </Link>
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

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              title="Toggle Operator Session Menu"
              className={`border px-3 py-1 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                isUserMenuOpen
                  ? 'border-[#00e5ff] bg-[#00e5ff] text-[#051424]'
                  : 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff]/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isUserMenuOpen ? 'bg-[#051424]' : 'bg-[#00e5ff] animate-pulse'}`}></span>
              <span>{operator.clearance.replace('_', ' ')}</span>
              <span className={`hidden md:inline font-normal text-[10px] ${isUserMenuOpen ? 'text-[#051424]/80' : 'text-[#bac9cc]'}`}>
                [{displayName}]
              </span>
              <span className="material-symbols-outlined text-xs">
                {isUserMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#0d1c2d] border border-[#00e5ff] shadow-2xl p-1.5 z-50 font-mono text-xs uppercase">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                    router.push('/');
                  }}
                  className="w-full border border-red-500/60 bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white p-2 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>LOGOUT</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsLoginOpen(true)}
            className="ml-2 border border-[#00e5ff] px-3 py-1 text-[#00e5ff] font-bold text-xs hover:bg-[#00e5ff] hover:text-[#051424] active:bg-[#00e5ff] transition-none flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">lock_open</span>
            <span>SYSTEM LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
};
