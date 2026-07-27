'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTerminal } from '../context/TerminalContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { operator, setIsNewMissionOpen, setIsLoginOpen } = useTerminal();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'DASHBOARD', icon: 'grid_view' },
    { href: '/search', label: 'SEARCH', icon: 'search' },
    { href: '/fleet', label: 'FLEET', icon: 'flight_takeoff' },
    { href: '/bookings', label: 'BOOKINGS', icon: 'airplane_ticket' },
    { href: '/protocols', label: 'PROTOCOLS', icon: 'verified_user' },
    { href: '/system', label: 'SYSTEM', icon: 'terminal' },
    { href: '/logs', label: 'LOGS', icon: 'receipt_long' },
  ];

  return (
    <>
      {/* Mobile Top Controls Toggle */}
      <div className="lg:hidden bg-[#122131] border-b border-[#3b494c] p-3 flex justify-between items-center text-xs font-mono">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 text-[#00e5ff] font-bold"
        >
          <span className="material-symbols-outlined">menu</span>
          <span>MENU / NAVIGATION</span>
        </button>
        <span className="text-[#849396] text-[10px]">OPERATOR: {operator.name}</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 bg-[#122131] text-[#00e5ff] font-mono text-xs uppercase border-r border-[#3b494c] w-64 pt-20 select-none">
        {/* Operator Info */}
        <div className="px-6 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3b494c] border border-[#00e5ff] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#00e5ff]">person_pin</span>
          </div>
          <div>
            <div className="font-bold text-[#d4e4fa] tracking-wider">{operator.name}</div>
            <div className="text-[10px] text-[#849396]">{operator.clearance}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center px-6 py-3.5 cursor-crosshair transition-all text-left ${
                  isActive
                    ? 'bg-[#404a57] text-[#00e5ff] border-l-2 border-[#00e5ff] font-bold'
                    : 'text-[#bac9cc] hover:bg-[#273647] hover:text-[#d4e4fa]'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 mt-auto border-t border-[#3b494c]/50 bg-[#0d1c2d]">
          <button
            onClick={() => setIsNewMissionOpen(true)}
            className="w-full border border-[#00e5ff] py-3 text-[#00e5ff] font-bold hover:bg-[#00e5ff] hover:text-[#051424] active:scale-[0.98] transition-none flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add_task</span>
            NEW_MISSION
          </button>
          
          <button
            onClick={() => setIsLoginOpen(true)}
            className="mt-4 w-full flex items-center justify-center text-[#849396] cursor-crosshair hover:text-[#ffb4ab] transition-colors text-xs py-1"
          >
            <span className="material-symbols-outlined mr-2 text-sm">logout</span> 
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-[#3b494c] flex justify-between items-center bg-[#122131]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00e5ff]">person_pin</span>
              <div>
                <div className="font-bold text-[#d4e4fa] text-sm">{operator.name}</div>
                <div className="text-[10px] text-[#849396]">{operator.clearance}</div>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="p-2 text-[#d4e4fa] hover:text-[#00e5ff]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center p-3 text-sm font-mono uppercase ${
                  pathname === item.href
                    ? 'bg-[#00e5ff] text-[#051424] font-bold'
                    : 'bg-[#122131] text-[#d4e4fa] border border-[#3b494c]'
                }`}
              >
                <span className="material-symbols-outlined mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-[#3b494c] bg-[#122131]">
            <button
              onClick={() => {
                setIsNewMissionOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full bg-[#00e5ff] text-[#051424] py-3 font-bold uppercase text-center mb-3"
            >
              + NEW_MISSION
            </button>
            <button
              onClick={() => {
                setIsLoginOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full border border-[#ffb4ab] text-[#ffb4ab] py-2 uppercase text-xs"
            >
              LOGOUT
            </button>
          </div>
        </div>
      )}
    </>
  );
};
