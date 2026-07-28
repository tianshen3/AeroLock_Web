'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Flight } from '../hooks/useFlights';

export interface FlightSearchBarProps {
  flights?: Flight[] | null;
  initialQuery?: string;
  onFilterResults?: (filteredFlights: Flight[]) => void;
  children?: ((filteredFlights: Flight[], searchQuery: string) => React.ReactNode) | React.ReactNode;
}

function FlightSearchBarContent({ flights, initialQuery, onFilterResults, children }: FlightSearchBarProps) {
  const searchParams = useSearchParams();
  const urlOrigin = searchParams?.get('origin') || '';
  const urlDestination = searchParams?.get('destination') || '';
  const urlGeneral = searchParams?.get('q') || searchParams?.get('query') || initialQuery || '';

  const [originQuery, setOriginQuery] = useState(urlOrigin);
  const [destinationQuery, setDestinationQuery] = useState(urlDestination);
  const [generalQuery, setGeneralQuery] = useState(urlGeneral);

  useEffect(() => {
    if (urlOrigin) setOriginQuery(urlOrigin);
    if (urlDestination) setDestinationQuery(urlDestination);
    if (urlGeneral) setGeneralQuery(urlGeneral);
  }, [urlOrigin, urlDestination, urlGeneral]);

  const filteredFlights = useMemo(() => {
    if (!Array.isArray(flights)) return [];

    const orig = originQuery.trim().toLowerCase();
    const dest = destinationQuery.trim().toLowerCase();
    const gen = generalQuery.trim().toLowerCase();

    if (!orig && !dest && !gen) return flights;

    return flights.filter((flight) => {
      if (!flight) return false;
      const flightOrigin = (flight.origin || '').toLowerCase();
      const flightDest = (flight.destination || '').toLowerCase();
      const flightNum = (flight.flightNumber || '').toLowerCase();

      // Strict Origin match
      const matchesOrigin = !orig || flightOrigin.includes(orig);
      // Strict Destination match
      const matchesDest = !dest || flightDest.includes(dest);
      // Fallback General search query match
      const matchesGeneral =
        !gen ||
        flightNum.includes(gen) ||
        flightOrigin.includes(gen) ||
        flightDest.includes(gen);

      return matchesOrigin && matchesDest && matchesGeneral;
    });
  }, [flights, originQuery, destinationQuery, generalQuery]);

  useEffect(() => {
    if (onFilterResults && Array.isArray(flights)) {
      onFilterResults(filteredFlights);
    }
  }, [filteredFlights, onFilterResults, flights]);

  if (flights === undefined || flights === null) {
    return (
      <div className="w-full bg-[#051424] border border-[#3b494c] p-4 text-[#bac9cc] font-mono text-xs rounded-none tracking-widest flex items-center justify-between">
        <span className="text-[#ffb4ab] font-bold">[ AWAITING_TELEMETRY ]</span>
        <span className="text-[#bac9cc]/50 text-[10px]">{'// FLIGHT_DATA_UNAVAILABLE'}</span>
      </div>
    );
  }

  const displayQuery = [
    originQuery ? `ORIGIN: "${originQuery.toUpperCase()}"` : '',
    destinationQuery ? `DEST: "${destinationQuery.toUpperCase()}"` : '',
    generalQuery ? `SEARCH: "${generalQuery.toUpperCase()}"` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const hasAnyFilter = Boolean(originQuery || destinationQuery || generalQuery);

  const handleClearAll = () => {
    setOriginQuery('');
    setDestinationQuery('');
    setGeneralQuery('');
  };

  return (
    <div className="w-full font-mono rounded-none space-y-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full bg-[#051424] border border-[#3b494c] p-3 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 transition-colors rounded-none"
      >
        {/* Origin Search Input (Strict Origin Filter) */}
        <div className="flex-1 flex items-center bg-[#0d1c2d] border border-[#3b494c] px-3 py-2 focus-within:border-[#00e5ff] transition-colors rounded-none">
          <span className="text-[#00e5ff] font-bold select-none text-xs mr-2 tracking-widest whitespace-nowrap">
            {'[>] FROM ::'}
          </span>
          <input
            type="text"
            value={originQuery}
            onChange={(e) => setOriginQuery(e.target.value)}
            placeholder="FILTER ORIGIN AIRPORT..."
            className="w-full bg-transparent text-[#00e5ff] font-mono text-xs uppercase placeholder:text-[#3b494c] focus:ring-0 focus:outline-none border-0 p-0 rounded-none tracking-wider"
          />
          {originQuery && (
            <button
              type="button"
              onClick={() => setOriginQuery('')}
              className="text-[#bac9cc] hover:text-[#00e5ff] text-[10px] font-bold uppercase tracking-widest ml-1 cursor-pointer"
            >
              [X]
            </button>
          )}
        </div>

        {/* Destination Search Input (Strict Destination Filter) */}
        <div className="flex-1 flex items-center bg-[#0d1c2d] border border-[#3b494c] px-3 py-2 focus-within:border-[#00e5ff] transition-colors rounded-none">
          <span className="text-[#00e5ff] font-bold select-none text-xs mr-2 tracking-widest whitespace-nowrap">
            {'[>] TO ::'}
          </span>
          <input
            type="text"
            value={destinationQuery}
            onChange={(e) => setDestinationQuery(e.target.value)}
            placeholder="FILTER DESTINATION AIRPORT..."
            className="w-full bg-transparent text-[#00e5ff] font-mono text-xs uppercase placeholder:text-[#3b494c] focus:ring-0 focus:outline-none border-0 p-0 rounded-none tracking-wider"
          />
          {destinationQuery && (
            <button
              type="button"
              onClick={() => setDestinationQuery('')}
              className="text-[#bac9cc] hover:text-[#00e5ff] text-[10px] font-bold uppercase tracking-widest ml-1 cursor-pointer"
            >
              [X]
            </button>
          )}
        </div>

        {/* Reset / Clear All Filters */}
        {hasAnyFilter && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[#bac9cc] hover:text-[#00e5ff] text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-none border border-[#3b494c] bg-[#122131] hover:border-[#00e5ff] transition-colors cursor-pointer whitespace-nowrap"
          >
            RESET_FILTERS
          </button>
        )}
      </form>

      {typeof children === 'function' ? children(filteredFlights, displayQuery) : children}
    </div>
  );
}

export function FlightSearchBar(props: FlightSearchBarProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#051424] border border-[#3b494c] p-4 text-[#bac9cc] font-mono text-xs rounded-none">
          [ SYS ] INITIALIZING_SEARCH_FILTERS...
        </div>
      }
    >
      <FlightSearchBarContent {...props} />
    </Suspense>
  );
}

export default FlightSearchBar;
