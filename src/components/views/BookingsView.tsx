'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useBookings, type Booking, type BookingStatus } from '../../hooks/useBookings';
import { useCancelBooking } from '../../hooks/useSeats';
import { useFlights } from '../../hooks/useFlights';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getResolvedFullName } from '../../utils/userUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (b: Booking): BookingStatus => {
  const raw = (b.status ?? '').toString().toUpperCase().trim();
  if (raw === 'CONFIRMED') return 'CONFIRMED';
  if (raw === 'CANCELLED') return 'CANCELLED';
  if (raw === 'EXPIRED') return 'EXPIRED';
  return 'LOCKED'; // default / PENDING maps to LOCKED
};

const resolveNested = (
  flat: string | number | undefined | null,
  nested: string | number | undefined | null,
): string => {
  const pick = flat ?? nested;
  if (pick !== undefined && pick !== null && String(pick).trim()) {
    return String(pick).trim().toUpperCase();
  }
  return '—';
};

const resolveField = (...candidates: (string | number | undefined | null)[]): string => {
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim()) return String(c).trim().toUpperCase();
  }
  return '—';
};

// ─── Booking Row ──────────────────────────────────────────────────────────────

interface BookingRowProps {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: Set<string>;
  optimisticCancelled: Set<string>;
  flights: any[];
  passengerName: string;
}

