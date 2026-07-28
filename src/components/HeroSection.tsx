'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTerminal } from '../context/TerminalContext';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { metrics, handleInitiateSearch } = useTerminal();
  const [fromOrigin, setFromOrigin] = useState('');
  const [toDestination, setToDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('2026-07-25');
  const [pax, setPax] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInitiateSearch({
      origin: fromOrigin,
      destination: toDestination,
      date: departureDate,
      pax,
    });
    const params = new URLSearchParams();
    if (fromOrigin.trim()) params.set('origin', fromOrigin.trim());
    if (toDestination.trim()) params.set('destination', toDestination.trim());

    const queryString = params.toString();
    router.push(queryString ? `/flights?${queryString}` : '/flights');
  };

  return (
    <section className="relative w-full h-auto min-h-[580px] flex items-center justify-center bg-[#12141A] grid-bg overflow-hidden border-b border-[#3b494c] py-12 md:py-16">
      <div className="scanline"></div>

      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 space-y-10">
        {/* Branding Context */}
        <div className="text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00e5ff]/30 bg-[#00e5ff]/5 text-[#00e5ff] text-[10px] tracking-widest font-bold">
            <span className="material-symbols-outlined text-[14px] animate-pulse">radar</span>
            SYSTEM_STATUS: {metrics.systemStatus}
          </div>

          <h1 className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#d4e4fa] tracking-tighter max-w-3xl leading-tight font-extrabold uppercase">
            SECURE_AIR_TRAFFIC<br />
            <span className="text-[#00e5ff]">COORDINATION_NODE</span>
          </h1>
        </div>

        {/* Horizontal Search Bar Hero Component */}
        <div className="bg-[#0d1c2d] border border-[#3b494c] p-2 md:p-0 shadow-2xl relative">
          {/* Corner Accents */}
          <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#00e5ff] z-20"></div>
          <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#00e5ff] z-20"></div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full divide-y md:divide-y-0 md:divide-x divide-[#3b494c]">
            {/* Origin */}
            <div className="flex-1 p-4 group relative">
              <label className="block text-[#849396] text-[10px] font-bold tracking-widest mb-1 uppercase group-focus-within:text-[#00e5ff] transition-colors">
                From
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[#3b494c] mr-2 text-[20px] group-focus-within:text-[#00e5ff]">
                  flight_takeoff
                </span>
                <input
                  type="text"
                  value={fromOrigin}
                  onChange={(e) => setFromOrigin(e.target.value)}
                  placeholder="ORIGIN_AIRPORT"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[#d4e4fa] font-mono text-sm placeholder:text-[#3b494c] p-0 uppercase"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="flex-1 p-4 group relative">
              <label className="block text-[#849396] text-[10px] font-bold tracking-widest mb-1 uppercase group-focus-within:text-[#00e5ff] transition-colors">
                To
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[#3b494c] mr-2 text-[20px] group-focus-within:text-[#00e5ff]">
                  flight_land
                </span>
                <input
                  type="text"
                  value={toDestination}
                  onChange={(e) => setToDestination(e.target.value)}
                  placeholder="DESTINATION_AIRPORT"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[#d4e4fa] font-mono text-sm placeholder:text-[#3b494c] p-0 uppercase"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div className="flex-1 p-4 group relative">
              <label className="block text-[#849396] text-[10px] font-bold tracking-widest mb-1 uppercase group-focus-within:text-[#00e5ff] transition-colors">
                Departure Date
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[#3b494c] mr-2 text-[20px] group-focus-within:text-[#00e5ff]">
                  calendar_today
                </span>
                <input
                  type="text"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[#d4e4fa] font-mono text-sm placeholder:text-[#3b494c] p-0"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="w-full md:w-32 p-4 group relative">
              <label className="block text-[#849396] text-[10px] font-bold tracking-widest mb-1 uppercase group-focus-within:text-[#00e5ff] transition-colors">
                Pax
              </label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[#3b494c] mr-2 text-[20px] group-focus-within:text-[#00e5ff]">
                  groups
                </span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={pax}
                  onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[#d4e4fa] font-mono text-sm p-0"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="p-0 md:p-1 flex items-stretch">
              <button
                type="submit"
                className="w-full bg-[#00e5ff] text-[#051424] font-bold text-sm px-8 py-5 md:py-0 tracking-tighter flex items-center justify-center gap-2 hover:bg-[#00daf3] transition-none active:scale-[0.98] uppercase cursor-pointer"
              >
                <span>INITIATE SEARCH</span>
                <span className="material-symbols-outlined text-lg">bolt</span>
              </button>
            </div>
          </form>
        </div>

        {/* Technical Sub-content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="border-l-2 border-[#00e5ff] pl-4 py-2 bg-[#0d1c2d]/40">
            <div className="text-[10px] text-[#849396] font-bold tracking-widest uppercase">Encryption_Level</div>
            <div className="text-[#00e5ff] font-mono text-sm font-bold">{metrics.encryptionLevel}</div>
          </div>
          <div className="border-l-2 border-[#00e5ff] pl-4 py-2 bg-[#0d1c2d]/40">
            <div className="text-[10px] text-[#849396] font-bold tracking-widest uppercase">Node_Ping</div>
            <div className="text-[#00e5ff] font-mono text-sm font-bold flex items-center gap-1.5">
              <span>{metrics.nodePingMs}ms</span>
              <span className="text-[8px] text-emerald-400 animate-pulse">●</span>
            </div>
          </div>
          <div className="border-l-2 border-[#00e5ff] pl-4 py-2 bg-[#0d1c2d]/40">
            <div className="text-[10px] text-[#849396] font-bold tracking-widest uppercase">Fleet_Active</div>
            <div className="text-[#00e5ff] font-mono text-sm font-bold">
              {metrics.activeFleetCount.toLocaleString()}_UNITS
            </div>
          </div>
          <div className="border-l-2 border-[#00e5ff] pl-4 py-2 bg-[#0d1c2d]/40">
            <div className="text-[10px] text-[#849396] font-bold tracking-widest uppercase">Auth_Scope</div>
            <div className="text-[#00e5ff] font-mono text-sm font-bold">{metrics.authScope}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
