'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  useLeaveWaitlist,
  useUserBookings,
  useConfirmSeat,
  useDeclineSeat,
  useActiveWaitlist,
  Booking,
  WaitlistEntry,
} from '../../hooks/useWaitlist';

/**
 * PROMOTED SEAT OFFER BANNER
 * Conditionally rendered ONLY if useUserBookings returns a LOCKED booking.
 * Timer Logic: Calculates remaining time from booking.createdAt + 5 minutes.
 * When timer reaches 00:00, automatically triggers useDeclineSeat mutation.
 * Buttons:
 *   [ PAY_AND_CONFIRM ] -> useConfirmSeat
 *   [ DECLINE_OFFER ]   -> useDeclineSeat
 */
function PromotedOfferBanner({ booking, activeWaitlists }: { booking: Booking; activeWaitlists: WaitlistEntry[] }) {
  const confirmSeatMutation = useConfirmSeat();
  const declineSeatMutation = useDeclineSeat();
  const leaveWaitlistMutation = useLeaveWaitlist();
  const hasAutoDeclinedRef = useRef(false);

  const bookingId = booking.id || booking.bookingId || 0;
  const targetWaitlist = activeWaitlists.find((w) => w.flightId === booking.flightId) || activeWaitlists[0];
  const waitlistId = targetWaitlist?.id;

  const calculateTimeRemaining = () => {
    const createdAtTime = new Date(booking.createdAt).getTime();
    const expiryTime = createdAtTime + 5 * 60 * 1000; // 5 minutes TTL
    const now = Date.now();
    const diffInSeconds = Math.floor((expiryTime - now) / 1000);
    return Math.max(0, diffInSeconds);
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateTimeRemaining);

  const handleConfirm = async () => {
    try {
      await confirmSeatMutation.mutateAsync({ bookingId });
      if (waitlistId) {
        await leaveWaitlistMutation.mutateAsync(waitlistId);
      }
    } catch (err: unknown) {
      console.error('[AEROLOCK_UI] CONFIRM_SEAT_ERROR:', err);
    }
  };

  const handleDecline = async () => {
    try {
      await declineSeatMutation.mutateAsync({ bookingId });
      if (waitlistId) {
        await leaveWaitlistMutation.mutateAsync(waitlistId);
      }
    } catch (err: unknown) {
      console.error('[AEROLOCK_UI] DECLINE_SEAT_ERROR:', err);
    }
  };

  useEffect(() => {
    setSecondsRemaining(calculateTimeRemaining());
    hasAutoDeclinedRef.current = false;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setSecondsRemaining(remaining);

      if (remaining <= 0 && !hasAutoDeclinedRef.current) {
        hasAutoDeclinedRef.current = true;
        handleDecline();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.createdAt, bookingId]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const padMins = mins < 10 ? `0${mins}` : `${mins}`;
    const padSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${padMins}:${padSecs}`;
  };

  return (
    <section
      id="priority-override-banner"
      className="relative bg-[#122131] border border-[#00e5ff] p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-none shadow-xl selection:bg-[#00e5ff] selection:text-[#051424]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#00e5ff] font-mono font-bold tracking-widest text-xs uppercase">
          <span className="material-symbols-outlined text-base animate-pulse">priority_high</span>
          <span>[ PRIORITY OVERRIDE ] :: SEAT ALLOCATED ON FLIGHT {booking.flightNumber || `AL-${booking.flightId || '001'}`}</span>
        </div>
        <div className="text-[#d4e4fa] font-mono text-xl md:text-2xl font-extrabold tracking-widest uppercase">
          TIME REMAINING TO SECURE:{' '}
          <span id="countdown" className={secondsRemaining <= 60 ? 'text-[#ffb4ab] animate-pulse' : 'text-[#00e5ff]'}>
            {secondsRemaining > 0 ? formatTimer(secondsRemaining) : '00:00 [ EXPIRED ]'}
          </span>
        </div>
      </div>

      <div className="flex gap-4 w-full md:w-auto shrink-0">
        <button
          type="button"
          disabled={confirmSeatMutation.isPending}
          onClick={handleConfirm}
          className="flex-1 md:flex-none px-6 py-3 border border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff] font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#00e5ff] hover:text-[#051424] transition-colors rounded-none disabled:opacity-50 cursor-pointer"
        >
          {confirmSeatMutation.isPending ? '[ PROCESSING... ]' : '[ PAY_AND_CONFIRM ]'}
        </button>
        <button
          type="button"
          disabled={declineSeatMutation.isPending}
          onClick={handleDecline}
          className="flex-1 md:flex-none px-6 py-3 border border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab] font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#ffb4ab] hover:text-[#051424] transition-colors rounded-none disabled:opacity-50 cursor-pointer"
        >
          {declineSeatMutation.isPending ? '[ DECLINING... ]' : '[ DECLINE_OFFER ]'}
        </button>
      </div>
    </section>
  );
}

/**
 * MAIN AEROLOCK WAITLIST CONTROL INTERFACE
 */
export default function WaitlistControlInterface() {
  const { lockedBooking } = useUserBookings();
  const { data: activeWaitlists = [], isLoading } = useActiveWaitlist();
  const leaveWaitlistMutation = useLeaveWaitlist();

  const totalRecordsFormatted = String(activeWaitlists.length).padStart(3, '0');

  return (
    <div className="bg-[#051424] text-[#d4e4fa] font-mono min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-8 rounded-none">
      {/* HEADER SECTION */}
      <header className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-end gap-2">
        <div>
          <div className="text-[10px] text-[#00e5ff] tracking-widest uppercase font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
            CIVILIAN QUEUE PROTOCOL // WAITLIST SYSTEM
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-widest text-[#d4e4fa] uppercase mt-1">
            WAITLIST CONTROL INTERFACE
          </h1>
        </div>
        <div className="text-[#bac9cc] text-xs font-mono tracking-widest">
          SYSTEM_STATUS: <span className="text-[#00e5ff]">ONLINE</span>
        </div>
      </header>

      {/* 1. PROMOTED SEAT OFFER BANNER (Condition: LOCKED booking exists) */}
      {lockedBooking && (
        <PromotedOfferBanner booking={lockedBooking} activeWaitlists={activeWaitlists} />
      )}

      {/* 2. CUSTOMER WAITLIST TABLE */}
      <section className="w-full space-y-4" id="waitlist-vectors">
        <div className="flex items-center justify-between border-b border-[#3b494c] pb-2">
          <h2 className="text-[#bac9cc] font-bold tracking-widest text-xs uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#00e5ff]">format_list_bulleted</span>
            [ ACTIVE WAITLIST VECTORS ]
          </h2>
          <div className="text-[#bac9cc] text-xs opacity-70 tracking-widest">
            TOTAL_RECORDS: {totalRecordsFormatted}
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-[#122131] border border-[#3b494c] p-6 text-[#bac9cc] text-xs tracking-widest text-center uppercase animate-pulse">
              [ SCANNING WAITLIST REGISTRY... ]
            </div>
          ) : activeWaitlists.length === 0 ? (
            <div className="bg-[#122131] border border-[#3b494c] p-8 text-[#bac9cc] text-xs tracking-widest text-center uppercase flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#3b494c]">inbox</span>
              <span>[ NO ACTIVE WAITLIST QUEUES DETECTED ]</span>
            </div>
          ) : (
            activeWaitlists.map((entry) => {
              const entryId = entry.id;
              const flightNum = entry.flightNumber || `FL-${entry.flightId}`;
              const sector = entry.sector || 'SFO → JFK';
              const departure = entry.departure || '08:00 UTC';
              const position = entry.position ?? 1;
              const total = entry.total ?? 1;

              return (
                <div
                  key={String(entryId)}
                  className="bg-[#122131] border border-[#3b494c] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#00e5ff] transition-colors rounded-none shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[#bac9cc] text-[10px] tracking-widest uppercase opacity-60">
                        FLIGHT IDENTIFIER
                      </span>
                      <span className="text-[#d4e4fa] font-bold tracking-wider text-sm">
                        {flightNum}
                      </span>
                    </div>

                    <div className="hidden md:block h-8 w-[1px] bg-[#3b494c]"></div>

                    <div className="flex flex-col">
                      <span className="text-[#bac9cc] text-[10px] tracking-widest uppercase opacity-60">
                        SECTOR
                      </span>
                      <span className="text-[#d4e4fa] font-bold tracking-wider text-xs">
                        {sector}
                      </span>
                    </div>

                    <div className="hidden md:block h-8 w-[1px] bg-[#3b494c]"></div>

                    <div className="flex flex-col">
                      <span className="text-[#bac9cc] text-[10px] tracking-widest uppercase opacity-60">
                        DEPARTURE
                      </span>
                      <span className="text-[#d4e4fa] font-bold tracking-wider text-xs">
                        {departure}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[#bac9cc] text-[10px] tracking-widest uppercase opacity-60">
                        QUEUE POSITION
                      </span>
                      <span className="text-[#00e5ff] font-bold tracking-widest text-xs">
                        [ #{position} / {total} ]
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={leaveWaitlistMutation.isPending}
                      onClick={() => leaveWaitlistMutation.mutate(entryId)}
                      className="text-[#ffb4ab] hover:text-[#051424] hover:bg-[#ffb4ab] border border-[#ffb4ab] px-4 py-2 font-bold tracking-widest text-xs transition-colors rounded-none cursor-pointer disabled:opacity-50 uppercase"
                    >
                      {leaveWaitlistMutation.isPending ? '[ REMOVING... ]' : '[ LEAVE_QUEUE ]'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* FOOTER (TECHNICAL STATUS) */}
      <footer className="mt-auto pt-6 border-t border-[#3b494c] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#bac9cc] opacity-60 uppercase font-mono">
        <div>©2026 AEROLOCK TECHNICAL INFRASTRUCTURE. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-4">
          <span>SYSTEM_STATUS: NOMINAL</span>
          <span>ENCRYPTION_PROTOCOL: AES-256-GCM</span>
        </div>
      </footer>
    </div>
  );
}
