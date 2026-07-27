'use client';

import React, { useState } from 'react';
import Providers from './Providers';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { GlobalModals } from './GlobalModals';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Providers>
      <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-mono selection:bg-[#00e5ff] selection:text-[#051424] flex flex-col relative">
        {/* Header with hamburger toggle */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Main layout container */}
        <div className="flex-1 flex">
          {/* Collapsible Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

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
