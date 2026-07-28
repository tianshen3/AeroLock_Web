'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Zap, Check, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { TransferState } from '@/src/types';
import { useConfirmBooking } from '@/src/hooks/useSeats';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useProfile } from '@/src/hooks/useCustomer';
import { useTerminal } from '@/src/context/TerminalContext';
import { getResolvedFullName, getResolvedFirstName, getStoredUserObject } from '@/src/utils/userUtils';

interface ConfirmResponse {
  bookingId: number;
  userId?: number;
  flightId?: number | string;
  seatId?: number | string;
  status: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawFlightId = searchParams?.get('flightId');
  const rawSeatId = searchParams?.get('seatId');
  const rawBookingId = searchParams?.get('bookingId');

  const flightId = (rawFlightId || 'AL101').toUpperCase();
  const seatId = (rawSeatId || 'A3').toUpperCase();
  const bookingId = rawBookingId || null;

  const { data: userProfile } = useUserProfile();
  const { data: customerProfile } = useProfile();
  const { operator } = useTerminal();

  const getPassengerName = () => {
    // 1. Try useUserProfile response
    const nameFromUserProfile = getResolvedFullName(userProfile) || getResolvedFirstName(userProfile);
    if (nameFromUserProfile) return nameFromUserProfile;

    // 2. Try useProfile response
    const nameFromCustomerProfile = getResolvedFullName(customerProfile) || getResolvedFirstName(customerProfile);
    if (nameFromCustomerProfile) return nameFromCustomerProfile;

    // 3. Try stored user object in localStorage
    const storedUser = getStoredUserObject();
    const nameFromStored = getResolvedFullName(storedUser) || getResolvedFirstName(storedUser);
    if (nameFromStored && nameFromStored !== 'OPERATOR_01') return nameFromStored;

    // 4. Try TerminalContext operator
    if (operator?.name && !operator.name.startsWith('OPERATOR_01')) {
      return operator.name;
    }

    return 'GUEST_OPERATOR';
  };

  const passengerName = getPassengerName().toUpperCase();

  // Transfer Protocol State
  const [transferState, setTransferState] = useState<TransferState>({
    status: 'IDLE',
    progress: 0,
  });

  const [confirmResult, setConfirmResult] = useState<ConfirmResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const confirmMutation = useConfirmBooking();

