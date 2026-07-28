import React, { useState } from 'react';
import { FlightVector, VectorStatus } from '../types';
import { AdminFlight } from '../../../hooks/useAdmin';
import { Plus, Search, Edit3, Trash2, X, AlertOctagon, Rocket } from 'lucide-react';

interface VectorsViewProps {
  vectors: FlightVector[];
  adminFlights?: AdminFlight[];
  onAddVector: (vector: { flightNumber: string; origin: string; destination: string; departureTime: string; arrivalTime: string }) => void;
  onUpdateVector: (id: number, updated: { departureTime?: string; arrivalTime?: string; flightNumber?: string; origin?: string; destination?: string }) => void;
  onTerminateVector: (id: number) => void;
  isLoading?: boolean;
  playBeep: () => void;
}

export const VectorsView: React.FC<VectorsViewProps> = ({
  vectors,
  adminFlights,
  onAddVector,
  onUpdateVector,
  onTerminateVector,
  isLoading,
  playBeep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVector, setEditingVector] = useState<FlightVector | null>(null);
  const [terminatingVector, setTerminatingVector] = useState<FlightVector | null>(null);

  // New Vector Form State
  const [newFlight, setNewFlight] = useState('');
  const [newOrigin, setNewOrigin] = useState('JFK');
  const [newDestination, setNewDestination] = useState('LHR');
  const [newDep, setNewDep] = useState('2026-08-15T08:00:00.000Z');
  const [newEta, setNewEta] = useState('2026-08-15T20:00:00.000Z');

  // Convert live Admin Flight objects into FlightVector format if available
  const displayVectors: FlightVector[] = React.useMemo(() => {
    if (adminFlights && adminFlights.length > 0) {
      return adminFlights.map((f) => ({
        id: String(f.id),
        flight: f.flightNumber,
        route: `${f.origin} > ${f.destination}`,
        departure: f.departureTime,
        eta: f.arrivalTime,
        status: 'ON_TIME' as VectorStatus,
        altitude: '38,000 FT',
        payload: '15.0 TONS',
        clearance: 'LEVEL-4 COMMAND',
      }));
    }
    return vectors;
  }, [adminFlights, vectors]);

  // Filtered Vectors
  const filteredVectors = displayVectors.filter((v) => {
    return (
      v.flight.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.route.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateVector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlight.trim()) return;

    playBeep();
    onAddVector({
      flightNumber: newFlight.trim().toUpperCase(),
      origin: newOrigin.trim().toUpperCase(),
      destination: newDestination.trim().toUpperCase(),
      departureTime: newDep || new Date().toISOString(),
      arrivalTime: newEta || new Date(Date.now() + 36000000).toISOString(),
    });

    // Reset Form
    setNewFlight('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVector) return;
    playBeep();
    const flightIdNum = parseInt(editingVector.id, 10);
    const [originPart, destPart] = editingVector.route.split('>');

    onUpdateVector(isNaN(flightIdNum) ? 1 : flightIdNum, {
      departureTime: editingVector.departure,
      arrivalTime: editingVector.eta,
      flightNumber: editingVector.flight,
      origin: originPart ? originPart.trim() : 'JFK',
      destination: destPart ? destPart.trim() : 'LHR',
    });
    setEditingVector(null);
  };

  const handleConfirmTerminate = () => {
    if (!terminatingVector) return;
    playBeep();
    const flightIdNum = parseInt(terminatingVector.id, 10);
    onTerminateVector(isNaN(flightIdNum) ? 1 : flightIdNum);
    setTerminatingVector(null);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* HEADER & NEW VECTOR BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3b494c]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-[#ffb4ab] uppercase">
            <Rocket className="w-6 h-6 text-[#ffb4ab]" />
            ACTIVE_TRAJECTORIES
          </h2>
          <p className="text-xs text-[#849396] mt-1 font-mono uppercase">
            FLIGHT VECTOR REGISTRY & SPACE CLAIMS ({displayVectors.length} TOTAL VECTORS)
          </p>
        </div>

        <button
          onClick={() => {
            playBeep();
            setShowAddModal(true);
          }}
          className="bg-[#ffb4ab] text-[#051424] px-5 py-2.5 font-bold text-xs flex items-center gap-2 hover:bg-white transition-colors border border-[#ffb4ab] self-start sm:self-auto shrink-0 rounded-none uppercase font-mono"
        >
          <Plus className="w-4 h-4" />
          INITIATE_NEW_VECTOR
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="panel-bg border-technical p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center rounded-none">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#849396] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="SEARCH FLIGHT IDENT OR TRAJECTORY (E.G. AL-909 OR JFK > LHR)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#051424] border border-[#3b494c] text-[#d4e4fa] text-xs pl-9 pr-4 py-2 uppercase placeholder:text-[#849396]/60 focus:outline-none focus:border-[#ffb4ab] rounded-none font-mono"
          />
        </div>
      </div>

      {/* VECTOR LIST */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="panel-bg border-technical p-12 text-center text-[#ffb4ab] text-xs font-mono uppercase">
            [SYS_NETWORK]: FETCHING_GLOBAL_FLIGHT_MANIFEST...
          </div>
        ) : filteredVectors.length === 0 ? (
          <div className="panel-bg border-technical p-12 text-center rounded-none">
            <p className="text-xs text-[#849396] uppercase font-mono">NO ACTIVE VECTORS MATCHING FILTER CRITERIA</p>
          </div>
        ) : (
          filteredVectors.map((f) => (
            <div
              key={f.id}
              className="panel-bg border-technical p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:border-[#ffb4ab] transition-colors rounded-none"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                {/* IDENT */}
                <div className="border-r-0 sm:border-r border-[#3b494c] pr-4">
                  <p className="text-[10px] text-[#849396] mb-1 font-mono uppercase">IDENT</p>
                  <p className="font-bold text-lg text-[#d4e4fa] font-mono">FLIGHT: {f.flight}</p>
                </div>

                {/* TRAJECTORY */}
                <div className="border-r-0 sm:border-r border-[#3b494c] pr-4">
                  <p className="text-[10px] text-[#849396] mb-1 font-mono uppercase">TRAJECTORY</p>
                  <p className="font-bold text-lg text-[#ffb4ab] font-mono">{f.route}</p>
                  <p className="text-[10px] text-[#849396] mt-0.5 font-mono">ALT: {f.altitude || '38,000 FT'}</p>
                </div>

                {/* DEPARTURE */}
                <div>
                  <p className="text-[10px] text-[#849396] mb-1 font-mono uppercase">DEPARTURE / ETA</p>
                  <p className="font-bold text-sm text-[#d4e4fa] font-mono">{f.departure}</p>
                  <p className="text-[10px] text-[#849396] mt-0.5 font-mono">ETA: {f.eta || 'PENDING'}</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#3b494c]">
                <button
                  onClick={() => {
                    playBeep();
                    setEditingVector({ ...f });
                  }}
                  className="px-4 py-2 border border-[#3b494c] text-xs hover:bg-[#273647] hover:border-[#d4e4fa] transition-colors flex items-center gap-1.5 rounded-none font-mono uppercase"
                >
                  <Edit3 className="w-3 h-3" />
                  EDIT
                </button>
                <button
                  onClick={() => {
                    playBeep();
                    setTerminatingVector(f);
                  }}
                  className="px-4 py-2 border border-[#ffb4ab] text-[#ffb4ab] text-xs hover:bg-[#ffb4ab] hover:text-[#051424] font-bold transition-all flex items-center gap-1.5 rounded-none font-mono uppercase"
                >
                  <Trash2 className="w-3 h-3" />
                  TERMINATE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: INITIATE NEW VECTOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel-bg border-technical border-[#ffb4ab] w-full max-w-lg p-6 relative rounded-none font-mono">
            <div className="flex items-center justify-between border-b border-[#3b494c] pb-4 mb-6">
              <h3 className="font-bold text-lg text-[#ffb4ab] flex items-center gap-2 uppercase">
                <Plus className="w-5 h-5" />
                INITIATE_NEW_VECTOR
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 border border-[#3b494c] hover:border-[#ffb4ab] text-[#ffb4ab] rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVector} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#849396] mb-1 uppercase">FLIGHT IDENT *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. AL-909"
                  value={newFlight}
                  onChange={(e) => setNewFlight(e.target.value)}
                  className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#849396] mb-1 uppercase">ORIGIN AIRPORT *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. JFK"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[#849396] mb-1 uppercase">DESTINATION *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. LHR"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#849396] mb-1 uppercase">DEPARTURE TIMESTAMP</label>
                  <input
                    type="text"
                    placeholder="2026-08-15T08:00:00.000Z"
                    value={newDep}
                    onChange={(e) => setNewDep(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[#849396] mb-1 uppercase">ARRIVAL TIMESTAMP</label>
                  <input
                    type="text"
                    placeholder="2026-08-15T20:00:00.000Z"
                    value={newEta}
                    onChange={(e) => setNewEta(e.target.value)}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#3b494c] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#3b494c] text-[#849396] hover:text-[#d4e4fa] rounded-none uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffb4ab] text-[#051424] font-bold hover:bg-white transition-colors rounded-none uppercase"
                >
                  INJECT_VECTOR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT VECTOR */}
      {editingVector && (
        <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel-bg border-technical border-[#ffb4ab] w-full max-w-lg p-6 relative rounded-none font-mono">
            <div className="flex items-center justify-between border-b border-[#3b494c] pb-4 mb-6">
              <h3 className="font-bold text-lg text-[#ffb4ab] flex items-center gap-2 uppercase">
                <Edit3 className="w-5 h-5" />
                UPDATE_VECTOR :: {editingVector.flight}
              </h3>
              <button
                onClick={() => setEditingVector(null)}
                className="p-1 border border-[#3b494c] hover:border-[#ffb4ab] text-[#ffb4ab] rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#849396] mb-1 uppercase">TRAJECTORY ROUTE</label>
                <input
                  type="text"
                  value={editingVector.route}
                  onChange={(e) => setEditingVector({ ...editingVector, route: e.target.value })}
                  className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#849396] mb-1 uppercase">DEPARTURE</label>
                  <input
                    type="text"
                    value={editingVector.departure}
                    onChange={(e) => setEditingVector({ ...editingVector, departure: e.target.value })}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-[#849396] mb-1 uppercase">ETA / ARRIVAL</label>
                  <input
                    type="text"
                    value={editingVector.eta || ''}
                    onChange={(e) => setEditingVector({ ...editingVector, eta: e.target.value })}
                    className="w-full bg-[#051424] border border-[#3b494c] p-2.5 text-[#d4e4fa] uppercase focus:outline-none focus:border-[#ffb4ab] rounded-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#3b494c] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVector(null)}
                  className="px-4 py-2 border border-[#3b494c] text-[#849396] rounded-none uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffb4ab] text-[#051424] font-bold hover:bg-white transition-colors rounded-none uppercase"
                >
                  SAVE_CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM TERMINATE */}
      {terminatingVector && (
        <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel-bg border-technical border-[#ffb4ab] w-full max-w-md p-6 relative space-y-4 rounded-none font-mono">
            <div className="flex items-center gap-3 text-[#ffb4ab]">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg uppercase">TERMINATE_VECTOR_CONFIRMATION</h3>
            </div>

            <p className="text-xs text-[#d4e4fa] leading-relaxed uppercase">
              ARE YOU SURE YOU WANT TO TERMINATE FLIGHT VECTOR{' '}
              <span className="font-bold text-[#ffb4ab]">{terminatingVector.flight}</span> ({terminatingVector.route})?
              THIS WILL DELETE THE FLIGHT SCHEDULE VIA API (DELETE /flights/:id).
            </p>

            <div className="pt-4 border-t border-[#3b494c] flex justify-end gap-3 text-xs">
              <button
                onClick={() => setTerminatingVector(null)}
                className="px-4 py-2 border border-[#3b494c] text-[#849396] rounded-none uppercase"
              >
                ABORT
              </button>
              <button
                onClick={handleConfirmTerminate}
                className="px-5 py-2 bg-[#ffb4ab] text-[#051424] font-bold hover:bg-white transition-colors rounded-none uppercase"
              >
                EXECUTE_TERMINATION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
