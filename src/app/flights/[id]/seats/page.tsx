'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFlights } from '../../../../hooks/useFlights';

export default function SeatsPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params?.id as string;
  const { data: flights } = useFlights();

  const flight = Array.isArray(flights)
    ? flights.find((f) => String(f.id) === flightId)
    : null;

  const flightNumber = flight?.flightNumber || `FLIGHT_${flightId}`;

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const seatsLeft = ['A', 'B'];
  const seatsRight = ['C', 'D'];

  const occupiedSeats = new Set(['1A', '2B', '3C', '5D', '7A', '8C']);

  return (
    <div className="w-full min-h-screen bg-[#051424] font-mono text-[#d4e4fa] p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/flights"
        className="inline-flex items-center gap-2 text-[#bac9cc] hover:text-[#00e5ff] text-xs font-bold tracking-widest transition-colors uppercase no-underline"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        BACK_TO_FLIGHTS
      </Link>

      {/* Header */}
      <div className="border-b border-[#3b494c] pb-4">
        <span className="text-[10px] text-[#00e5ff] tracking-widest block">
          SEAT_MANIFEST_VECTOR
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-[#00e5ff]">
          CABIN_GRID // {flightNumber}
        </h1>
        {flight && (
          <p className="text-[#bac9cc] text-xs mt-1">
            {flight.origin?.toUpperCase()} ----&gt;&gt; {flight.destination?.toUpperCase()}
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-around text-xs border border-[#3b494c] p-3 bg-[#0d1c2d]">
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
      <div className="bg-[#122131] border border-[#3b494c] p-6">
        <div className="text-center text-[10px] text-[#849396] mb-6 tracking-[0.3em]">
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
                      className={`w-10 h-10 text-xs font-bold transition-all border ${
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

              <div className="text-[10px] text-[#849396] font-bold px-2">
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
                      className={`w-10 h-10 text-xs font-bold transition-all border ${
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

      {/* Action Footer */}
      <div className="flex justify-between items-center border-t border-[#3b494c] pt-4">
        <div className="text-xs">
          {selectedSeat ? (
            <span>
              SELECTED: <strong className="text-[#00e5ff]">{selectedSeat}</strong>
            </span>
          ) : (
            <span className="text-[#849396]">SELECT_A_VECTOR_SEAT</span>
          )}
        </div>
        <button
          disabled={!selectedSeat}
          onClick={() => {
            alert(`CONFIRMED SEAT RESERVATION: ${selectedSeat} FOR FLIGHT ${flightNumber}`);
            router.push('/flights');
          }}
          className="px-6 py-2 bg-[#00e5ff] text-[#00363d] font-bold text-xs hover:bg-[#9cf0ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          CONFIRM_SEAT
        </button>
      </div>
    </div>
  );
}
