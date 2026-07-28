'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function BookingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const flightId = (params?.flightId || params?.id || 'AI101') as string;
  const seatId = searchParams?.get('seatId') || '1';
  const seatNumber = searchParams?.get('seatNumber') || '1A';

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('accessToken'))
      : null;

    if (!token) {
      // Not logged in: Redirect to login with return path
      const currentUrl = `/flights/${flightId}/booking?seatId=${seatId}&seatNumber=${seatNumber}`;
      router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    } else {
      setIsAuthChecked(true);
    }
  }, [flightId, seatId, seatNumber, router]);

  if (!isAuthChecked) {
    return (
      <div className="w-full min-h-screen bg-[#051424] font-mono text-[#00e5ff] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="animate-pulse tracking-widest text-xs">
            [SYS] VERIFYING_AUTHORIZATION_CLEARANCE...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#051424] font-mono text-[#d4e4fa] p-6 md:p-12 max-w-4xl mx-auto space-y-6">
      <Link
        href={`/flights/${flightId}/seats`}
        className="inline-flex items-center gap-2 text-[#bac9cc] hover:text-[#00e5ff] text-xs font-bold tracking-widest transition-colors uppercase no-underline"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        [ RETURN_TO_SEAT_MATRIX ]
      </Link>

      <div className="border-b border-[#3b494c] pb-4">
        <span className="text-xs text-[#00e5ff] tracking-widest block">
          RESERVATION_VECTOR_INITIALIZED
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-[#00e5ff] uppercase tracking-wider">
          FLIGHT_BOOKING {'//'} {flightId}
        </h1>
      </div>

      <div className="bg-[#122131] border border-[#3b494c] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#3b494c] pb-4">
          <div>
            <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest">
              CONFIRMED_COORDINATES
            </h2>
            <p className="text-xs text-[#bac9cc] mt-1">
              Seat Buffer Lock Transmitted Successfully
            </p>
          </div>
          <div className="bg-[#00e5ff]/10 border border-[#00e5ff] px-3 py-1 text-xs text-[#00e5ff] font-bold">
            BUFFER_LOCKED
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 border border-[#3b494c] bg-[#0d1c2d]">
            <div className="text-[#849396] uppercase mb-1">FLIGHT IDENTIFIER</div>
            <div className="text-base font-bold text-[#d4e4fa]">{flightId}</div>
          </div>

          <div className="p-4 border border-[#3b494c] bg-[#0d1c2d]">
            <div className="text-[#849396] uppercase mb-1">TARGET SEAT</div>
            <div className="text-base font-bold text-[#00e5ff]">{seatNumber}</div>
          </div>

          <div className="p-4 border border-[#3b494c] bg-[#0d1c2d]">
            <div className="text-[#849396] uppercase mb-1">SEAT ID</div>
            <div className="text-base font-bold text-[#d4e4fa]">#{seatId}</div>
          </div>
        </div>

        <div className="border border-[#3b494c] border-dashed p-6 text-center bg-[#0d1c2d]">
          <span className="material-symbols-outlined text-[#00e5ff] text-3xl mb-2 block animate-pulse">
            receipt_long
          </span>
          <p className="text-xs text-[#bac9cc] uppercase tracking-wider">
            [ BOOKING_PAYMENT_GATEWAY_MODULE_PENDING_NEXT_PHASE ]
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#051424] text-[#00e5ff] flex items-center justify-center font-mono text-xs">
        [SYS] INITIALIZING_BOOKING_VECTOR...
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
