'use client';

import React, { useState, useEffect } from 'react';
import { Seat } from '@/src/hooks/useSeats';
import { calculatePriceBreakdown } from '@/src/utils/formatCurrency';
import { getSeatTier } from './SeatMapGrid';

interface BookingPriceSummaryProps {
  selectedSeat: Seat | null;
  onConfirmLock: () => void;
  isLocking?: boolean;
  lockError?: string | null;
  successMessage?: string | null;
}

export function BookingPriceSummary({
  selectedSeat,
  onConfirmLock,
  isLocking,
  lockError,
  successMessage,
}: BookingPriceSummaryProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5-minute lock window

  useEffect(() => {
    if (!selectedSeat) {
      setSecondsRemaining(300);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeat]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  const breakdown = calculatePriceBreakdown(selectedSeat?.price);
  const tier = selectedSeat ? getSeatTier(selectedSeat.seatNumber) : null;

  return (
    <div className="bg-[#122131] border border-[#3b494c] p-5 flex flex-col justify-between font-mono min-h-[440px] rounded-none">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#3b494c] pb-3 mb-4">
          <h2 className="text-sm font-bold text-[#00e5ff] tracking-widest uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-base">receipt_long</span>
            PRICE_SUMMARY_TELEMETRY
          </h2>
          <span className="text-[10px] text-[#bac9cc] border border-[#3b494c] px-2 py-0.5 uppercase">
            RESERVATION_V1
          </span>
        </div>

        {/* Banners */}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#00e5ff]/10 border border-[#00e5ff] text-[#00e5ff] text-xs uppercase tracking-wider">
            {successMessage}
          </div>
        )}

        {lockError && (
          <div className="mb-4 p-3 bg-[#93000a]/30 border border-[#ffb4ab] text-[#ffb4ab] text-xs uppercase tracking-wider">
            [SYS] LOCK_FAILED: {lockError}
          </div>
        )}

        {/* Selected Seat Overview */}
        <div className="p-3 border border-[#3b494c] bg-[#0d1c2d] mb-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#bac9cc] uppercase">TARGET_SEAT</span>
            {tier && (
              <span className={`text-[10px] font-bold px-1 border ${tier.badgeClass}`}>
                {tier.label} SEAT
              </span>
            )}
          </div>
          <div className="text-xl font-bold text-[#d4e4fa] tracking-wider">
            {selectedSeat ? `SEAT ${selectedSeat.seatNumber}` : '[ NO_SEAT_SELECTED ]'}
          </div>
        </div>

        {/* Itemized Price Breakdown */}
        <div className="bg-[#051424] border border-[#3b494c] p-4 space-y-2.5 text-xs mb-4">
          <div className="flex justify-between items-center py-1 border-b border-[#3b494c]/40">
            <span className="text-[#bac9cc] uppercase">SEAT BASE FARE:</span>
            <span className="font-bold text-[#d4e4fa]">{selectedSeat ? breakdown.formattedBase : '--'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#3b494c]/40">
            <span className="text-[#bac9cc] uppercase">AVIATION TAXES & FEES (18%):</span>
            <span className="font-bold text-[#d4e4fa]">{selectedSeat ? breakdown.formattedTax : '--'}</span>
          </div>

          <div className="flex justify-between items-center pt-2 text-sm">
            <span className="text-[#00e5ff] font-bold uppercase">TOTAL PAYABLE:</span>
            <span className="font-extrabold text-[#00e5ff] text-base">
              {selectedSeat ? breakdown.formattedTotal : '[ PENDING ]'}
            </span>
          </div>
        </div>

        {/* Lock Hold Timer Notice */}
        {selectedSeat && (
          <div className="p-3 border border-[#00e5ff]/40 bg-[#00e5ff]/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#bac9cc]">
              <span className="material-symbols-outlined text-[#00e5ff] text-base">timer</span>
              <span>LOCK WINDOW EXPIRES IN:</span>
            </div>
            <span className="font-bold text-[#00e5ff] text-sm tracking-wider font-mono">
              {formatTimer(secondsRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Lock Action Button */}
      <div className="mt-6">
        <button
          disabled={!selectedSeat || isLocking || secondsRemaining === 0}
          onClick={onConfirmLock}
          className={`w-full h-12 font-extrabold tracking-widest uppercase transition-all flex items-center justify-center text-xs rounded-none font-mono ${
            !selectedSeat || isLocking || secondsRemaining === 0
              ? 'bg-[#3b494c] text-[#051424] cursor-not-allowed'
              : 'bg-[#00e5ff] text-[#001f24] hover:bg-[#9cf0ff] cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)] active:scale-[0.99]'
          }`}
        >
          {isLocking ? (
            '[ TRANSMITTING_LOCK_PAYLOAD... ]'
          ) : secondsRemaining === 0 ? (
            '[ LOCK_WINDOW_EXPIRED ]'
          ) : (
            'PROCEED TO LOCK & PAY'
          )}
        </button>
        <p className="text-[10px] text-[#bac9cc] mt-2 text-center tracking-widest uppercase">
          SECURE_PAYMENT_RSA_4096 ENCRYPTED
        </p>
      </div>
    </div>
  );
}
