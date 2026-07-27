'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#010f1f] border-t border-[#3b494c] py-12 px-4 md:px-8 font-mono">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="font-bold text-[#00e5ff] text-xl tracking-tighter">AEROLOCK</div>
          <p className="text-[#849396] text-xs uppercase leading-relaxed">
            SECURE_GLOBAL_LOGISTICS_AND_INFRASTRUCTURE_TERMINAL
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="text-[#d4e4fa] font-bold text-[10px] tracking-widest uppercase">
            System_Links
          </h5>
          <ul className="space-y-2 text-[#849396] text-xs uppercase">
            <li>
              <Link 
                href="/" 
                className="hover:text-[#00e5ff] transition-colors"
              >
                NETWORK_MAP
              </Link>
            </li>
            <li>
              <Link 
                href="/fleet" 
                className="hover:text-[#00e5ff] transition-colors"
              >
                FLEET_REGS
              </Link>
            </li>
            <li>
              <Link 
                href="/system" 
                className="hover:text-[#00e5ff] transition-colors"
              >
                COMMS_CHANNEL
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h5 className="text-[#d4e4fa] font-bold text-[10px] tracking-widest uppercase">
            Legal_Compliance
          </h5>
          <ul className="space-y-2 text-[#849396] text-xs uppercase">
            <li>
              <Link 
                href="/protocols" 
                className="hover:text-[#00e5ff] transition-colors"
              >
                SECURITY_TERMS
              </Link>
            </li>
            <li>
              <Link 
                href="/protocols" 
                className="hover:text-[#00e5ff] transition-colors"
              >
                DATA_HANDLING
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 flex flex-col justify-end items-start md:items-end">
          <div className="text-[#849396] text-[10px] font-mono">
            ©2026_AEROLOCK_CORP
          </div>
          <div className="text-[#00e5ff] text-[10px] font-mono">
            UUID: 8a7c-4f12-99b2-3c4d
          </div>
        </div>
      </div>
    </footer>
  );
};
