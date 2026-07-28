'use client';

import React, { useState, useEffect } from 'react';
import { useConfirmBooking, useSeat } from '@/src/hooks/useSeats';
import { calculatePriceBreakdown } from '@/src/utils/formatCurrency';
import { getSeatTier } from '../seats/SeatMapGrid';

interface WaitlistPriceModalProps {
  bookingId: number | string;
  seatId: number | string;
  seatNumber?: string;
  price?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WaitlistPriceModal({
  bookingId,
  seatId,
  seatNumber: propSeatNumber,
  price: propPrice,
  isOpen,
  onClose,
  onSuccess,
}: WaitlistPriceModalProps) {
  const { data: seatData, isLoading: isFetchingSeat } = useSeat(seatId);
  const confirmMutation = useConfirmBooking();

  const seatNumber = propSeatNumber || seatData?.seatNumber || `S-${seatId}`;
  const seatPrice = propPrice ?? seatData?.price ?? 4500;

  const breakdown = calculatePriceBreakdown(seatPrice);
  const tier = getSeatTier(seatNumber);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsRemaining(300);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  const handleConfirmPayment = () => {
    confirmMutation.mutate(
      { bookingId },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-[#122131] border-2 border-[#00e5ff] w-full max-w-lg p-6 text-[#d4e4fa] shadow-[0_0_30px_rgba(0,229,255,0.2)] relative space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#3b494c] pb-4">
          <div>
            <span className="text-[10px] text-[#00e5ff] tracking-widest block uppercase font-bold">
              [WAITLIST_PROMOTION_ACTIVE]
            </span>
            <h2 className="text-lg font-extrabold text-[#00e5ff] tracking-wider uppercase">
              SEAT RESERVED // SEAT {seatNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#bac9cc] hover:text-[#00e5ff] border border-[#3b494c] px-3 py-1 text-xs cursor-pointer"
          >
            [ESC]
          </button>
        </div>

        {/* Promotion Banner */}
        <div className="p-3 border border-[#00e5ff]/50 bg-[#00e5ff]/10 text-xs leading-relaxed text-[#d4e4fa] space-y-1">
          <div className="flex items-center gap-2 text-[#00e5ff] font-bold">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>PROMOTION_PRIORITY_GRANTED</span>
          </div>
          <p className="text-[11px] text-[#bac9cc]">
            You have been promoted from the waitlist! Seat <strong className="text-[#00e5ff]">{seatNumber}</strong> ({tier.label}) has been temporarily held for you. Complete payment within the countdown timer to confirm your booking.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="p-4 border border-[#00e5ff] bg-[#051424] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#bac9cc] uppercase">PAYMENT_HOLD_TIMER</div>
            <div className="text-xs text-[#00e5ff]">RESERVATION_LOCKED</div>
          </div>
          <div className="text-2xl font-extrabold text-[#00e5ff] tracking-widest">
            {formatTimer(secondsRemaining)}
          </div>
        </div>

        {/* Itemized Pricing Breakdown */}
        <div className="bg-[#051424] border border-[#3b494c] p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#3b494c]/40">
            <span className="text-[#bac9cc] uppercase">RESERVED SEAT FARE:</span>
            <span className="font-bold text-[#d4e4fa]">
              {isFetchingSeat ? '[ FETCHING... ]' : breakdown.formattedBase}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#3b494c]/40">
            <span className="text-[#bac9cc] uppercase">AVIATION TAXES & FEES (18%):</span>
            <span className="font-bold text-[#d4e4fa]">{breakdown.formattedTax}</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-sm">
            <span className="text-[#00e5ff] font-bold uppercase">TOTAL PAYABLE:</span>
            <span className="font-extrabold text-[#00e5ff] text-base">
              {breakdown.formattedTotal}
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {confirmMutation.isError && (
          <div className="p-3 bg-[#93000a]/30 border border-[#ffb4ab] text-[#ffb4ab] text-xs uppercase">
            [SYS] PAYMENT_CONFIRM_FAILED: {(confirmMutation.error as Error)?.message || 'ERROR'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#3b494c] text-[#bac9cc] hover:text-[#d4e4fa] hover:border-[#bac9cc] font-bold text-xs uppercase cursor-pointer"
          >
            DISMISS
          </button>
          <button
            disabled={confirmMutation.isPending || secondsRemaining === 0}
            onClick={handleConfirmPayment}
            className={`flex-1 py-3 bg-[#00e5ff] text-[#001f24] hover:bg-[#9cf0ff] font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all ${
              confirmMutation.isPending || secondsRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {confirmMutation.isPending ? '[ PROCESSING... ]' : 'PAY & CONFIRM BOOKING'}
          </button>
        </div>
      </div>
    </div>
  );
}
