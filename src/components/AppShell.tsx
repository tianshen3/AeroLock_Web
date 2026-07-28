'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '../hooks/useCustomer';
import { useFlights } from '../hooks/useFlights';
import { useTerminal } from '../context/TerminalContext';
import Providers from './Providers';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlobalModals } from './GlobalModals';

export interface AppShellProps {
  children: React.ReactNode;
}

const AppShellContent: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const pathname = usePathname();
  const { operator, handleLogout: terminalLogout, setIsLoginOpen } = useTerminal();

  // Fetch profile and flight data globally inside QueryClientProvider context on initial load/refresh
  const { data: profile } = useProfile();
  useFlights();

  // Safely check authentication state from localStorage
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('accessToken') ||
          localStorage.getItem('auth_token') ||
          localStorage.getItem('token');
        setIsAuthenticated(!!token);
      }
    };

    checkAuth();

    const handleStorage = () => checkAuth();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  const handleLogout = () => {
    terminalLogout();
    setIsAuthenticated(false);
    setIsProfileOpen(false);
  };

  // Extract operator display name and clearance level
  const firstName = profile?.name
    ? profile.name.split(' ')[0].toUpperCase()
    : operator.name
    ? operator.name.split(' ')[0].toUpperCase()
    : 'OPERATOR';
  const clearance = operator.clearance;

  // Navigation Items Matrix
  const navItems = [
    { label: 'SEARCH', href: '/', icon: 'search' },
    { label: 'FLIGHTS', href: '/flights', icon: 'flight_takeoff' },
    ...(isAuthenticated
      ? [{ label: 'BOOKINGS', href: '/dashboard', icon: 'airplane_ticket' }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-mono selection:bg-[#00e5ff] selection:text-[#051424] flex flex-col relative rounded-none">
      {/* Header with hamburger toggle */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Layout Body */}
      <div className="flex-1 flex relative">
        {/* Backdrop Overlay when Sidebar is Open */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-[#051424]/80 backdrop-blur-sm transition-opacity cursor-pointer"
          />
        )}

        {/* Kinetic Precision Tactical Sidebar */}
        <aside
          style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          className={`fixed left-0 top-0 bottom-0 z-50 bg-[#122131] text-[#d4e4fa] font-mono text-xs uppercase border-r border-[#3b494c] w-64 select-none transition-transform duration-300 flex flex-col rounded-none shadow-2xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Clickable Header (AEROLOCK_NAV) */}
          <Link
            href="/"
            onClick={() => setIsSidebarOpen(false)}
            className="h-16 flex items-center gap-3 px-4 border-b border-[#3b494c] bg-[#0d1c2d] text-[#00e5ff] font-mono text-xs uppercase tracking-wide shrink-0 no-underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">radar</span>
            <span className="font-bold tracking-widest text-xs">AEROLOCK_NAV</span>
          </Link>

          {/* Navigation Links Matrix */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center px-4 py-3 font-mono text-xs uppercase tracking-wider rounded-none transition-colors border-y-0 border-r-0 no-underline block ${
                    isActive
                      ? 'border-l-2 border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff] font-bold'
                      : 'border-l-2 border-transparent text-[#bac9cc] hover:bg-[#122131] hover:text-[#00e5ff]'
                  }`}
                >
                  <span className="material-symbols-outlined mr-3 text-base shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-bold tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Dynamic Operator Profile Footer */}
          <div className="mt-auto shrink-0 bg-[#122131]">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsLoginOpen(true);
                }}
                className="bg-transparent border-t border-[#3b494c] text-[#bac9cc] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 p-4 flex items-center gap-3 w-full text-left font-bold tracking-widest text-xs font-mono uppercase transition-colors rounded-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-base shrink-0">
                  power_settings_new
                </span>
                <span>SYSTEM_LOGIN</span>
              </button>
            ) : (
              <div className="flex flex-col w-full">
                {isProfileOpen && (
                  <div className="bg-[#122131]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-3 w-full text-left text-[#bac9cc] bg-[#122131] border-t border-[#3b494c] text-xs font-bold tracking-widest flex items-center gap-3 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors rounded-none cursor-pointer uppercase font-mono"
                    >
                      <span className="material-symbols-outlined text-base shrink-0">
                        logout
                      </span>
                      <span>LOGOUT</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="border-t border-[#3b494c] bg-[#0d1c2d] p-3 text-[#00e5ff] w-full text-left flex items-center justify-between font-mono rounded-none cursor-pointer transition-colors hover:bg-[#122131]"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-bold text-xs tracking-widest truncate uppercase">
                      {firstName}
                    </span>
                    <span className="text-[10px] text-[#bac9cc] tracking-wider uppercase font-mono">
                      {clearance}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-base shrink-0">
                    {isProfileOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Dynamic Content Wrapper */}
        <main
          className={`flex-1 flex flex-col min-h-screen relative overflow-x-hidden pt-16 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
          }`}
        >
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalModals />
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <Providers>
      <AppShellContent>{children}</AppShellContent>
    </Providers>
  );
};

export default AppShell;