const BookingRow: React.FC<BookingRowProps> = ({
  booking,
  onCancel,
  cancelling,
  optimisticCancelled,
  flights,
  passengerName,
}) => {
  // Optimistic override: if we've locally cancelled this booking, treat it as CANCELLED
  const status: BookingStatus = optimisticCancelled.has(String(booking.bookingId))
    ? 'CANCELLED'
    : getStatus(booking);
  const isConfirmed = status === 'CONFIRMED';
  const isCancelled = status === 'CANCELLED';
  const isExpired = status === 'EXPIRED';
  const isRevoking = cancelling.has(String(booking.bookingId));

  const statusBadgeClass =
    isCancelled
      ? 'border-[#ffb4ab] text-[#ffb4ab] bg-[#ffb4ab]/10'
      : isExpired
      ? 'border-amber-500 text-amber-400 bg-amber-500/10'
      : status === 'LOCKED'
      ? 'border-[#849396] text-[#849396] bg-[#849396]/10'
      : 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10';

  // Find the matching flight in flights using booking.flightId
  const flight = flights?.find((f) => Number(f.id) === Number(booking.flightId));

  // Resolve route from nested flight relation, flat fields, or matching flight info
  const origin = resolveNested(booking.origin, flight?.origin);
  const destination = resolveNested(booking.destination, flight?.destination);
  const flightCode = resolveField(
    booking.flightCode,
    booking.flightNumber,
    flight?.flightNumber,
    booking.flightId,
  );
  const seatLabel = resolveField(
    booking.seatNumber,
    booking.seat?.seatNumber,
    booking.seatId ? `SEAT ${booking.seatId}` : null,
  );
  const priceLabel = resolveField(
    booking.price,
    booking.fare,
    booking.seat?.price ? `₹${booking.seat.price}` : null,
    '—',
  );

  return (
    <tr
      className={`border-b border-[#3b494c] transition-colors hover:bg-[#00e5ff]/5 ${
        isCancelled ? 'opacity-55' : ''
      }`}
    >
      {/* Passenger / PNR */}
      <td className="p-3">
        <div className="font-bold text-[#00e5ff] text-xs tracking-widest">
          {resolveField(booking.passengerName, passengerName)}
        </div>
        <div className="text-[10px] text-[#849396] mt-0.5 font-mono tracking-wider">
          {resolveField(booking.pnr, booking.bookingId ? `PNR-${booking.bookingId}` : null, String(booking.bookingId))}
        </div>
      </td>

      {/* Flight Code */}
      <td className="p-3 font-bold text-[#ffffff] text-xs tracking-widest">
        {flightCode}
      </td>

      {/* Route — resolved from flight relation */}
      <td className="p-3 text-xs font-bold text-[#d4e4fa] tracking-widest">
        {origin} &gt; {destination}
      </td>

      {/* Seat */}
      <td className="p-3 font-bold text-[#00e5ff] text-xs tracking-widest">
        {seatLabel}
      </td>

      {/* Fare */}
      <td className="p-3 font-bold text-[#00e5ff] text-xs tracking-widest">
        {priceLabel}
      </td>

      {/* Status Badge */}
      <td className="p-3 text-center">
        <span
          className={`inline-block px-2.5 py-1 text-[10px] font-bold border tracking-widest ${statusBadgeClass}`}
        >
          [{status}]
        </span>
      </td>

      {/* Cancel Action — CONFIRMED only */}
      <td className="p-3 text-right">
        {isConfirmed ? (
          <button
            id={`cancel-btn-${booking.bookingId}`}
            onClick={() => onCancel(String(booking.bookingId))}
            disabled={isRevoking}
            className="
              px-3 py-1.5 border border-[#ffb4ab] text-[#ffb4ab]
              font-bold text-[10px] tracking-widest uppercase
              transition-colors cursor-pointer
              hover:bg-[#ffb4ab] hover:text-[#051424]
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {isRevoking ? '[ REVOKING... ]' : '[ CANCEL_AUTHORIZATION ]'}
          </button>
        ) : isExpired ? (
          <span className="text-amber-500 text-[10px] font-bold tracking-widest">[ EXPIRED ]</span>
        ) : (
          <span className="text-[#3b494c] text-[10px] font-bold tracking-widest">—</span>
        )}
      </td>
    </tr>
  );
};

// ─── BookingsView ─────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'LOCKED', 'CANCELLED', 'EXPIRED'] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

export const BookingsView: React.FC = () => {
  const { data: bookings, isLoading, isError, error, refetch } = useBookings();
  const { data: flights } = useFlights();
  const { data: userProfile } = useUserProfile();
  const cancelMutation = useCancelBooking();

  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [search, setSearch] = useState('');
  
  // optimistic map: bookingId -> 'CANCELLED' for instant UI feedback
  const [optimisticCancelled, setOptimisticCancelled] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());

  // Resolve the logged-in passenger's full name
  const passengerName = useMemo(() => {
    if (!userProfile) return 'PASSENGER';
    return getResolvedFullName(userProfile) || 'PASSENGER';
  }, [userProfile]);

  // ── Real cancel: POST /api/bookings/cancel { bookingId } ──────────────────
  const handleCancel = useCallback((id: string) => {
    setCancelling((prev) => new Set(prev).add(id));
    // Optimistic flip — instantly show CANCELLED in UI
    setOptimisticCancelled((prev) => new Set(prev).add(id));

    cancelMutation.mutate(
      { bookingId: Number(id) },
      {
        onSuccess: () => {
          refetch();
        },
        onError: (err) => {
          console.error('[AEROLOCK] CANCEL_ERROR:', err);
          // Roll back optimistic update on failure
          setOptimisticCancelled((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
        onSettled: () => {
          setCancelling((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      }
    );
  }, [cancelMutation, refetch]);

  // ── Filter + Search ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const status = optimisticCancelled.has(String(b.bookingId)) ? 'CANCELLED' : getStatus(b);
      const matchesFilter = filter === 'ALL' || status === filter;
      if (!search.trim()) return matchesFilter;

      const flight = flights?.find((f) => Number(f.id) === Number(b.flightId));
      const origin = resolveNested(b.origin, flight?.origin);
      const destination = resolveNested(b.destination, flight?.destination);
      const flightCode = resolveField(
        b.flightCode,
        b.flightNumber,
        flight?.flightNumber,
        b.flightId,
      );
      const seatLabel = resolveField(
        b.seatNumber,
        b.seat?.seatNumber,
        b.seatId ? `SEAT ${b.seatId}` : null,
      );

      const q = search.toLowerCase();
      const hay = [
        b.passengerName,
        passengerName,
        b.pnr,
        b.bookingId,
        b.id,
        flightCode,
        origin,
        destination,
        seatLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesFilter && hay.includes(q);
    });
  }, [bookings, filter, search, flights, passengerName, optimisticCancelled]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6 uppercase tracking-widest">

      {/* ── Page Header ── */}
      <div className="bg-[#122131] border border-[#3b494c] p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-[#ffffff] tracking-widest uppercase">
            PASSENGER RESERVATIONS MANIFEST
          </h1>
          <p className="text-[10px] text-[#849396] mt-1 tracking-wider">
            LIVE BOOKING STREAM // {filtered.length} RECORD{filtered.length !== 1 ? 'S' : ''} RENDERED
          </p>
        </div>
        <button
          id="bookings-refresh-btn"
          onClick={() => refetch()}
          className="px-4 py-2 border border-[#3b494c] text-[#849396] text-[10px] font-bold tracking-widest hover:border-[#00e5ff] hover:text-[#00e5ff] transition-colors cursor-pointer"
        >
          [ REFRESH_STREAM ]
        </button>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="bookings-search-input"
          type="text"
          placeholder="SEARCH PASSENGER / PNR / FLIGHT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            flex-1 bg-[#122131] border border-[#3b494c] px-4 py-2.5
            text-[#d4e4fa] text-[10px] font-bold tracking-widest placeholder-[#3b494c]
            focus:outline-none focus:border-[#00e5ff] transition-colors
          "
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              id={`filter-btn-${s}`}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-[10px] font-bold tracking-widest border transition-all cursor-pointer ${
                filter === s
                  ? 'bg-[#00e5ff] border-[#00e5ff] text-[#051424]'
                  : 'border-[#3b494c] bg-[#122131] text-[#849396] hover:border-[#00e5ff] hover:text-[#ffffff]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── State: Loading ── */}
      {isLoading && (
        <div className="bg-[#122131] border border-[#3b494c] p-12 text-center">
          <span className="text-[#00e5ff] text-xs font-bold tracking-widest animate-pulse block">
            [ FETCHING BOOKING MANIFEST... ]
          </span>
          <span className="text-[#849396] text-[10px] tracking-wider mt-2 block">
            ESTABLISHING SECURE CHANNEL TO RESERVATION NODE
          </span>
        </div>
      )}

      {/* ── State: Error ── */}
      {isError && !isLoading && (
        <div className="bg-[#122131] border border-[#ffb4ab] p-10 text-center">
          <span className="text-[#ffb4ab] text-xs font-bold tracking-widest block mb-2">
            [ STREAM_ERROR: BOOKING MANIFEST UNAVAILABLE ]
          </span>
          <span className="text-[#849396] text-[10px] tracking-wider block mb-4">
            {error?.message?.toUpperCase() ?? 'UNKNOWN_ERROR'}
          </span>
          <button
            id="bookings-retry-btn"
            onClick={() => refetch()}
            className="px-4 py-2 border border-[#ffb4ab] text-[#ffb4ab] text-[10px] font-bold tracking-widest hover:bg-[#ffb4ab] hover:text-[#051424] transition-colors cursor-pointer"
          >
            [ RETRY ]
          </button>
        </div>
      )}

      {/* ── State: Empty ── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="bg-[#122131] border border-[#3b494c] p-12 text-center">
          <span className="text-[#00e5ff] text-xs font-bold tracking-widest block mb-2">
            [ NO BOOKINGS FOUND ]
          </span>
          <p className="text-[#849396] text-[10px] tracking-wider mb-4">
            {search || filter !== 'ALL'
              ? 'NO RECORDS MATCH THE ACTIVE SEARCH / FILTER PARAMETERS.'
              : 'NO FLIGHT RESERVATIONS ARE REGISTERED AGAINST THIS ACCOUNT.'}
          </p>
          {(search || filter !== 'ALL') && (
            <button
              id="bookings-clear-filter-btn"
              onClick={() => { setSearch(''); setFilter('ALL'); }}
              className="px-4 py-2 bg-[#00e5ff] text-[#051424] text-[10px] font-bold tracking-widest hover:bg-[#80f2ff] transition-colors cursor-pointer"
            >
              [ CLEAR FILTERS ]
            </button>
          )}
        </div>
      )}

      {/* ── Bookings Table ── */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="w-full overflow-x-auto bg-[#122131] border border-[#3b494c]">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-[#051424] border-b border-[#3b494c] text-[#849396] text-[10px] font-bold tracking-widest uppercase">
                <th className="p-3">PASSENGER / PNR</th>
                <th className="p-3">FLIGHT</th>
                <th className="p-3">ROUTE</th>
                <th className="p-3">SEAT</th>
                <th className="p-3">FARE</th>
                <th className="p-3 text-center">STATUS</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <BookingRow
                  key={b.bookingId}
                  booking={b}
                  onCancel={handleCancel}
                  cancelling={cancelling}
                  optimisticCancelled={optimisticCancelled}
                  flights={flights || []}
                  passengerName={passengerName}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsView;