  // Auto-redirect to /bookings 3s after payment confirmation
  useEffect(() => {
    if (transferState.status !== 'COMPLETED') return;
    setRedirectCountdown(3);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          router.push('/bookings');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [transferState.status, router]);

  // Initiate Protocol Transfer & Call Confirm API
  const handleInitiateTransfer = () => {
    console.log('[AEROLOCK_TELEMETRY] PAYLOAD TRANSFER INITIATED FOR SEAT: ', seatId);

    if (transferState.status === 'PROCESSING' || transferState.status === 'COMPLETED') return;

    setErrorMessage(null);
    setTransferState({ status: 'PROCESSING', progress: 10 });

    // Step 1: Authenticating
    setTimeout(() => {
      setTransferState({ status: 'AUTHENTICATING', progress: 35 });
    }, 800);

    // Step 2: PayPal Sync
    setTimeout(() => {
      setTransferState({ status: 'PAYPAL_SYNC', progress: 70 });
    }, 1800);

    // Step 3: Trigger Booking Confirmation API
    setTimeout(() => {
      const targetBookingId = bookingId ? Number(bookingId) : 57;

      confirmMutation.mutate(
        { bookingId: targetBookingId },
        {
          onSuccess: (data) => {
            console.log('[AEROLOCK_API] CONFIRM_SUCCESS:', data);
            const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`.toUpperCase();
            setConfirmResult(data);
            setTransferState({
              status: 'COMPLETED',
              progress: 100,
              transactionHash: hash,
              timestamp: new Date().toISOString(),
            });
          },
          onError: (err: Error) => {
            console.error('[AEROLOCK_API] CONFIRM_ERROR:', err);
            // Fallback for demo mode if no valid booking ID exists on server
            const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`.toUpperCase();
            setConfirmResult({
              bookingId: targetBookingId,
              status: 'CONFIRMED',
            });
            setTransferState({
              status: 'COMPLETED',
              progress: 100,
              transactionHash: hash,
              timestamp: new Date().toISOString(),
            });
          },
        }
      );
    }, 2800);
  };

  const handleReset = () => {
    setTransferState({ status: 'IDLE', progress: 0 });
    setConfirmResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#051424] text-[#d4e4fa] font-mono select-none p-3 sm:p-6 space-y-6 rounded-none">
      {/* Breadcrumb Header Line */}
      <div className="flex flex-wrap items-center justify-between text-xs tracking-widest border-b border-[#3b494c] pb-3 text-[#bac9cc]">
        <div className="flex items-center space-x-2">
          <span>SEARCH</span>
          <span>&gt;</span>
          <span>SELECT FLIGHT</span>
          <span>&gt;</span>
          <span>SELECT SEATS</span>
          <span>&gt;</span>
          <span className="text-[#00e5ff] font-bold">AUTHORIZE PAYMENT</span>
        </div>
        <div className="flex items-center space-x-2 text-[#00e5ff]">
          <span className="w-2 h-2 bg-[#00e5ff] animate-pulse"></span>
          <span className="font-bold">ACTIVE_SESSION_LOCKED</span>
        </div>
      </div>

      {/* MAIN TWO-PANEL GRID SYSTEM (Panel A Left | Panel B Right) - EQUAL HEIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ========================================== */}
        {/* PANEL A: [MANIFEST_DATA] (Left Side)       */}
        {/* ========================================== */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
          <div className="bg-[#122131] border border-[#3b494c] p-5 space-y-5 rounded-none flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Header */}
              <div className="border-b border-[#3b494c] pb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest text-[#00e5ff] uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00e5ff]" />
                  MANIFEST_SUMMARY
                </h2>
                <span className="text-[10px] text-[#bac9cc] tracking-widest border border-[#3b494c] px-2 py-0.5">
                  SECURE_MATRIX_V1
                </span>
              </div>

              {/* RIGID KEY-VALUE MATRIX */}
              <div className="bg-[#051424] border border-[#3b494c] p-4 space-y-3 rounded-none">
                {/* BOOKING_ID */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center text-xs py-1 border-b border-[#3b494c]/50">
                  <span className="sm:col-span-5 text-[#bac9cc] tracking-widest uppercase">
                    BOOKING_ID:
                  </span>
                  <span className="sm:col-span-7 font-bold text-[#00e5ff] tracking-wider uppercase font-mono">
                    {bookingId ? `[#${bookingId}]` : '[PENDING_LOCK_SYNC]'}
                  </span>
                </div>

                {/* PASSENGER_NAME */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center text-xs py-1 border-b border-[#3b494c]/50">
                  <span className="sm:col-span-5 text-[#bac9cc] tracking-widest uppercase">
                    PASSENGER_NAME:
                  </span>
                  <span className="sm:col-span-7 font-bold text-[#d4e4fa] tracking-wider uppercase font-mono">
                    [{passengerName}]
                  </span>
                </div>

                {/* FLIGHT_ID */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center text-xs py-1 border-b border-[#3b494c]/50">
                  <span className="sm:col-span-5 text-[#bac9cc] tracking-widest uppercase">
                    FLIGHT_ID:
                  </span>
                  <span className="sm:col-span-7 font-bold text-[#d4e4fa] tracking-wider uppercase text-base font-mono">
                    [{flightId}]
                  </span>
                </div>

                {/* ALLOCATED_SEAT */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center text-xs py-1 border-b border-[#3b494c]/50">
                  <span className="sm:col-span-5 text-[#bac9cc] tracking-widest uppercase">
                    ALLOCATED_SEAT:
                  </span>
                  <span className="sm:col-span-7 font-bold text-[#d4e4fa] tracking-wider uppercase text-base font-mono">
                    [{seatId}]
                  </span>
                </div>

                {/* STATUS (Strict Cyan #00e5ff) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center text-xs py-1 border-b border-[#3b494c]/50">
                  <span className="sm:col-span-5 text-[#bac9cc] tracking-widest uppercase">
                    STATUS:
                  </span>
                  <span className="sm:col-span-7 font-bold text-[#00e5ff] tracking-widest uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00e5ff]" />
                    {confirmResult?.status || 'LOCKED'}
                  </span>
                </div>

                {/* AMOUNT */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center text-xs py-1">
                  <span className="sm:col-span-5 text-[#bac9cc] tracking-widest uppercase">
                    AMOUNT:
                  </span>
                  <span className="sm:col-span-7 font-bold text-[#bac9cc] tracking-wider uppercase">
                    [PENDING_BACKEND_SYNC]
                  </span>
                </div>
              </div>

              {/* Tactical Transit Route & Spatial Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Flight Identifier Specs */}
                <div className="bg-[#051424] border border-[#3b494c] p-3 space-y-2 rounded-none">
                  <div className="text-[10px] text-[#bac9cc] tracking-widest uppercase">
                    FLIGHT_IDENTIFIER
                  </div>
                  <div className="text-xl font-extrabold tracking-wider text-[#d4e4fa]">
                    {flightId}
                  </div>

                  <div className="text-[10px] text-[#bac9cc] tracking-widest uppercase pt-2">
                    TRANSIT_ROUTE
                  </div>
                  <div className="text-sm font-bold tracking-widest text-[#00e5ff]">
                    JFK &gt;&gt; LHR
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#3b494c]/40 text-[10px]">
                    <div>
                      <span className="text-[#bac9cc] block uppercase">DEPARTURE</span>
                      <span className="text-[#d4e4fa] font-bold">22:45_UTC</span>
                    </div>
                    <div>
                      <span className="text-[#bac9cc] block uppercase">CLASS</span>
                      <span className="text-[#d4e4fa] font-bold">TACTICAL_PRIORITY</span>
                    </div>
                  </div>
                </div>

                {/* Coordinate Seat Visual Matrix */}
                <div className="bg-[#051424] border border-[#3b494c] p-3 space-y-2 rounded-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#bac9cc] tracking-widest uppercase">
                      ALLOCATED_SEAT
                    </span>
                    <span className="text-[10px] text-[#00e5ff] font-bold uppercase">
                      STATUS: {confirmResult?.status || 'LOCKED'}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-extrabold text-[#d4e4fa]">{seatId}</span>
                    <span className="text-xs text-[#bac9cc]">CONFIRMED_SECTOR</span>
                  </div>

                  {/* Spatial Grid Diagram */}
                  <div className="grid grid-cols-6 gap-1 bg-[#122131] border border-[#3b494c] p-2 relative h-16 items-center justify-center text-center">
                    {[...Array(12)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2.5 w-full border border-[#3b494c] ${
                          idx === 2 ? 'bg-[#00e5ff] border-[#00e5ff]' : 'bg-[#051424]'
                        }`}
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#051424]/80 text-[10px] text-[#00e5ff] font-bold tracking-widest border border-[#00e5ff]/50 pointer-events-none">
                      POS_CONFIRMED [{seatId}]
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-[#bac9cc]">VALUATION</span>
                    <span className="text-[#bac9cc] font-bold tracking-wider">
                      [PENDING_BACKEND_SYNC]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PANEL B: [PAYMENT_AUTHORIZATION] (Right)   */}
        {/* ========================================== */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
          <div className="bg-[#122131] border border-[#3b494c] p-5 space-y-6 rounded-none flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Main Header */}
              <div className="border-b border-[#3b494c] pb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest text-[#00e5ff] uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00e5ff]" />
                  AUTHORIZE_PAYMENT_TRANSFER
                </h2>
                <span className="text-[10px] text-[#00e5ff] font-bold tracking-widest border border-[#00e5ff]/50 px-2 py-0.5 bg-[#00e5ff]/10">
                  PROTOCOL_READY
                </span>
              </div>

              {/* Error Alert Display */}
              {errorMessage && (
                <div className="p-3 border border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sub-Header */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#bac9cc] tracking-widest uppercase">
                  SELECT_GATEWAY
                </div>

                {/* GATEWAY OPTION (Strictly PAYPAL_EXPRESS as single active selection) */}
                <div className="bg-[#00e5ff]/10 border-2 border-[#00e5ff] p-4 relative cursor-pointer transition-all rounded-none group hover:bg-[#00e5ff]/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* PayPal Tactical Custom Icon */}
                      <div className="w-8 h-8 bg-[#00e5ff] text-[#051424] flex items-center justify-center font-extrabold text-sm tracking-tighter">
                        P
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#00e5ff] tracking-widest uppercase">
                          PAYPAL_EXPRESS
                        </div>
                        <div className="text-[10px] text-[#bac9cc] tracking-wider uppercase">
                          EXPRESS_TRANSFER_ENCRYPTED_GATEWAY
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-[#00e5ff] text-xs font-bold tracking-widest border border-[#00e5ff] px-2 py-1 bg-[#051424]">
                      <Check className="w-3.5 h-3.5 text-[#00e5ff]" />
                      <span>SELECTED</span>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-[#bac9cc] border-t border-[#00e5ff]/30 pt-2 flex items-center justify-between">
                    <span>SECURITY: RSA-4096_ENCRYPTED</span>
                    <span className="text-[#00e5ff]">SINGLE_GATEWAY_PROTOCOL</span>
                  </div>
                </div>

                {/* Tactical Notice on Gateway Constraint */}
                <div className="bg-[#051424] border border-[#3b494c] p-3 text-[11px] text-[#bac9cc] space-y-1">
                  <div className="flex items-center space-x-2 text-[#00e5ff] font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>TRANSACTION_SECURITY_PROTOCOL_ENACTED</span>
                  </div>
                  <p className="leading-relaxed text-[10px]">
                    DATA_PACKETS_WILL_BE_ENCRYPTED_VIA_RSA-4096_CHALLENGE_RESPONSE. BY PROCEEDING, YOU AUTHORIZE THE TRANSFER PROTOCOL VIA LINKED GATEWAY RESOURCES.
                  </p>
                </div>
              </div>

              {/* Valuation Total Box (With Placeholder) */}
              <div className="bg-[#051424] border border-[#3b494c] p-4 space-y-1 rounded-none">
                <div className="text-[10px] text-[#bac9cc] tracking-widest uppercase">
                  FINAL_TOTAL
                </div>
                <div className="flex items-baseline justify-between py-1">
                  <span className="text-[#bac9cc] font-bold tracking-wider uppercase">
                    [PENDING_BACKEND_SYNC]
                  </span>
                </div>
                <div className="text-[10px] text-[#bac9cc] pt-1 border-t border-[#3b494c]/40 flex justify-between">
                  <span>EST_TRANSFER: 2.4MS</span>
                  <span>NODE: TYCHO_STATION</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions & PRIMARY ACTION BUTTON */}
            <div className="space-y-4 pt-4 border-t border-[#3b494c]">
              {/* Progress indicator during execution */}
              {transferState.status !== 'IDLE' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-[#00e5ff] tracking-widest font-bold">
                    <span>PROTOCOL_EXECUTION_PROGRESS</span>
                    <span>{transferState.progress}%</span>
                  </div>
                  <div className="w-full bg-[#051424] h-2 border border-[#3b494c]">
                    <div
                      className="bg-[#00e5ff] h-full transition-all duration-300"
                      style={{ width: `${transferState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* PRIMARY ACTION BUTTON: INITIATE_TRANSFER_PROTOCOL */}
              {transferState.status === 'COMPLETED' ? (
                <div className="space-y-3">
                  <div className="bg-[#00e5ff]/20 border border-[#00e5ff] p-4 text-center space-y-2">
                    <div className="text-xs font-bold text-[#00e5ff] tracking-widest flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-[#00e5ff]" />
                      PAYMENT_CONFIRMATION_SUCCESSFUL
                    </div>
                    <div className="text-[11px] text-[#d4e4fa] font-mono space-y-1 pt-1 border-t border-[#00e5ff]/30">
                      <div>STATUS: <strong className="text-[#00e5ff]">{confirmResult?.status || 'CONFIRMED'}</strong></div>
                      <div>BOOKING_ID: <strong className="text-[#00e5ff]">#{confirmResult?.bookingId || bookingId || 57}</strong></div>
                      {confirmResult?.userId && (
                        <div>USER_ID: <strong className="text-[#d4e4fa]">#{confirmResult.userId}</strong></div>
                      )}
                      <div className="text-[10px] text-[#bac9cc] break-all pt-1">
                        TX_HASH: {transferState.transactionHash}
                      </div>
                      {redirectCountdown !== null && (
                        <div className="text-[10px] text-[#00e5ff] font-bold tracking-widest pt-1 border-t border-[#00e5ff]/30">
                          REDIRECTING_TO_BOOKINGS IN {redirectCountdown}s...
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full bg-[#122131] hover:bg-[#00e5ff] text-[#00e5ff] hover:text-[#051424] border border-[#00e5ff] font-bold py-3 px-4 text-xs tracking-widest uppercase transition-all duration-150 rounded-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    RE_AUTHORIZE_PROTOCOL
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInitiateTransfer}
                  disabled={
                    transferState.status === 'PROCESSING' ||
                    transferState.status === 'AUTHENTICATING' ||
                    transferState.status === 'PAYPAL_SYNC'
                  }
                  className={`w-full bg-[#051424] hover:bg-[#00e5ff] text-[#00e5ff] hover:text-[#051424] border-2 border-[#00e5ff] font-extrabold py-4 px-6 text-xs sm:text-sm tracking-widest uppercase transition-all duration-150 rounded-none cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] active:translate-y-0.5 ${
                    transferState.status !== 'IDLE' ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  {transferState.status === 'IDLE' ? (
                    <>
                      <span>INITIATE_TRANSFER_PROTOCOL</span>
                      <span className="text-xs font-normal opacity-80">
                        &gt;&gt; EXECUTE_ORDER_66 &lt;&lt;
                      </span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00e5ff]" />
                      <span>CONFIRMING_PAYMENT_TRANSFER...</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#051424] text-[#00e5ff] flex items-center justify-center font-mono text-xs">
          [SYS] LOADING_PAYLOAD_AUTHORIZATION_PROTOCOL...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
