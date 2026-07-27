'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Providers from './Providers';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlobalModals } from './GlobalModals';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    try {
      router.push('/');
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // Navigation Items Matrix
  // Always visible: SEARCH (href: /) and FLIGHTS (href: /flights)
  // Visible only if isAuthenticated === true: BOOKINGS (href: /dashboard)
  const navItems = [
    { label: 'SEARCH', href: '/', icon: 'search' },
    { label: 'FLIGHTS', href: '/flights', icon: 'flight_takeoff' },
    ...(isAuthenticated
      ? [{ label: 'BOOKINGS', href: '/dashboard', icon: 'airplane_ticket' }]
      : []),
  ];

  return (
    <Providers>
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
            {/* Refined Header (AEROLOCK_NAV) */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-[#3b494c] bg-[#0d1c2d] text-[#00e5ff] uppercase tracking-wide shrink-0">
              <span className="material-symbols-outlined text-base">radar</span>
              <span className="font-bold tracking-widest text-xs">AEROLOCK_NAV</span>
            </div>

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

            {/* Footer Action Buttons */}
            <div className="mt-auto shrink-0 bg-[#122131]">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full bg-transparent border-t border-[#3b494c] text-[#bac9cc] hover:text-[#4ade80] hover:bg-[#4ade80]/10 py-3.5 px-4 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors rounded-none cursor-pointer text-center no-underline border-x-0 border-b-0 block"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>LOGIN</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-transparent border-t border-[#3b494c] text-[#bac9cc] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 py-3.5 px-4 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors rounded-none cursor-pointer text-center border-x-0 border-b-0"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>LOGOUT</span>
                </button>
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
    </Providers>
  );
};

export default AppShell;
