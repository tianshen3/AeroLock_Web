'use client';

import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { FlightVector, ClearanceLevel } from '../../types';
import { useJoinWaitlist } from '../../hooks/useWaitlist';

interface SearchViewProps {
  flights?: FlightVector[];
  userClearance?: ClearanceLevel;
  initialQuery?: { origin: string; destination: string; date: string; pax: number };
  onBookFlight?: (flight: FlightVector) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  flights,
  userClearance,
  initialQuery,
  onBookFlight,
}) => {
  const { flights: contextFlights, operator, handleBookFlight } = useTerminal();
  const availableFlights = flights || contextFlights;
  const currentClearance = userClearance || operator.clearance;
  const bookFlight = onBookFlight || handleBookFlight;

  const [originFilter, setOriginFilter] = useState(initialQuery?.origin || '');
  const [destFilter, setDestFilter] = useState(initialQuery?.destination || '');
  const [clearanceFilter, setClearanceFilter] = useState<string>('ALL');
  const [bookedSuccessId, setBookedSuccessId] = useState<string | null>(null);
  const [waitlistNotice, setWaitlistNotice] = useState<string | null>(null);

  const joinWaitlistMutation = useJoinWaitlist();

  const filteredFlights = availableFlights.filter((flight) => {
    const matchesOrigin = !originFilter || flight.origin.toLowerCase().includes(originFilter.toLowerCase()) || flight.originCode.toLowerCase().includes(originFilter.toLowerCase());
    const matchesDest = !destFilter || flight.destination.toLowerCase().includes(destFilter.toLowerCase()) || flight.destinationCode.toLowerCase().includes(destFilter.toLowerCase());
    const matchesClearance = clearanceFilter === 'ALL' || flight.clearanceRequired === clearanceFilter;
    return matchesOrigin && matchesDest && matchesClearance;
  });

  const handleBook = (flight: FlightVector) => {
    bookFlight(flight);
    setBookedSuccessId(flight.id);
    setTimeout(() => setBookedSuccessId(null), 4000);
  };

  const handleJoinWaitlist = (flight: FlightVector) => {
    const flightIdNum = parseInt(flight.id, 10) || 1;
    joinWaitlistMutation.mutate(
      { flightId: flightIdNum },
      {
        onSuccess: () => {
          setWaitlistNotice(`ADDED TO WAITLIST FOR FLIGHT ${flight.flightCode}`);
          setTimeout(() => setWaitlistNotice(null), 4000);
        },
        onError: (err) => {
          setWaitlistNotice(`WAITLIST_ERROR: ${err.message}`);
          setTimeout(() => setWaitlistNotice(null), 4000);
        },
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6">
      {/* Title Header */}
      <div className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">search</span>
            FLIGHT_VECTOR_SEARCH
          </h2>
          <p className="text-xs text-[#849396] mt-1">
            QUERY REAL-TIME STEALTH AIR CORRIDORS AND HIGH-PRIORITY CLEARANCE SLOTS
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-[#122131] border border-[#3b494c] p-2">
          <span className="text-[#849396]">YOUR CLEARANCE:</span>
          <span className="text-[#00e5ff] font-bold">{currentClearance}</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0d1c2d] border border-[#3b494c] p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block text-[#849396] font-bold uppercase mb-1">Origin Terminal / Code</label>
          <input
            type="text"
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            placeholder="e.g. LHR_T7, London..."
            className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none uppercase"
          />
        </div>

        <div>
          <label className="block text-[#849396] font-bold uppercase mb-1">Destination Node</label>
          <input
            type="text"
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            placeholder="e.g. HND_CN, Tokyo..."
            className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none uppercase"
          />
        </div>

        <div>
          <label className="block text-[#849396] font-bold uppercase mb-1">Clearance Requirement</label>
          <select
            value={clearanceFilter}
            onChange={(e) => setClearanceFilter(e.target.value)}
            className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#00e5ff] font-bold focus:border-[#00e5ff] focus:outline-none"
          >
            <option value="ALL">ALL CLEARANCE LEVELS</option>
            <option value="L1_CIVILIAN">L1_CIVILIAN (USER)</option>
            <option value="L2_COMMAND">L2_COMMAND (ADMIN)</option>
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {bookedSuccessId && (
        <div className="bg-[#00e5ff]/20 border-2 border-[#00e5ff] p-4 text-[#00e5ff] font-bold text-xs flex justify-between items-center animate-bounce rounded-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            <span>CLEARANCE SLOT RESERVED FOR FLIGHT {bookedSuccessId}. DISPATCH TELEMETRY LOGGED.</span>
          </div>
          <span className="text-[10px] uppercase text-[#d4e4fa]">VIEW IN BOOKINGS TAB</span>
        </div>
      )}

      {waitlistNotice && (
        <div className="bg-[#00e5ff]/20 border-2 border-[#00e5ff] p-4 text-[#00e5ff] font-bold text-xs flex justify-between items-center animate-bounce rounded-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">format_list_bulleted</span>
            <span>{waitlistNotice}</span>
          </div>
          <span className="text-[10px] uppercase text-[#d4e4fa]">VIEW IN WAITLIST TAB</span>
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="text-xs text-[#849396] font-bold uppercase flex justify-between">
          <span>FOUND {filteredFlights.length} SCHEDULED FLIGHT VECTORS</span>
          <span>REAL-TIME AES-256 SYNC</span>
        </div>

        {filteredFlights.length === 0 ? (
          <div className="bg-[#122131] border border-[#3b494c] p-12 text-center text-[#849396]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#3b494c]">warning</span>
            <p className="uppercase font-bold text-sm">NO MATCHING FLIGHT VECTORS FOUND</p>
            <p className="text-xs mt-1">Try resetting search filters or requesting a custom NEW_MISSION.</p>
          </div>
        ) : (
          filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-[#0d1c2d] border border-[#3b494c] p-6 hover:border-[#00e5ff] transition-all relative group"
            >
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                {/* Left Flight Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[#00e5ff]">{flight.flightCode}</span>
                    <span className="text-[10px] bg-[#3b494c] text-[#051424] font-bold px-2 py-0.5 uppercase">
                      {flight.stealthClass}
                    </span>
                    <span className="text-xs text-[#d4e4fa] border border-[#3b494c] px-2 py-0.5 font-bold">
                      {flight.speed}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="font-bold text-[#d4e4fa]">{flight.origin}</div>
                      <div className="text-[10px] text-[#849396] font-mono">{flight.originCode}</div>
                    </div>
                    <span className="material-symbols-outlined text-[#00e5ff]">arrow_forward</span>
                    <div>
                      <div className="font-bold text-[#d4e4fa]">{flight.destination}</div>
                      <div className="text-[10px] text-[#849396] font-mono">{flight.destinationCode}</div>
                    </div>
                  </div>
                </div>

                {/* Center Timings */}
                <div className="grid grid-cols-2 gap-4 text-xs border-y lg:border-y-0 lg:border-x border-[#3b494c] py-3 lg:py-0 lg:px-6">
                  <div>
                    <span className="text-[10px] text-[#849396] block uppercase">DEPARTURE</span>
                    <span className="font-bold text-[#d4e4fa]">{flight.departureTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#849396] block uppercase">EST. DURATION</span>
                    <span className="font-bold text-[#00e5ff]">{flight.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#849396] block uppercase">PAX SLOTS</span>
                    <span className="font-bold text-emerald-400">
                      {flight.availablePax} / {flight.paxCapacity} AVAILABLE
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#849396] block uppercase">ENCRYPTION</span>
                    <span className="font-bold text-[#bac9cc]">{flight.encryption}</span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-[10px] text-[#849396]">
                    CLEARANCE: <strong className="text-[#00e5ff]">{flight.clearanceRequired}</strong>
                  </div>
                  <div>
                    {flight.availablePax <= 0 ? (
                      <button
                        onClick={() => handleJoinWaitlist(flight)}
                        disabled={joinWaitlistMutation.isPending}
                        className="bg-[#00e5ff] text-[#051424] font-bold text-xs px-6 py-3 uppercase hover:bg-[#00daf3] transition-none cursor-pointer flex items-center gap-2 rounded-none disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>{joinWaitlistMutation.isPending ? '[ JOINING... ]' : '[+] JOIN_WAITLIST'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(flight)}
                        className="bg-[#00e5ff] text-[#051424] font-bold text-xs px-6 py-3 uppercase hover:bg-[#00daf3] transition-none cursor-pointer flex items-center gap-2 rounded-none"
                      >
                        <span>RESERVE CLEARANCE</span>
                        <span className="material-symbols-outlined text-sm">airplane_ticket</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
