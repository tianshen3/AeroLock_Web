'use client';

import React, { useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSeats, useLockSeat, Seat } from '@/src/hooks/useSeats';

export default function SeatMatrixPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawFlightId = (params?.flightId || params?.id) as string;
  const flightId = rawFlightId || 'AI101';

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: seats = [], isLoading, isError, error } = useSeats(flightId);
  const lockMutation = useLockSeat();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeat(seat);
    setSuccessMessage(null);
  };

  const handleLockSequence = () => {
    if (!selectedSeat || lockMutation.isPending) return;

    // Check if user is logged in
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('accessToken'))
      : null;

    if (!token) {
      // Unauthenticated: Bypass TanStack mutation completely and redirect to login
      const encodedPath = encodeURIComponent(pathname);
      router.push('/login?returnUrl=' + encodedPath);
      return;
    }

    // Authenticated: Initiate lock mutation and route to checkout on success
    const parsedFlightId = !isNaN(Number(flightId)) ? Number(flightId) : flightId;
    const targetSeatId = selectedSeat.id;

    lockMutation.mutate(
      { flightId: parsedFlightId, seatId: targetSeatId },
      {
        onSuccess: () => {
          setSuccessMessage(`[SYS] LOCK_SEQUENCE_SUCCESS: SEAT ${selectedSeat.seatNumber} CONFIRMED`);
          setSelectedSeat(null);
          router.push('/checkout?flightId=' + flightId + '&seatId=' + targetSeatId);
        },
        onError: (err: Error) => {
          console.error('Lock sequence error:', err);
        },
      }
    );
  };

  // Sort seats deterministically by row number and seat letter
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
    <div className="w-full h-full flex flex-col gap-6 p-4 md:p-8 bg-[#051424] text-[#d4e4fa] font-mono relative grid-blueprint min-h-screen">
      <div className="scanline"></div>

      {/* Header Override */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3b494c] pb-4">
        <div>
          <Link
            href="/flights"
            className="flex items-center gap-1.5 text-[#00e5ff] hover:bg-[#00e5ff]/10 px-2 py-1 transition-none mb-2 active:scale-95 text-xs font-semibold tracking-widest uppercase cursor-pointer no-underline w-fit"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>[ TERMINATE_LINK ]</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-[#00e5ff] tracking-widest uppercase">
            SEAT_MATRIX_OVERRIDE {'//'} FLIGHT: {flightId}
          </h1>
        </div>
        <div className="text-xs text-[#bac9cc] mt-2 md:mt-0 uppercase">
          SYS_STATUS: <span className="text-[#00e5ff]">OPTIMAL</span> {'//'} LATENCY: 4.2ms
        </div>
      </div>

      {/* Dashboard Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Fuselage / Seat Grid Matrix */}
        <div className="lg:col-span-8 bg-[#122131] border border-[#3b494c] p-6 relative">
          <div className="flex items-center justify-between border-b border-[#3b494c] pb-3 mb-6">
            <span className="text-xs font-bold text-[#00e5ff] tracking-widest uppercase">
              FUSELAGE_GRID_CONTAINER
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-none bg-[#00e5ff] animate-pulse"></div>
              <span className="text-[10px] text-[#bac9cc] tracking-wider uppercase">
                CABIN_SENSORS_ONLINE
              </span>
            </div>
          </div>

          {/* Aircraft Cockpit Direction Indicator */}
          <div className="text-center py-2 mb-6 bg-[#0d1c2d] border border-[#3b494c] text-[10px] text-[#849396] tracking-[0.3em] font-bold uppercase select-none">
            ▲ COCKPIT / FORWARD VECTOR ▲
          </div>

          {isLoading && (
            <div className="p-8 text-center text-xs text-[#00e5ff] animate-pulse font-mono tracking-widest">
              [SYS] LOADING_TARGET_MATRIX...
            </div>
          )}

          {isError && (
            <div className="p-8 text-center text-xs text-[#ffb4ab] font-mono tracking-widest">
              [SYS] ERROR_RETRIEVING_SEAT_MANIFEST: {(error as Error)?.message || 'NETWORK_FAILURE'}
            </div>
          )}

          {!isLoading && !isError && sortedSeats.length === 0 && (
            <div className="p-8 text-center text-xs text-[#bac9cc] font-mono tracking-widest">
              NO_SEATS_FOUND_FOR_FLIGHT_MANIFEST
            </div>
          )}

          {!isLoading && !isError && sortedSeats.length > 0 && (
            <>
              {/* Dynamic 3-3 Aircraft Seat Grid */}
              <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
                {sortedSeats.map((seat, index) => {
                  const isUnavailable = seat.status !== 'AVAILABLE';
                  const isSelected = selectedSeat?.id === seat.id;

                  return (
                    <React.Fragment key={seat.id ?? index}>
                      <button
                        disabled={isUnavailable}
                        onClick={() => handleSeatClick(seat)}
                        className={`aspect-square font-mono text-xs flex items-center justify-center transition-none select-none rounded-none ${
                          isUnavailable
                            ? 'border border-[#ffb4ab]/30 text-[#ffb4ab]/40 bg-[#ffb4ab]/5 cursor-not-allowed'
                            : isSelected
                            ? 'border-2 border-[#00e5ff] bg-[#00e5ff]/20 text-[#00e5ff] font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] cursor-pointer'
                            : 'border border-[#3b494c] text-[#bac9cc] hover:bg-[#1c2b3c] active:bg-[#00e5ff]/20 cursor-pointer'
                        }`}
                      >
                        {seat.seatNumber}
                      </button>

                      {/* Insert aisle gap after every 3rd seat in a row */}
                      {index % 6 === 2 && (
                        <div className="aspect-square flex items-center justify-center font-mono text-xs text-[#849396]/60 select-none border border-[#3b494c]/20 bg-[#051424]">
                          {String(Math.floor(index / 6) + 1).padStart(2, '0')}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 flex justify-center gap-6 border-t border-[#3b494c] pt-4 text-xs font-semibold uppercase">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-[#3b494c] bg-[#122131]"></div>
                  <span className="text-[#bac9cc]">AVAILABLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-[#ffb4ab]/30 bg-[#ffb4ab]/5"></div>
                  <span className="text-[#bac9cc]">UNAVAILABLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#00e5ff] bg-[#00e5ff]/20"></div>
                  <span className="text-[#bac9cc]">SELECTED</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Telemetry Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#122131] border border-[#3b494c] p-6 flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between border-b border-[#3b494c] pb-2 mb-4">
              <h2 className="text-base font-bold text-[#00e5ff] tracking-widest uppercase">
                TARGET_TELEMETRY
              </h2>
              <span className="material-symbols-outlined text-[#00e5ff] animate-pulse">
                radar
              </span>
            </div>

            {/* Success Notification Banner */}
            {successMessage && (
              <div className="mb-4 p-3 bg-[#00e5ff]/10 border border-[#00e5ff] text-[#00e5ff] text-xs font-mono uppercase tracking-wider">
                {successMessage}
              </div>
            )}

            {/* Error Notification Banner */}
            {lockMutation.isError && (
              <div className="mb-4 p-3 bg-[#93000a]/30 border border-[#ffb4ab] text-[#ffb4ab] text-xs font-mono uppercase tracking-wider">
                [SYS] LOCK_FAILED: {(lockMutation.error as Error)?.message || 'MUTATION_ERROR'}
              </div>
            )}

            {/* Telemetry Content */}
            <div className="flex-1 space-y-4">
              <div className="p-3 border border-[#3b494c] bg-[#0d1c2d]">
                <div className="text-xs text-[#bac9cc] uppercase mb-1">
                  COORDINATE_ID
                </div>
                <div className="text-lg font-bold text-[#d4e4fa] tracking-tight font-mono">
                  {selectedSeat ? `${selectedSeat.seatNumber} // SEC_01` : '-- // --'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-[#3b494c] bg-[#0d1c2d]">
                  <div className="text-xs text-[#bac9cc] uppercase mb-1">
                    STATUS
                  </div>
                  <div className="text-xs font-semibold text-[#00e5ff] uppercase font-mono">
                    {selectedSeat ? selectedSeat.status : 'STANDBY'}
                  </div>
                </div>
                <div className="p-3 border border-[#3b494c] bg-[#0d1c2d]">
                  <div className="text-xs text-[#bac9cc] uppercase mb-1">
                    BASE_PRICE
                  </div>
                  <div className="text-xs font-semibold text-[#d4e4fa] uppercase font-mono">
                    {selectedSeat?.price ? `$${selectedSeat.price}` : '[ PENDING_BACKEND_SYNC ]'}
                  </div>
                </div>
              </div>

              <div className="border border-[#3b494c] border-dashed p-4 relative overflow-hidden flex items-center justify-center group min-h-[120px]">
                <div className="absolute inset-0 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-center">
                  <span className="material-symbols-outlined text-[#849396] mb-2 block">
                    analytics
                  </span>
                  <p className="text-xs text-[#bac9cc] uppercase px-2 leading-relaxed">
                    {selectedSeat
                      ? `Coordinate [${selectedSeat.seatNumber}] locked in terminal buffer.`
                      : 'Awaiting Coordinate Lock Selection for Enhanced Diagnostics'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button
                disabled={!selectedSeat || lockMutation.isPending}
                onClick={handleLockSequence}
                className={`w-full h-12 font-bold tracking-widest uppercase transition-none flex items-center justify-center font-mono text-xs rounded-none ${
                  !selectedSeat || lockMutation.isPending
                    ? 'bg-[#3b494c] text-[#051424] cursor-not-allowed'
                    : 'bg-[#00e5ff] text-[#001f24] hover:bg-[#9cf0ff] cursor-pointer active:scale-[0.99]'
                }`}
              >
                {lockMutation.isPending
                  ? '[ TRANSMITTING_LOCK_CODE... ]'
                  : 'CONFIRM BOOKING'}
              </button>
              <p className="text-[10px] text-[#bac9cc] mt-2 text-center tracking-widest uppercase">
                Authorization Required Level_02
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
