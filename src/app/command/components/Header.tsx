import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface HeaderProps {
  onToggleSound?: () => void;
  soundEnabled?: boolean;
  onOpenQuickCmd?: () => void;
  activeView?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString();
      const datePart = iso.slice(0, 10).replace(/-/g, '.');
      const timePart = iso.slice(11, 19);
      setTimestamp(`SYS_TIME: ${datePart}_${timePart}_Z`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-[#3b494c] flex items-center px-4 sm:px-8 justify-between z-50 bg-[#051424] shrink-0 select-none rounded-none font-mono">
      <div className="flex items-center gap-3 sm:gap-4">
        <Shield className="w-6 h-6 text-[#ffb4ab] fill-[#ffb4ab]/20 shrink-0" />
        <h1 className="text-sm sm:text-base font-bold tracking-widest flex items-center gap-1 sm:gap-2 text-[#ffb4ab] uppercase">
          <span>COMMAND CENTER</span>
          <span className="text-[10px] bg-[#ffb4ab]/10 border border-[#ffb4ab] text-[#ffb4ab] px-2 py-0.5 ml-2 font-mono">
            [ L2_COMMAND ]
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 text-xs text-[#849396]">
        {/* Timestamp */}
        <span className="hidden md:inline font-mono tracking-wider text-[#d4e4fa]/80 uppercase">
          {timestamp || 'SYS_TIME: 2026.07.28_10:48:00_Z'}
        </span>
      </div>
    </header>
  );
};
