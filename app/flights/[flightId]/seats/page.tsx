'use client';

import React, { useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSeats, useLockSeat, Seat } from '@/src/hooks/useSeats';
import { useJoinWaitlist } from '@/src/hooks/useWaitlist';
import { SeatMapGrid } from '@/src/components/seats/SeatMapGrid';
import { BookingPriceSummary } from '@/src/components/seats/BookingPriceSummary';

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
  const joinWaitlistMutation = useJoinWaitlist();

  const isFullyBooked = !isLoading && !isError && (
    seats.length === 0 || seats.every((s) => s.status !== 'AVAILABLE')
  );

  const handleJoinWaitlist = () => {
    const parsedFlightId = parseInt(flightId.replace(/\D/g, ''), 10) || 1;
    try {
      joinWaitlistMutation.mutate({ flightId: parsedFlightId });
    } catch {}
    router.push('/waitlist');
  };

  const handleSelectSeat = (seat: Seat) => {
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
        onSuccess: (data) => {
          const bookingId = data?.bookingId ?? data?.id;
          setSuccessMessage(`[SYS] LOCK_SEQUENCE_SUCCESS: SEAT ${selectedSeat.seatNumber} CONFIRMED`);
          setSelectedSeat(null);
          const bookingQuery = bookingId ? `&bookingId=${bookingId}` : '';
          router.push(`/checkout?flightId=${flightId}&seatId=${targetSeatId}${bookingQuery}`);
        },
        onError: (err: Error) => {
          console.error('Lock sequence error:', err);
          if (
            err.message?.includes('401') ||
            err.message?.includes('Unauthorized') ||
            err.message?.includes('login required')
          ) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('token');
              localStorage.removeItem('accessToken');
            }
            const encodedPath = encodeURIComponent(pathname);
            router.push('/login?returnUrl=' + encodedPath);
          }
        },
      }
    );
  };

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

      {/* Fully Booked Warning Alert Banner */}
      {isFullyBooked && (
        <div className="bg-[#ffb4ab]/10 border-2 border-[#ffb4ab] p-4 text-[#ffb4ab] font-bold text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 uppercase rounded-none animate-pulse">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">block</span>
            <div>
              <span className="block font-extrabold tracking-wider text-sm">[ CABIN_FULL // ALL SEATS OCCUPIED ]</span>
              <span className="text-[10px] text-[#d4e4fa] font-mono tracking-widest font-normal">
                ALL SEATS FOR FLIGHT {flightId} ARE CURRENTLY RESERVED OR LOCKED. JOIN THE WAITLIST FOR PRIORITY PROMOTION.
              </span>
            </div>
          </div>
          <button
            disabled={joinWaitlistMutation.isPending}
            onClick={handleJoinWaitlist}
            className="px-6 py-3 bg-[#00e5ff] text-[#051424] font-bold text-xs hover:bg-[#9cf0ff] uppercase cursor-pointer rounded-none flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>{joinWaitlistMutation.isPending ? '[ JOINING... ]' : '[+] JOIN_WAITLIST'}</span>
          </button>
        </div>
      )}

      {/* Dashboard Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Fuselage Seat Map Grid */}
        <div className={isFullyBooked ? 'lg:col-span-12' : 'lg:col-span-8'}>
          <SeatMapGrid
            seats={seats}
            selectedSeat={selectedSeat}
            onSelectSeat={handleSelectSeat}
            isLoading={isLoading}
            isError={isError}
            errorMessage={(error as Error)?.message}
          />
        </div>

        {/* Right Column: Dynamic Price Summary Telemetry Panel (Hidden when fully booked) */}
        {!isFullyBooked && (
          <div className="lg:col-span-4">
            <BookingPriceSummary
              selectedSeat={selectedSeat}
              onConfirmLock={handleLockSequence}
              isLocking={lockMutation.isPending}
              lockError={lockMutation.isError ? (lockMutation.error as Error)?.message : null}
              successMessage={successMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
