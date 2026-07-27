'use client';

import React, { useState } from 'react';
import { MissionBooking } from '../types';

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMission: (mission: Omit<MissionBooking, 'id' | 'timestamp' | 'status'>) => void;
}

export const NewMissionModal: React.FC<NewMissionModalProps> = ({
  isOpen,
  onClose,
  onSubmitMission,
}) => {
  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('LHR_T7');
  const [destination, setDestination] = useState('HND_CN');
  const [departureDate, setDepartureDate] = useState('2026-07-26');
  const [pax, setPax] = useState(2);
  const [cargoType, setCargoType] = useState('CRITICAL_QUANTUM_CORE');
  const [priority, setPriority] = useState<'ROUTINE' | 'TACTICAL' | 'CRITICAL_ALPHA'>('TACTICAL');
  const [encryptionKey, setEncryptionKey] = useState('0x9A4F...B881');
  const [assignedUnit, setAssignedUnit] = useState('UNIT_X_99');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmitMission({
      title,
      origin,
      destination,
      departureDate,
      pax,
      cargoType,
      priority,
      encryptionKey,
      assignedUnit,
    });
    // reset title
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1c2d] border-2 border-[#00e5ff] w-full max-w-xl p-6 relative font-mono text-[#d4e4fa] shadow-2xl space-y-6">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00e5ff]"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00e5ff]"></div>

        <div className="flex justify-between items-center border-b border-[#3b494c] pb-3">
          <div className="flex items-center gap-2 text-[#00e5ff]">
            <span className="material-symbols-outlined">add_task</span>
            <h3 className="font-bold text-base uppercase tracking-wider">CREATE_NEW_MISSION</h3>
          </div>
          <button onClick={onClose} className="text-[#849396] hover:text-[#00e5ff]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#849396] font-bold uppercase mb-1">Mission Title / Codename</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Operation Sub-Zero Orbital Relay"
              className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Origin Node</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Destination Node</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Departure Date</label>
              <input
                type="text"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Pax Count</label>
              <input
                type="number"
                min="1"
                max="20"
                value={pax}
                onChange={(e) => setPax(parseInt(e.target.value) || 1)}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'ROUTINE' | 'TACTICAL' | 'CRITICAL_ALPHA')}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#00e5ff] font-bold focus:border-[#00e5ff] focus:outline-none"
              >
                <option value="ROUTINE">ROUTINE</option>
                <option value="TACTICAL">TACTICAL</option>
                <option value="CRITICAL_ALPHA">CRITICAL_ALPHA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Cargo Designation</label>
              <input
                type="text"
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#849396] font-bold uppercase mb-1">Assigned Unit</label>
              <select
                value={assignedUnit}
                onChange={(e) => setAssignedUnit(e.target.value)}
                className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#00e5ff] focus:border-[#00e5ff] focus:outline-none font-bold"
              >
                <option value="UNIT_X_99">UNIT_X_99 (Mach 4.2 Interceptor)</option>
                <option value="UNIT_ALPHA_01">UNIT_ALPHA_01 (Heavy Transporter)</option>
                <option value="UNIT_SKY_SHADOW">UNIT_SKY_SHADOW (Recon Unit)</option>
                <option value="UNIT_VECTOR_STRIKER">UNIT_VECTOR_STRIKER (VIP Shuttle)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#849396] font-bold uppercase mb-1">Transit Encryption Seed</label>
            <input
              type="text"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#00e5ff] font-mono text-xs focus:border-[#00e5ff] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#3b494c] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#3b494c] px-4 py-2 text-[#849396] hover:text-[#d4e4fa]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="bg-[#00e5ff] text-[#051424] font-bold px-6 py-2 uppercase hover:bg-[#00daf3]"
            >
              DISPATCH_MISSION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
