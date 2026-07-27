'use client';
import React from 'react';
import { useTerminal } from '../context/TerminalContext';
import { TabType } from '../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { activeTab, setActiveTab, operator, setIsNewMissionOpen, setIsLoginOpen } = useTerminal();

  const handleClose = onClose || (() => {});

  const isAdmin = operator.clearance === 'L2_COMMAND';

  const navItems: { tab: TabType; label: string; icon: string }[] = [
    { tab: 'DASHBOARD', label: 'DASHBOARD', icon: 'grid_view' },
    { tab: 'SEARCH', label: 'SEARCH', icon: 'search' },
    { tab: 'FLEET', label: 'FLEET', icon: 'flight_takeoff' },
    { tab: 'BOOKINGS', label: 'BOOKINGS', icon: 'airplane_ticket' },
    { tab: 'PROTOCOLS', label: 'PROTOCOLS', icon: 'verified_user' },
    { tab: 'SYSTEM', label: 'SYSTEM', icon: 'terminal' },
    { tab: 'LOGS', label: 'LOGS', icon: 'receipt_long' },
  ];

  // Role filtering: L1_CIVILIAN sees DASHBOARD, SEARCH, BOOKINGS; L2_COMMAND sees all.
  const filteredNavItems = navItems.filter((item) => {
    if (isAdmin) return true;
    return item.tab === 'DASHBOARD' || item.tab === 'SEARCH' || item.tab === 'BOOKINGS';
  });

  return (
    <>
      {/* Backdrop Overlay when Sidebar is open */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-[#051424]/60 backdrop-blur-sm transition-opacity cursor-pointer"
        />
      )}

      {/* Sidebar Container (Collapsible for Desktop & Mobile) */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-50 bg-[#122131] text-[#00e5ff] font-mono text-xs uppercase border-r border-[#3b494c] w-64 pt-20 select-none transition-transform duration-300 flex flex-col"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Operator Info */}
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b494c] border border-[#00e5ff] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#00e5ff]">person_pin</span>
            </div>
            <div>
              <div className="font-bold text-[#d4e4fa] tracking-wider">{operator.name}</div>
              <div className="text-[10px] text-[#849396]">{operator.clearance}</div>
            </div>
          </div>
          {/* Close button unconditionally rendered */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-[#849396] hover:text-[#00e5ff] bg-transparent border-none cursor-pointer transition-colors flex items-center justify-center"
            title="Close Navigation"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                }}
                className={`w-full flex items-center px-6 py-3.5 cursor-crosshair transition-all text-left bg-transparent border-none ${
                  isActive
                    ? 'bg-[#404a57] text-[#00e5ff] border-l-2 border-[#00e5ff] font-bold'
                    : 'text-[#bac9cc] hover:bg-[#273647] hover:text-[#d4e4fa]'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 mt-auto border-t border-[#3b494c]/50 bg-[#0d1c2d]">
          <button
            onClick={() => setIsNewMissionOpen(true)}
            className="w-full border border-[#00e5ff] py-3 text-[#00e5ff] font-bold hover:bg-[#00e5ff] hover:text-[#051424] active:scale-[0.98] transition-none flex items-center justify-center gap-2 cursor-pointer bg-transparent uppercase"
          >
            <span className="material-symbols-outlined text-sm">add_task</span>
            NEW_MISSION
          </button>

          <button
            onClick={() => setIsLoginOpen(true)}
            className="mt-4 w-full flex items-center justify-center text-[#849396] cursor-crosshair hover:text-[#ffb4ab] transition-colors text-xs py-1 bg-transparent border-none uppercase"
          >
            <span className="material-symbols-outlined mr-2 text-sm">logout</span>
            LOGOUT
          </button>
        </div>
      </aside>
    </>
  );
};

