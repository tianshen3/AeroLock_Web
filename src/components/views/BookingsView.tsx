'use client';

import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { MissionBooking } from '../../types';

export const BookingsView: React.FC = () => {
  const { missions, setIsNewMissionOpen, handleUpdateMissionStatus } = useTerminal();
  const [filter, setFilter] = useState<string>('ALL');
  const [exportedMessage, setExportedMessage] = useState<string | null>(null);

  const filteredMissions = missions.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const handleExportTelemetry = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(missions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aerolock-missions-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportedMessage('MISSION TELEMETRY EXPORTED TO ENCRYPTED JSON.');
    setTimeout(() => setExportedMessage(null), 3500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6">
      {/* Header */}
      <div className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">airplane_ticket</span>
            MISSION_&_CLEARANCE_BOOKINGS
          </h2>
          <p className="text-xs text-[#849396] mt-1">
            ACTIVE DISPATCH ORDERS, CARGO MANIFESTS, AND PRIORITY OVERRIDES
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportTelemetry}
            className="border border-[#849396] text-[#d4e4fa] hover:border-[#00e5ff] px-4 py-2 text-xs font-bold uppercase flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            EXPORT TELEMETRY
          </button>

          <button
            onClick={() => setIsNewMissionOpen(true)}
            className="bg-[#00e5ff] text-[#051424] font-bold px-4 py-2 text-xs uppercase hover:bg-[#00daf3] flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_task</span>
            NEW_MISSION
          </button>
        </div>
      </div>

      {exportedMessage && (
        <div className="bg-[#00e5ff]/20 border border-[#00e5ff] p-3 text-[#00e5ff] text-xs font-bold">
          {exportedMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['ALL', 'EN_ROUTE', 'DISPATCHED', 'PENDING', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 border uppercase cursor-pointer ${
              filter === st
                ? 'border-[#00e5ff] bg-[#00e5ff] text-[#051424] font-bold'
                : 'border-[#3b494c] bg-[#122131] text-[#849396] hover:text-[#d4e4fa]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        {filteredMissions.length === 0 ? (
          <div className="bg-[#122131] border border-[#3b494c] p-12 text-center text-[#849396]">
            <p className="uppercase font-bold text-sm">NO MISSIONS FOUND IN THIS CATEGORY</p>
          </div>
        ) : (
          filteredMissions.map((mission) => (
            <div
              key={mission.id}
              className="bg-[#0d1c2d] border border-[#3b494c] p-6 space-y-4 hover:border-[#00e5ff] transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#3b494c] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[#00e5ff]">{mission.id}</span>
                  <span className="font-bold text-[#d4e4fa]">{mission.title}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 font-bold uppercase ${
                    mission.priority === 'CRITICAL_ALPHA' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                    mission.priority === 'TACTICAL' ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]' :
                    'bg-[#3b494c] text-[#d4e4fa]'
                  }`}>
                    {mission.priority}
                  </span>

                  <span className={`px-2 py-0.5 font-bold uppercase border ${
                    mission.status === 'EN_ROUTE' ? 'border-emerald-400 text-emerald-400' :
                    mission.status === 'DISPATCHED' ? 'border-[#00e5ff] text-[#00e5ff]' :
                    'border-[#849396] text-[#849396]'
                  }`}>
                    {mission.status}
                  </span>
                </div>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#849396] text-[10px] block uppercase">CORRIDOR ROUTE</span>
                  <span className="font-bold text-[#d4e4fa]">{mission.origin} ➔ {mission.destination}</span>
                </div>

                <div>
                  <span className="text-[#849396] text-[10px] block uppercase">CARGO MANIFEST</span>
                  <span className="font-bold text-[#bac9cc]">{mission.cargoType} ({mission.pax} PAX)</span>
                </div>

                <div>
                  <span className="text-[#849396] text-[10px] block uppercase">ASSIGNED UNIT</span>
                  <span className="font-bold text-[#00e5ff]">{mission.assignedUnit}</span>
                </div>

                <div>
                  <span className="text-[#849396] text-[10px] block uppercase">CRYPTO SEED</span>
                  <span className="font-mono text-[#849396]">{mission.encryptionKey}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-[10px] text-[#849396]">DISPATCH TIMESTAMP: {mission.timestamp}</span>

                <div className="flex gap-2">
                  {mission.status !== 'EN_ROUTE' && (
                    <button
                      onClick={() => handleUpdateMissionStatus(mission.id, 'EN_ROUTE')}
                      className="border border-[#00e5ff] text-[#00e5ff] px-3 py-1 hover:bg-[#00e5ff] hover:text-[#051424] font-bold text-[10px] uppercase cursor-pointer"
                    >
                      MARK EN ROUTE
                    </button>
                  )}
                  {mission.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateMissionStatus(mission.id, 'COMPLETED')}
                      className="border border-emerald-400 text-emerald-400 px-3 py-1 hover:bg-emerald-400 hover:text-[#051424] font-bold text-[10px] uppercase cursor-pointer"
                    >
                      MARK COMPLETED
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
