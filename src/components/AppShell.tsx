'use client';

import React, { useState } from 'react';
import Providers from './Providers';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { GlobalModals } from './GlobalModals';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-[#051424] text-[#d4e4fa] selection:bg-[#00e5ff] selection:text-[#051424]">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <main
            className={`flex-1 overflow-y-auto bg-[#051424] transition-all duration-300 ${
              isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
            }`}
          >
            {children}
          </main>
        </div>
        <Footer />
        <GlobalModals />
      </div>
    </Providers>
  );
}
