'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFlights } from '../../hooks/useFlights';
import { SeatsModal } from '../../components/SeatsModal';
import { FlightSearchBar } from '../../components/FlightSearchBar';

export default function FlightsPage() {
  const { data: flights, isLoading, isError } = useFlights();
  const [selectedSeatFlight, setSelectedSeatFlight] = useState<string | null>(null);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'TBD';
    try {
      return timeStr.substring(0, 16).replace('T', ' ') + 'Z';
    } catch {
      return 'INVALID_DATE';
    }
  };

  const safeFlights = Array.isArray(flights) ? flights : [];

  return (
    <div className="w-full min-h-screen bg-[#051424] font-mono text-[#d4e4fa] p-6 md:p-8 max-w-7xl mx-auto space-y-6">
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
        <div className="w-full border border-[#3b494c] p-6 text-[#00e5ff] flex justify-center bg-[#0d1c2d]">
          <span className="text-xs font-semibold animate-pulse tracking-[0.3em]">
            [SYS] SCANNING_AIRSPACE_FOR_VECTORS...
          </span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="w-full border border-[#ffb4ab] p-6 text-[#ffb4ab] flex justify-center bg-[#93000a]/20">
          <span className="text-xs font-semibold tracking-[0.3em]">
            [SYS_ERROR]: FAILED_TO_RETRIEVE_FLIGHT_MANIFEST
          </span>
        </div>
      )}

      {/* Data Mapping / Flight Roster */}
      {!isLoading && !isError && safeFlights.length > 0 && (
        <FlightSearchBar flights={flights}>
          {(filteredFlights, searchQuery) => {
            console.log(
              '[AEROLOCK_DEBUG] Search Query:',
              searchQuery,
              '| Live Array:',
              flights?.length,
              '| Filtered Result:',
              filteredFlights.length
            );

            return (
              <section className="flex flex-col">
                {filteredFlights.length === 0 ? (
                  <div className="p-4 border border-[#ffb4ab] text-[#ffb4ab] bg-[#122131] font-mono uppercase tracking-widest text-sm rounded-none">
                    [!] NO VECTOR MATCH FOR: {searchQuery}
                  </div>
                ) : (
                  filteredFlights.map((flight, index) => (
                    <div
                      key={flight.id ?? index}
                      className="bg-[#122131] border border-[#3b494c] p-4 md:p-6 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-[#00e5ff] cursor-default"
                    >
                      {/* Identifier */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[#bac9cc] tracking-[0.3em] font-semibold">
                          IDENTIFIER
                        </span>
                        <span className="text-lg md:text-xl font-bold text-[#00e5ff]">
                          FLIGHT: {flight.flightNumber || 'UNKNOWN'}
                        </span>
                      </div>

                      {/* Route */}
                      <div className="flex flex-col items-start md:items-center">
                        <span className="text-[10px] text-[#bac9cc] mb-1 tracking-[0.3em] font-semibold">
                          VECTOR
                        </span>
                        <div className="text-[#d4e4fa] font-bold text-lg md:text-xl">
                          {(flight.origin || 'UNKNOWN').toUpperCase()} ----&gt;&gt; {(flight.destination || 'UNKNOWN').toUpperCase()}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex flex-col md:items-end gap-1">
                        <span className="text-[10px] text-[#bac9cc] tracking-[0.3em] font-semibold">
                          TELEMETRY
                        </span>
                        <div className="text-[#bac9cc] text-xs">
                          DEP: {formatTime(flight.departureTime)} | ARR: {formatTime(flight.arrivalTime)}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link
                          href={`/flights/${flight.id ?? flight.flightNumber}/seats`}
                          className="bg-transparent border border-[#3b494c] text-[#00e5ff] px-4 py-2 hover:bg-[#00e5ff]/10 hover:border-[#00e5ff] transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer inline-block no-underline"
                        >
                          VIEW_SEATS
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </section>
            );
          }}
        </FlightSearchBar>
      )}

      {/* Empty State */}
      {!isLoading && !isError && safeFlights.length === 0 && (
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
