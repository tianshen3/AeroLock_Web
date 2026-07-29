import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinWaitlist } from '../hooks/useWaitlist';

interface SeatsModalProps {
  flightNumber: string;
  flightId?: number | string;
  isFullyBooked?: boolean;
  onClose: () => void;
}

export function SeatsModal({ flightNumber, flightId = 1, isFullyBooked = false, onClose }: SeatsModalProps) {
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const seatsLeft = ['A', 'B'];
  const seatsRight = ['C', 'D'];

  const joinWaitlistMutation = useJoinWaitlist();

  // If marked fully booked, populate occupiedSeats with all 32 seat IDs
  const allSeatIds = rows.flatMap((r) => [...seatsLeft.map((c) => `${r}${c}`), ...seatsRight.map((c) => `${r}${c}`)]);
  const defaultOccupied = new Set(['1A', '2B', '3C', '5D', '7A', '8C']);
  const occupiedSeats = isFullyBooked ? new Set(allSeatIds) : defaultOccupied;

  const totalSeats = allSeatIds.length;
  const isCabinFull = isFullyBooked || occupiedSeats.size >= totalSeats;

  const handleJoinWaitlist = async () => {
    const targetFlightId = Number(flightId) || (parseInt(String(flightId).replace(/\D/g, ''), 10) || 1);
    console.log('[AEROLOCK_UI] Executing POST /waitlist for flightId:', targetFlightId);
    try {
      await joinWaitlistMutation.mutateAsync({ flightId: targetFlightId });
      onClose();
      router.push('/waitlist');
    } catch (err: unknown) {
      console.error('[AEROLOCK_UI] POST /waitlist REJECTED BY SERVER:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`[WAITLIST_REJECTED_BY_BACKEND]: ${msg}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#122131] border border-[#00e5ff] w-full max-w-xl p-6 font-mono text-[#d4e4fa] shadow-2xl relative rounded-none">
        <div className="flex justify-between items-center border-b border-[#3b494c] pb-4 mb-4">
          <div>
            <span className="text-[10px] text-[#00e5ff] tracking-widest block uppercase">SEAT_MANIFEST_VECTOR</span>
            <h2 className="text-xl font-bold text-[#00e5ff] uppercase">CABIN_GRID // {flightNumber}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#bac9cc] hover:text-[#00e5ff] border border-[#3b494c] px-3 py-1 text-xs cursor-pointer rounded-none uppercase"
          >
            [ESC_CLOSE]
          </button>
        </div>

        {/* Fully Booked Warning Alert */}
        {isCabinFull && (
          <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab] p-3 mb-4 text-[#ffb4ab] text-xs font-bold flex items-center justify-between uppercase rounded-none">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">block</span>
              <span>[ CABIN_FULL ] :: ALL SEATS CURRENTLY RESERVED</span>
            </div>
            <span className="text-[10px] text-[#d4e4fa]">WAITLIST_ONLY</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-around text-xs border border-[#3b494c] p-2 mb-6 bg-[#0d1c2d] rounded-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#122131] border border-[#00e5ff]"></div>
            <span>AVAILABLE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#3b494c]"></div>
            <span>OCCUPIED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#00e5ff]"></div>
            <span className="text-[#00e5ff] font-bold">SELECTED</span>
          </div>
        </div>

        {/* Aircraft Seat Grid */}
        <div className="bg-[#051424] border border-[#3b494c] p-4 max-h-[320px] overflow-y-auto rounded-none">
          <div className="text-center text-[10px] text-[#849396] mb-4 tracking-[0.3em] uppercase">
            ▲ COCKPIT / NOSE SECTION ▲
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-6">
                <div className="flex gap-2">
                  {seatsLeft.map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.has(seatId);
                    const isSelected = selectedSeat === seatId;

                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => setSelectedSeat(seatId)}
                        className={`w-10 h-10 text-xs font-bold transition-all border rounded-none ${
                          isSelected
                            ? 'bg-[#00e5ff] text-[#00363d] border-[#00e5ff]'
                            : isOccupied
                            ? 'bg-[#3b494c] text-[#849396] border-[#3b494c] cursor-not-allowed'
                            : 'bg-[#122131] text-[#00e5ff] border-[#00e5ff]/60 hover:bg-[#00e5ff]/20'
                        }`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-[#849396] font-bold px-2 uppercase">
                  ROW {row}
                </div>

                <div className="flex gap-2">
                  {seatsRight.map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.has(seatId);
                    const isSelected = selectedSeat === seatId;

                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => setSelectedSeat(seatId)}
                        className={`w-10 h-10 text-xs font-bold transition-all border rounded-none ${
                          isSelected
                            ? 'bg-[#00e5ff] text-[#00363d] border-[#00e5ff]'
                            : isOccupied
                            ? 'bg-[#3b494c] text-[#849396] border-[#3b494c] cursor-not-allowed'
                            : 'bg-[#122131] text-[#00e5ff] border-[#00e5ff]/60 hover:bg-[#00e5ff]/20'
                        }`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action footer */}
        <div className="mt-6 flex justify-between items-center border-t border-[#3b494c] pt-4">
          <div className="text-xs">
            {isCabinFull ? (
              <span className="text-[#ffb4ab] uppercase font-bold">ALL_SEATS_FILLED // WAITLIST_REQUIRED</span>
            ) : selectedSeat ? (
              <span>SELECTED: <strong className="text-[#00e5ff]">{selectedSeat}</strong></span>
            ) : (
              <span className="text-[#849396] uppercase">SELECT_A_VECTOR_SEAT</span>
            )}
          </div>
          
          {isCabinFull ? (
            <button
              disabled={joinWaitlistMutation.isPending}
              onClick={handleJoinWaitlist}
              className="px-6 py-2 bg-[#00e5ff] text-[#051424] font-bold text-xs hover:bg-[#00daf3] transition-all rounded-none cursor-pointer uppercase flex items-center gap-1 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>{joinWaitlistMutation.isPending ? '[ JOINING... ]' : '[+] JOIN_WAITLIST'}</span>
            </button>
          ) : (
            <button
              disabled={!selectedSeat}
              onClick={() => {
                alert(`CONFIRMED SEAT RESERVATION: ${selectedSeat} FOR FLIGHT ${flightNumber}`);
                onClose();
              }}
              className="px-6 py-2 bg-[#00e5ff] text-[#00363d] font-bold text-xs hover:bg-[#9cf0ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-none uppercase cursor-pointer"
            >
              CONFIRM_SEAT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
