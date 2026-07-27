'use client';

import React, { useState } from 'react';
import { FleetUnit } from '../types';

interface FleetDetailModalProps {
  unit: FleetUnit | null;
  onClose: () => void;
  onUpdateStatus: (unitId: string, newStatus: FleetUnit['status']) => void;
}

export const FleetDetailModal: React.FC<FleetDetailModalProps> = ({
  unit,
  onClose,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'ARMAMENT' | 'COMMANDS'>('TELEMETRY');
  const [commandLog, setCommandLog] = useState<string[]>([]);

  if (!unit) return null;

  const handleIssueCommand = (cmd: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setCommandLog((prev) => [`[${timestamp}] EXECUTED: ${cmd}`, ...prev]);
    if (cmd === 'DEPLOY_TO_AIR') onUpdateStatus(unit.id, 'IN_TRANSIT');
    if (cmd === 'RECALL_TO_HANGAR') onUpdateStatus(unit.id, 'STANDBY');
    if (cmd === 'ACTIVATE_STEALTH_SHIELD') onUpdateStatus(unit.id, 'ACTIVE');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1c2d] border-2 border-[#00e5ff] w-full max-w-2xl p-6 relative font-mono text-[#d4e4fa] shadow-2xl space-y-6">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00e5ff]"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00e5ff]"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#3b494c] pb-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl">flight_takeoff</span>
            <div>
              <h3 className="font-bold text-lg text-[#00e5ff] uppercase">{unit.code} — {unit.name}</h3>
              <p className="text-xs text-[#849396]">LOCATION: {unit.currentLocation} ➔ {unit.destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#849396] hover:text-[#00e5ff]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Unit Hero Banner */}
        <div className="relative h-48 border border-[#3b494c] overflow-hidden group bg-[#122131]">
          <img
            src={unit.image}
            alt={unit.name}
            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c2d] via-transparent to-transparent"></div>
          
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div>
              <span className="text-[10px] bg-[#3b494c] text-[#051424] font-bold px-2 py-0.5 uppercase mr-2">
                {unit.stealthClass}
              </span>
              <span className="text-[#00e5ff] font-bold text-sm">{unit.speed}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#849396] uppercase block">STATUS</span>
              <span className="text-emerald-400 font-bold text-sm">{unit.status}</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-[#3b494c] text-xs font-bold">
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'TELEMETRY'
                ? 'border-[#00e5ff] text-[#00e5ff]'
                : 'border-transparent text-[#849396] hover:text-[#d4e4fa]'
            }`}
          >
            TELEMETRY
          </button>
          <button
            onClick={() => setActiveTab('ARMAMENT')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'ARMAMENT'
                ? 'border-[#00e5ff] text-[#00e5ff]'
                : 'border-transparent text-[#849396] hover:text-[#d4e4fa]'
            }`}
          >
            EQUIPMENT & ARMAMENT
          </button>
          <button
            onClick={() => setActiveTab('COMMANDS')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'COMMANDS'
                ? 'border-[#00e5ff] text-[#00e5ff]'
                : 'border-transparent text-[#849396] hover:text-[#d4e4fa]'
            }`}
          >
            TACTICAL COMMANDS
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 text-xs">
          {activeTab === 'TELEMETRY' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#122131] p-3 border border-[#3b494c]">
                <span className="text-[#849396] text-[10px] uppercase font-bold block">FUEL / POWER</span>
                <div className="text-[#00e5ff] font-bold text-base mt-1">{unit.fuelPercent}%</div>
                <div className="w-full bg-[#051424] h-1.5 mt-2">
                  <div className="bg-[#00e5ff] h-full" style={{ width: `${unit.fuelPercent}%` }}></div>
                </div>
              </div>

              <div className="bg-[#122131] p-3 border border-[#3b494c]">
                <span className="text-[#849396] text-[10px] uppercase font-bold block">STEALTH SHIELD</span>
                <div className="text-[#00e5ff] font-bold text-base mt-1">{unit.stealthPercent}%</div>
                <div className="w-full bg-[#051424] h-1.5 mt-2">
                  <div className="bg-emerald-400 h-full" style={{ width: `${unit.stealthPercent}%` }}></div>
                </div>
              </div>

              <div className="bg-[#122131] p-3 border border-[#3b494c]">
                <span className="text-[#849396] text-[10px] uppercase font-bold block">OPERATIONAL RANGE</span>
                <div className="text-[#d4e4fa] font-bold text-sm mt-1">{unit.range}</div>
              </div>

              <div className="bg-[#122131] p-3 border border-[#3b494c]">
                <span className="text-[#849396] text-[10px] uppercase font-bold block">PAYLOAD CAPABILITY</span>
                <div className="text-[#d4e4fa] font-bold text-sm mt-1">{unit.payloadCapacity}</div>
              </div>
            </div>
          )}

          {activeTab === 'ARMAMENT' && (
            <div className="bg-[#122131] p-4 border border-[#3b494c] space-y-3">
              <div>
                <span className="text-[#00e5ff] font-bold uppercase block">WEAPON PACKAGE & COUNTERMEASURES</span>
                <p className="text-[#bac9cc] mt-1">{unit.armament}</p>
              </div>
              <div className="border-t border-[#3b494c] pt-2 text-[#849396] text-[11px]">
                {unit.description}
              </div>
            </div>
          )}

          {activeTab === 'COMMANDS' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleIssueCommand('DEPLOY_TO_AIR')}
                  className="bg-[#00e5ff] text-[#051424] font-bold px-3 py-1.5 uppercase hover:bg-[#00daf3]"
                >
                  DEPLOY TO AIR
                </button>
                <button
                  onClick={() => handleIssueCommand('RECALL_TO_HANGAR')}
                  className="border border-[#00e5ff] text-[#00e5ff] font-bold px-3 py-1.5 uppercase hover:bg-[#00e5ff]/20"
                >
                  RECALL TO BASE
                </button>
                <button
                  onClick={() => handleIssueCommand('ACTIVATE_STEALTH_SHIELD')}
                  className="border border-[#849396] text-[#d4e4fa] font-bold px-3 py-1.5 uppercase hover:border-[#00e5ff]"
                >
                  ENGAGE STEALTH SHIELD
                </button>
              </div>

              {commandLog.length > 0 && (
                <div className="bg-[#051424] border border-[#3b494c] p-3 h-24 overflow-y-auto space-y-1 text-[11px]">
                  {commandLog.map((log, idx) => (
                    <div key={idx} className="text-[#00e5ff]">{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-[#3b494c]">
          <button
            onClick={onClose}
            className="border border-[#00e5ff] text-[#00e5ff] font-bold px-6 py-2 uppercase hover:bg-[#00e5ff] hover:text-[#051424]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
