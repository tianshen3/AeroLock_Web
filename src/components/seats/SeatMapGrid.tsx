'use client';

import React from 'react';
import { Seat } from '@/src/hooks/useSeats';
import { formatCurrency } from '@/src/utils/formatCurrency';

interface SeatMapGridProps {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSelectSeat: (seat: Seat) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

/**
 * Determines seat tier based on seat column letter (Window, Aisle, Middle).
 */
export function getSeatTier(seatNumber: string): {
  type: 'WINDOW' | 'AISLE' | 'MIDDLE';
  label: string;
  badgeClass: string;
} {
  const lastChar = seatNumber.trim().slice(-1).toUpperCase();
  if (lastChar === 'A' || lastChar === 'F') {
    return {
      type: 'WINDOW',
      label: 'WINDOW',
      badgeClass: 'text-[#ffd700] border-[#ffd700]/40 bg-[#ffd700]/5',
    };
  }
  if (lastChar === 'C' || lastChar === 'D') {
    return {
      type: 'AISLE',
      label: 'AISLE',
      badgeClass: 'text-[#00e5ff] border-[#00e5ff]/40 bg-[#00e5ff]/5',
    };
  }
  return {
    type: 'MIDDLE',
    label: 'MIDDLE',
    badgeClass: 'text-[#4caf50] border-[#4caf50]/40 bg-[#4caf50]/5',
  };
}

export function SeatMapGrid({
  seats,
  selectedSeat,
  onSelectSeat,
  isLoading,
  isError,
  errorMessage,
}: SeatMapGridProps) {
  // Sort seats by row number and seat letter
  const sortedSeats = React.useMemo(() => {
    if (!Array.isArray(seats)) return [];
    return [...seats].sort((a, b) => {
      const rowA = parseInt(a.seatNumber, 10) || 0;
      const rowB = parseInt(b.seatNumber, 10) || 0;
      if (rowA !== rowB) return rowA - rowB;
      return a.seatNumber.localeCompare(b.seatNumber);
    });
  }, [seats]);

  return (
    <div className="bg-[#122131] border border-[#3b494c] p-4 md:p-6 relative font-mono">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[#3b494c] pb-3 mb-6">
        <span className="text-xs font-bold text-[#00e5ff] tracking-widest uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">event_seat</span>
          FUSELAGE_GRID_CONTAINER
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-[#00e5ff] animate-pulse"></div>
          <span className="text-[10px] text-[#bac9cc] tracking-wider uppercase">
            LIVE_PRICING_ACTIVE
          </span>
        </div>
      </div>

      {/* Cockpit Forward Vector Indicator */}
      <div className="text-center py-2 mb-6 bg-[#0d1c2d] border border-[#3b494c] text-[10px] text-[#849396] tracking-[0.3em] font-bold uppercase select-none">
        ▲ COCKPIT / FORWARD VECTOR ▲
      </div>

      {isLoading && (
        <div className="p-12 text-center text-xs text-[#00e5ff] animate-pulse tracking-widest">
          [SYS] FETCHING_DYNAMIC_SEAT_PRICES...
        </div>
      )}

      {isError && (
        <div className="p-8 text-center text-xs text-[#ffb4ab] tracking-widest">
          [SYS] ERROR_RETRIEVING_SEAT_PRICES: {errorMessage || 'NETWORK_FAILURE'}
        </div>
      )}

      {!isLoading && !isError && sortedSeats.length === 0 && (
        <div className="p-8 text-center text-xs text-[#bac9cc] tracking-widest">
          NO_SEATS_FOUND_FOR_FLIGHT_MANIFEST
        </div>
      )}

      {!isLoading && !isError && sortedSeats.length > 0 && (
        <>
          {/* Interactive Aircraft 3-3 Seat Grid */}
          <div className="grid grid-cols-7 gap-2 max-w-lg mx-auto">
            {sortedSeats.map((seat, index) => {
              const isUnavailable = seat.status !== 'AVAILABLE';
              const isSelected = selectedSeat?.id === seat.id;
              const tier = getSeatTier(seat.seatNumber);
              const priceDisplay = formatCurrency(seat.price);

              return (
                <React.Fragment key={seat.id ?? index}>
                  <button
                    disabled={isUnavailable}
                    onClick={() => onSelectSeat(seat)}
                    title={`${seat.seatNumber} (${tier.label}) - ${priceDisplay} [${seat.status}]`}
                    className={`relative p-1.5 flex flex-col items-center justify-between h-16 text-xs transition-all select-none rounded-none border ${
                      isUnavailable
                        ? 'border-[#ffb4ab]/20 text-[#ffb4ab]/40 bg-[#ffb4ab]/5 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-2 border-[#00e5ff] bg-[#00e5ff]/20 text-[#00e5ff] font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer scale-[1.03]'
                        : 'border-[#3b494c] text-[#d4e4fa] bg-[#0d1c2d] hover:border-[#00e5ff]/70 hover:bg-[#1c2b3c] cursor-pointer'
                    }`}
                  >
                    {/* Seat Number & Tier Accent */}
                    <div className="w-full flex items-center justify-between text-[10px]">
                      <span className="font-bold tracking-wider">{seat.seatNumber}</span>
                      <span className={`text-[8px] px-0.5 border ${tier.badgeClass}`}>
                        {tier.label[0]}
                      </span>
                    </div>

                    {/* Price Tag or Status Badge */}
                    <div className="mt-1 text-center w-full">
                      {isUnavailable ? (
                        <span className="text-[9px] uppercase tracking-tighter text-[#ffb4ab]/50 block">
                          {seat.status === 'LOCKED' ? 'HELD' : 'TAKEN'}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold tracking-tight block truncate ${
                            isSelected ? 'text-[#00e5ff]' : 'text-[#849396] group-hover:text-[#00e5ff]'
                          }`}
                        >
                          {priceDisplay}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Insert aisle gap after every 3rd seat in a row (6 seats total per row + 1 aisle) */}
                  {index % 6 === 2 && (
                    <div className="h-16 flex items-center justify-center text-[10px] text-[#849396]/60 select-none border border-[#3b494c]/20 bg-[#051424] font-bold">
                      R{String(Math.floor(index / 6) + 1).padStart(2, '0')}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Seat Grid Legend & Tier Guide */}
          <div className="mt-8 border-t border-[#3b494c] pt-4 space-y-3">
            <div className="flex flex-wrap justify-center gap-4 text-[11px] font-semibold uppercase">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border border-[#3b494c] bg-[#0d1c2d]"></div>
                <span className="text-[#bac9cc]">AVAILABLE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border border-[#ffb4ab]/30 bg-[#ffb4ab]/5"></div>
                <span className="text-[#bac9cc]">OCCUPIED / HELD</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-[#00e5ff] bg-[#00e5ff]/20"></div>
                <span className="text-[#00e5ff]">SELECTED</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-[10px] text-[#bac9cc] pt-2 border-t border-[#3b494c]/40">
              <div className="flex items-center gap-1">
                <span className="px-1 border border-[#ffd700]/40 text-[#ffd700] bg-[#ffd700]/5 font-bold">W</span>
                <span>WINDOW TIER</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 border border-[#00e5ff]/40 text-[#00e5ff] bg-[#00e5ff]/5 font-bold">A</span>
                <span>AISLE TIER</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 border border-[#4caf50]/40 text-[#4caf50] bg-[#4caf50]/5 font-bold">M</span>
                <span>MIDDLE TIER</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
