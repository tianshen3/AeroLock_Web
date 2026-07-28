import React, { useState } from 'react';
import { OverrideRecord } from '../types';
import { AdminBooking } from '../../../hooks/useAdmin';
import { AlertTriangle, Plus, Search, ShieldAlert, X } from 'lucide-react';

interface OverridesViewProps {
  overrides: OverrideRecord[];
  adminBookings?: AdminBooking[];
  onForceCancel: (id: number, reason: string) => void;
  onAddOverride: (record: Omit<OverrideRecord, 'id' | 'timestamp'>) => void;
  isLoading?: boolean;
  isCancelling?: boolean;
  playBeep: () => void;
}

export const OverridesView: React.FC<OverridesViewProps> = ({
  overrides,
  adminBookings,
  onForceCancel,
  onAddOverride,
  isLoading,
  isCancelling,
  playBeep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cancelingRecord, setCancelingRecord] = useState<{ id: string; user: string; flight: string; seat: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('SECURITY_CLEARANCE_REVOKED');
  const [showInjectModal, setShowInjectModal] = useState(false);

  // Inject Form
  const [userName, setUserName] = useState('');
  const [vectorRef, setVectorRef] = useState('AL-101');
  const [seatRef, setSeatRef] = useState('1A');
  const [sectorRef, setSectorRef] = useState('ALPHA-01');

  // Convert live Admin Bookings (GET /bookings/admin) to OverrideRecord format
  const displayOverrides = React.useMemo(() => {
    if (adminBookings && adminBookings.length > 0) {
      return adminBookings.map((b) => ({
        id: String(b.id),
        user: (b.user?.name || b.user?.email || `USER #${b.userId}`).toUpperCase(),
        flight: (b.flight?.flightNumber || `FLIGHT #${b.flightId}`).toUpperCase(),
        seat: (b.seat?.seatNumber || `SEAT #${b.seatId}`).toUpperCase(),
        status: b.status,
        sector: `SECTOR-${b.seatId || '01'}`,
        timestamp: new Date(b.createdAt).toISOString().replace('T', ' ').slice(0, 19) + 'Z',
      }));
    }
    return overrides;
  }, [adminBookings, overrides]);

  const filteredOverrides = displayOverrides.filter((o) => {
    const matchesSearch =
      o.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.flight.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.seat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingRecord) return;
    playBeep();
    const bookingIdNum = parseInt(cancelingRecord.id, 10);
    onForceCancel(isNaN(bookingIdNum) ? 1 : bookingIdNum, cancelReason);
    setCancelingRecord(null);
  };

  const handleInjectOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    playBeep();
    onAddOverride({
      user: userName.trim().toUpperCase(),
      flight: vectorRef.trim().toUpperCase(),
      seat: seatRef.trim().toUpperCase(),
      sector: sectorRef.trim().toUpperCase(),
      status: 'CONFIRMED',
    });
    setUserName('');
    setShowInjectModal(false);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3b494c]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-[#ffb4ab] uppercase">
            <AlertTriangle className="w-6 h-6 text-[#ffb4ab]" />
            RESERVATION_LEDGER
          </h2>
        </div>

        <button
          onClick={() => {
            playBeep();
            setShowInjectModal(true);
          }}
          className="bg-[#ffb4ab] text-[#051424] px-5 py-2.5 font-bold text-xs flex items-center gap-2 hover:bg-white transition-colors border border-[#ffb4ab] self-start sm:self-auto shrink-0 rounded-none uppercase font-mono"
        >
          <Plus className="w-4 h-4" />
          MANUAL_BOOKING_INJECT
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="panel-bg border-technical p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center rounded-none">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#849396] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="FILTER BY PASSENGER ID, VECTOR REF, SECTOR, OR SEAT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#051424] border border-[#3b494c] text-[#d4e4fa] text-xs pl-9 pr-4 py-2 uppercase placeholder:text-[#849396]/60 focus:outline-none focus:border-[#ffb4ab] rounded-none font-mono"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-[10px]">
          {['ALL', 'CONFIRMED', 'LOCKED', 'OVERRIDDEN', 'CANCELLED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                playBeep();
                setStatusFilter(st);
              }}
              className={`px-3 py-1.5 border transition-colors whitespace-nowrap rounded-none uppercase font-mono ${
                statusFilter === st
                  ? 'border-[#ffb4ab] text-[#ffb4ab] bg-[#ffb4ab]/10 font-bold'
                  : 'border-[#3b494c] text-[#849396] hover:text-[#d4e4fa]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE / GRID LEDGER */}
      <div className="space-y-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-5 px-6 py-3 text-[10px] text-[#849396] font-bold border-b border-[#3b494c] tracking-wider uppercase font-mono">
          <div>PASSENGER_ID</div>
          <div>VECTOR_REF</div>
          <div>SECTOR / SEAT</div>
          <div>STATUS_CODE</div>
          <div className="text-right">COMMAND</div>
        </div>

        {isLoading ? (
          <div className="panel-bg border-technical p-12 text-center text-[#ffb4ab] text-xs font-mono uppercase">
            [SYS_NETWORK]: FETCHING_SYSTEM_RESERVATIONS_LEDGER...
          </div>
        ) : filteredOverrides.length === 0 ? (
          <div className="panel-bg border-technical p-12 text-center rounded-none">
            <p className="text-xs text-[#849396] uppercase font-mono">NO BOOKING RECORDS FOUND IN LEDGER</p>
          </div>
        ) : (
          filteredOverrides.map((o) => (
            <div
              key={o.id}
              className="panel-bg border-technical p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 items-center gap-4 group hover:border-[#ffb4ab] transition-colors rounded-none"
            >
              {/* PASSENGER ID */}
              <div>
                <span className="text-[10px] text-[#849396] md:hidden block mb-0.5 font-mono uppercase">PASSENGER_ID</span>
                <p className="font-bold truncate text-sm text-[#d4e4fa] font-mono uppercase">{o.user}</p>
                <p className="text-[10px] text-[#849396] font-mono">{o.timestamp}</p>
              </div>

              {/* VECTOR REF */}
              <div>
                <span className="text-[10px] text-[#849396] md:hidden block mb-0.5 font-mono uppercase">VECTOR_REF</span>
                <p className="font-mono text-sm text-[#849396] font-semibold uppercase">{o.flight}</p>
              </div>

              {/* SECTOR */}
              <div>
                <span className="text-[10px] text-[#849396] md:hidden block mb-0.5 font-mono uppercase">SECTOR</span>
                <p className="font-mono text-xs text-[#d4e4fa]">
                  {o.seat} <span className="text-[#849396]">({o.sector})</span>
                </p>
              </div>

              {/* STATUS CODE */}
              <div>
                <span className="text-[10px] text-[#849396] md:hidden block mb-0.5 font-mono uppercase">STATUS_CODE</span>
                <span
                  className={`inline-block px-2 py-1 border text-[10px] font-mono tracking-wider rounded-none ${
                    o.status === 'CONFIRMED'
                      ? 'border-[#00e5ff]/40 text-[#00e5ff] bg-[#00e5ff]/5'
                      : o.status === 'LOCKED' || o.status === 'PENDING'
                      ? 'border-[#ffb4ab]/40 text-[#ffb4ab] bg-[#ffb4ab]/5'
                      : o.status === 'OVERRIDDEN'
                      ? 'border-[#ffb4ab] text-[#ffb4ab] bg-[#ffb4ab]/20'
                      : 'border-[#3b494c] text-[#849396]'
                  }`}
                >
                  [ {o.status} ]
                </span>
              </div>

              {/* COMMAND */}
              <div className="md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-[#3b494c]">
                {o.status === 'CANCELLED' ? (
                  <span className="text-[11px] text-[#849396] italic font-mono uppercase">CANCELLED</span>
                ) : (
                  <button
                    onClick={() => {
                      playBeep();
                      setCancelingRecord(o);
                    }}
                    disabled={isCancelling}
                    className="text-[#ffb4ab] font-bold text-xs hover:bg-[#ffb4ab] hover:text-[#051424] px-3 py-1.5 border border-[#ffb4ab] transition-all rounded-none font-mono uppercase disabled:opacity-50"
                  >
                    {isCancelling && cancelingRecord?.id === o.id ? 'CANCELLING...' : '[ FORCE_CANCEL ]'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: FORCE CANCEL */}
      {cancelingRecord && (
        <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel-bg border-technical border-[#ffb4ab] w-full max-w-md p-6 relative rounded-none font-mono">
            <div className="flex items-center justify-between border-b border-[#3b494c] pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#ffb4ab] flex items-center gap-2 uppercase">
                <ShieldAlert className="w-5 h-5" />
                EXECUTE_FORCE_CANCEL
              </h3>
              <button
                onClick={() => setCancelingRecord(null)}
                className="p-1 border border-[#3b494c] text-[#ffb4ab] rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs font-mono">
              <p className="text-[#d4e4fa] leading-relaxed uppercase">
                YOU ARE ABOUT TO FORCE CANCEL RESERVATION BOOKING FOR{' '}
                <span className="font-bold text-[#ffb4ab]">{cancelingRecord.user}</span> ON VECTOR{' '}
                <span className="font-bold text-[#00e5ff]">{cancelingRecord.flight}</span> (SEAT {cancelingRecord.seat}).
              </p>

              <div>
                <label className="block text-[#849396] mb-1 uppercase">CANCELLATION REASON / REASON CODE</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] focus:outline-none focus:border-[#ffb4ab] rounded-none font-mono"
                >
                  <option value="SECURITY_CLEARANCE_REVOKED">SECURITY_CLEARANCE_REVOKED</option>
                  <option value="PRIORITY_VIP_OVERRIDE">PRIORITY_VIP_OVERRIDE</option>
                  <option value="VECTOR_WEIGHT_REDUCTION">VECTOR_WEIGHT_REDUCTION</option>
                  <option value="NO_SHOW_TIMED_OUT">NO_SHOW_TIMED_OUT</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#3b494c] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelingRecord(null)}
                  className="px-4 py-2 border border-[#3b494c] text-[#849396] rounded-none uppercase"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-5 py-2 bg-[#ffb4ab] text-[#051424] font-bold hover:bg-white transition-colors rounded-none uppercase disabled:opacity-50"
                >
                  {isCancelling ? 'EXECUTING...' : 'CONFIRM_FORCE_CANCEL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL BOOKING INJECT */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel-bg border-technical border-[#ffb4ab] w-full max-w-lg p-6 relative rounded-none font-mono">
            <div className="flex items-center justify-between border-b border-[#3b494c] pb-4 mb-6">
              <h3 className="font-bold text-lg text-[#ffb4ab] flex items-center gap-2 uppercase">
                <Plus className="w-5 h-5" />
                MANUAL_BOOKING_INJECT
              </h3>
              <button
                onClick={() => setShowInjectModal(false)}
                className="p-1 border border-[#3b494c] text-[#ffb4ab] rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInjectOverride} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#849396] mb-1 uppercase">PASSENGER NAME / ID *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. COMMANDER ADAMA"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#849396] mb-1 uppercase">VECTOR REF</label>
                  <input
                    type="text"
                    required
                    value={vectorRef}
                    onChange={(e) => setVectorRef(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[#849396] mb-1 uppercase">SEAT</label>
                  <input
                    type="text"
                    required
                    value={seatRef}
                    onChange={(e) => setSeatRef(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[#849396] mb-1 uppercase">SECTOR</label>
                  <input
                    type="text"
                    required
                    value={sectorRef}
                    onChange={(e) => setSectorRef(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#3b494c] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="px-4 py-2 border border-[#3b494c] text-[#849396] rounded-none uppercase"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffb4ab] text-[#051424] font-bold hover:bg-white transition-colors rounded-none uppercase"
                >
                  INJECT_PRIORITY_BOOKING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
