'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTerminal } from '../context/TerminalContext';
import { InteractiveMap } from './InteractiveMap';

export const BentoGrid: React.FC = () => {
  const router = useRouter();
  const { logs, fleet, setIsSpecsOpen, setSelectedUnit } = useTerminal();
  const featuredUnit = fleet[0];

  return (
    <section className="p-4 md:p-8 bg-[#051424]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 max-w-7xl mx-auto">
        {/* Large Status Card - Live Network Feed */}
        <div className="md:col-span-8 border border-[#3b494c] bg-[#0d1c2d] p-6 md:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[100px] md:text-[120px] text-[#00e5ff]">
              security
            </span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xl text-[#d4e4fa] flex items-center gap-2 font-bold uppercase tracking-tight">
              <span className="w-2 h-6 bg-[#00e5ff] inline-block"></span>
              LIVE_NETWORK_FEED
            </h3>
            <button
              onClick={() => router.push('/logs')}
              className="text-xs text-[#00e5ff] font-mono hover:underline uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>VIEW_ALL_LOGS</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Real Live Logs Stream */}
          <div className="space-y-3 font-mono text-xs mb-6">
            {logs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-[#3b494c] pb-2 hover:bg-[#122131] px-1 transition-colors"
              >
                <span className="text-[#3b494c] group-hover:text-[#bac9cc]">
                  {log.logCode}: {log.message}
                </span>
                <span
                  className={`font-bold ${
                    log.status === 'OK' ? 'text-[#00e5ff]' : 'text-amber-400 animate-pulse'
                  }`}
                >
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive World Flight Network Map */}
          <div className="mt-6">
            <div className="text-[10px] text-[#849396] font-mono uppercase mb-1 font-bold flex justify-between">
              <span>ACTIVE AIR TRAFFIC VECTOR HUD MAP</span>
              <span className="text-[#00e5ff]">CLICK NODE TO INSPECT TELEMETRY</span>
            </div>
            <InteractiveMap />
          </div>
        </div>

        {/* Small Detail Card - Maximum Cargo Protection */}
        <div className="md:col-span-4 border border-[#3b494c] bg-[#00e5ff] p-6 md:p-8 text-[#051424] flex flex-col justify-between font-mono">
          <div>
            <span className="material-symbols-outlined text-[48px] mb-4 text-[#051424]">
              shield_with_heart
            </span>
            <h4 className="font-bold text-xl leading-tight uppercase tracking-tight text-[#051424]">
              MAXIMUM_CARGO_PROTECTION
            </h4>
            <p className="mt-4 text-xs font-mono text-[#051424]/90 leading-relaxed">
              Proprietary shielding technology ensures all assets remain invisible to unauthorized radar nodes during transit.
            </p>
          </div>
          <button
            onClick={() => setIsSpecsOpen(true)}
            className="mt-8 border-2 border-[#051424] py-3 px-4 font-bold text-xs uppercase hover:bg-[#051424] hover:text-[#00e5ff] transition-none cursor-pointer tracking-wider"
          >
            VIEW_SPECS
          </button>
        </div>

        {/* Featured Fleet Item - Unit X-99 */}
        {featuredUnit && (
          <div 
            onClick={() => setSelectedUnit(featuredUnit)}
            className="md:col-span-4 border border-[#3b494c] bg-[#122131] p-0 overflow-hidden group cursor-pointer font-mono"
          >
            <div className="h-64 relative overflow-hidden bg-[#051424]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredUnit.image}
                alt={featuredUnit.name}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 font-bold text-lg text-[#00e5ff] flex items-center gap-2">
                <span>{featuredUnit.code}</span>
                <span className="text-xs bg-[#00e5ff]/20 text-[#00e5ff] px-1.5 py-0.5 border border-[#00e5ff]/50">
                  INSPECT
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] bg-[#3b494c] text-[#051424] px-2 py-0.5 font-bold uppercase">
                  {featuredUnit.stealthClass}
                </span>
                <span className="font-mono text-sm font-bold text-[#00e5ff]">
                  {featuredUnit.speed}
                </span>
              </div>
              <p className="text-[#849396] text-xs leading-relaxed">
                {featuredUnit.description}
              </p>
            </div>
          </div>
        )}

        {/* Data Stream - Protocols V4.0 */}
        <div className="md:col-span-8 border border-[#3b494c] bg-[#1c2b3c] p-6 md:p-8 flex flex-col md:flex-row gap-8 font-mono justify-between">
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[#00e5ff] font-bold text-xl uppercase">PROTOCOLS_V4.0</h4>
              <button 
                onClick={() => router.push('/protocols')}
                className="text-xs text-[#849396] hover:text-[#00e5ff] underline uppercase cursor-pointer"
              >
                MANAGE_PROTOCOLS
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#3b494c] bg-[#051424]">
                <div className="text-2xl md:text-3xl font-bold text-[#d4e4fa]">99.9%</div>
                <div className="text-[10px] text-[#849396] uppercase font-bold mt-1">Uptime_Metric</div>
              </div>
              <div className="p-4 border border-[#3b494c] bg-[#051424]">
                <div className="text-2xl md:text-3xl font-bold text-[#d4e4fa]">0ms</div>
                <div className="text-[10px] text-[#849396] uppercase font-bold mt-1">Jitter_Variance</div>
              </div>
            </div>
          </div>

          <div className="md:w-1/3 flex items-center justify-center border-t md:border-t-0 md:border-l border-[#3b494c] pt-6 md:pt-0 md:pl-8">
            <div className="text-center">
              <span className="material-symbols-outlined text-[56px] md:text-[64px] text-[#00e5ff] mb-2 animate-pulse">
                verified
              </span>
              <div className="text-[10px] text-[#00e5ff] font-bold tracking-widest uppercase">
                SYSTEM_CERTIFIED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
