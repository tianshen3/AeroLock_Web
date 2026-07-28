'use client';

import React, { useState, useMemo } from 'react';
import { useBookings, type Booking, type BookingStatus } from '../../hooks/useBookings';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (b: Booking): BookingStatus => {
  const raw = (b.status ?? '').toString().toUpperCase().trim();
  if (raw === 'CONFIRMED') return 'CONFIRMED';
  if (raw === 'PENDING') return 'PENDING';
  return 'CANCELLED';
};

const resolveField = (...candidates: (string | undefined | null)[]): string => {
  for (const c of candidates) {
    if (c && c.toString().trim()) return c.toString().trim().toUpperCase();
  }
  return '—';
};

// ─── Booking Row ──────────────────────────────────────────────────────────────

interface BookingRowProps {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: Set<string>;
}

const BookingRow: React.FC<BookingRowProps> = ({ booking, onCancel, cancelling }) => {
  const status = getStatus(booking);
  const isConfirmed = status === 'CONFIRMED';
  const isCancelled = status === 'CANCELLED';
  const isPending = status === 'PENDING';
  const isRevoking = cancelling.has(booking.id);

  const statusBadgeClass = isCancelled
    ? 'border-[#ffb4ab] text-[#ffb4ab] bg-[#ffb4ab]/10'
    : isPending
    ? 'border-amber-400 text-amber-300 bg-amber-400/10'
    : 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10';

  return (
    <tr
      className={`border-b border-[#3b494c] transition-colors hover:bg-[#00e5ff]/5 ${
        isCancelled ? 'opacity-55' : ''
      }`}
    >
      {/* Passenger / PNR */}
      <td className="p-3">
        <div className="font-bold text-[#00e5ff] text-xs tracking-widest">
          {resolveField(booking.passengerName, 'PASSENGER')}
        </div>
        <div className="text-[10px] text-[#849396] mt-0.5 font-mono tracking-wider">
          {resolveField(booking.pnr, booking.bookingId, booking.id)}
        </div>
      </td>

      {/* Flight Code */}
      <td className="p-3 font-bold text-[#ffffff] text-xs tracking-widest">
        {resolveField(booking.flightCode, booking.flightId)}
      </td>

      {/* Route */}
      <td className="p-3 text-xs font-bold text-[#d4e4fa] tracking-widest">
        {resolveField(booking.origin)} &gt; {resolveField(booking.destination)}
      </td>

      {/* Seat */}
      <td className="p-3 font-bold text-[#00e5ff] text-xs tracking-widest">
        {resolveField(booking.seat, booking.seatId)}
      </td>

      {/* Fare */}
      <td className="p-3 font-bold text-[#00e5ff] text-xs tracking-widest">
        {resolveField(booking.price, booking.fare)}
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
            id={`cancel-btn-${booking.id}`}
            onClick={() => onCancel(booking.id)}
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
        ) : (
          <span className="text-[#3b494c] text-[10px] font-bold tracking-widest">—</span>
        )}
      </td>
    </tr>
  );
};

// ─── BookingsView ─────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

export const BookingsView: React.FC = () => {
  const { data: bookings, isLoading, isError, error, refetch } = useBookings();

  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [search, setSearch] = useState('');
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());

  // ── Cancel handler (optimistic UI stub — server call can be wired here) ──
  const handleCancel = (id: string) => {
    setCancelling((prev) => new Set(prev).add(id));
    // Future: POST /api/bookings/:id/cancel — then call refetch()
    setTimeout(() => {
      setCancelling((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refetch();
    }, 1500);
  };

  // ── Filter + Search ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const status = getStatus(b);
      const matchesFilter = filter === 'ALL' || status === filter;
      if (!search.trim()) return matchesFilter;
      const q = search.toLowerCase();
      const hay = [
        b.passengerName,
        b.pnr,
        b.bookingId,
        b.id,
        b.flightCode,
        b.flightId,
        b.origin,
        b.destination,
        b.seat,
        b.seatId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesFilter && hay.includes(q);
    });
  }, [bookings, filter, search]);

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
                  key={b.id}
                  booking={b}
                  onCancel={handleCancel}
                  cancelling={cancelling}
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
