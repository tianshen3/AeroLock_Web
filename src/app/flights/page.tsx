'use client';

import React, { useState } from 'react';
import { useFlights } from '../../hooks/useFlights';
import { SeatsModal } from '../../components/SeatsModal';

export default function FlightsPage() {
  const { data: flights, isLoading, isError, refetch } = useFlights();
  const [selectedSeatFlight, setSelectedSeatFlight] = useState<string | null>(null);

  return (
    <div className="w-full space-y-6 font-mono text-[#d4e4fa] p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#3b494c] pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#d4e4fa] tracking-tighter">
            ACTIVE_FLIGHT_NETWORK
          </h1>
          <p className="text-[#bac9cc] mt-1 tracking-widest text-xs">
            {'// GLOBAL_ROSTER_AND_SCHEDULES'}
          </p>
        </div>
        <div className="bg-[#122131] border border-[#3b494c] px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00e5ff] animate-pulse"></div>
          <span className="text-xs font-semibold text-[#00e5ff] animate-pulse">
            [ NETWORK: ONLINE ]
          </span>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full bg-[#0d1c2d] border border-[#3b494c] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-[#00e5ff] animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-[#00e5ff] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-4 bg-[#00e5ff] animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <span className="text-xs font-semibold text-[#00e5ff] animate-pulse tracking-[0.3em]">
              SCANNING_AIRSPACE_FOR_VECTORS...
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-[10px] text-[#849396] font-mono">
            <span>BUFF_SIZE: 128KB</span>
            <span>LATENCY: 14MS</span>
            <span>PEER_ID: node_0x44F</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="w-full bg-[#93000a]/20 border border-[#ffb4ab]/50 p-4 text-[#ffb4ab] font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#ffb4ab] animate-ping"></span>
            <span>[SYS_ERROR]: FAILED_TO_RETRIEVE_FLIGHT_MANIFEST</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-[#ffb4ab] text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors text-xs font-bold cursor-pointer"
          >
            RETRY_SCAN
          </button>
        </div>
      )}

      {/* Data Mapping / Flight Roster */}
      {!isLoading && !isError && flights && flights.length > 0 && (
        <section className="flex flex-col gap-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-[#122131] border border-[#3b494c] p-4 md:p-6 mb-4 flex flex-col justify-between gap-4 transition-colors hover:border-[#00e5ff] cursor-default group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                {/* Identifier */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#bac9cc] tracking-[0.3em] font-semibold">
                    IDENTIFIER
                  </span>
                  <span className="text-lg md:text-xl font-bold text-[#00e5ff]">
                    FLIGHT: {flight.flightNumber}
                  </span>
                </div>

                {/* Route */}
                <div className="flex flex-col items-start md:items-center">
                  <span className="text-[10px] text-[#bac9cc] mb-1 tracking-[0.3em] font-semibold">
                    VECTOR
                  </span>
                  <div className="flex items-center gap-3 text-lg md:text-xl font-bold text-[#d4e4fa]">
                    <span>{flight.origin.toUpperCase()}</span>
                    <span className="text-[#00e5ff] text-base opacity-70 tracking-[-0.2em]">
                      ----&gt;&gt;
                    </span>
                    <span>{flight.destination.toUpperCase()}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex flex-col md:items-end gap-1">
                  <span className="text-[10px] text-[#bac9cc] tracking-[0.3em] font-semibold">
                    TELEMETRY
                  </span>
                  <div className="text-[#bac9cc] text-xs font-mono">
                    <span className="text-[#849396]">DEP:</span>{' '}
                    {new Date(flight.departureTime).toLocaleString()} |{' '}
                    <span className="text-[#849396]">ARR:</span>{' '}
                    {new Date(flight.arrivalTime).toLocaleString()}
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  <button
                    onClick={() => setSelectedSeatFlight(flight.flightNumber)}
                    className="inline-block text-center w-full md:w-auto bg-transparent border border-[#3b494c] text-[#00e5ff] px-4 py-2 hover:bg-[#00e5ff]/10 hover:border-[#00e5ff] transition-colors text-xs font-bold cursor-pointer"
                  >
                    VIEW_SEATS
                  </button>
                </div>
              </div>

              {/* Technical Telemetry Metadata */}
              <div className="mt-2 pt-3 border-t border-[#3b494c]/40 flex flex-wrap justify-between text-[10px] font-mono text-[#849396]">
                <div className="flex gap-4">
                  <span>STATUS: {flight.status || 'EN_ROUTE'}</span>
                  <span>CRAFT: {flight.craft || 'BOEING_787_D'}</span>
                  <span>LOAD: {flight.load || '84%'}</span>
                </div>
                <span className="text-[#00e5ff]/40">TIMESTAMP: 08:42:12 UTC</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !isError && flights && flights.length === 0 && (
        <div className="w-full bg-[#122131] border border-[#3b494c] p-8 text-center text-[#bac9cc] text-xs">
          NO_FLIGHT_MANIFESTS_FOUND_IN_AIRSPACE
        </div>
      )}

      {/* Seats Modal */}
      {selectedSeatFlight && (
        <SeatsModal
          flightNumber={selectedSeatFlight}
          onClose={() => setSelectedSeatFlight(null)}
        />
      )}
    </div>
  );
}
