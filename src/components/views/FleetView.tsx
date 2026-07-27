'use client';

import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { FleetUnit } from '../../types';

interface FleetViewProps {
  fleet?: FleetUnit[];
  onSelectUnit?: (unit: FleetUnit) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  fleet: propsFleet,
  onSelectUnit,
}) => {
  const { fleet: contextFleet, setSelectedUnit } = useTerminal();
  const fleet = propsFleet || contextFleet;
  const selectUnit = onSelectUnit || setSelectedUnit;
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredFleet = fleet.filter((unit) => {
    if (filterStatus === 'ALL') return true;
    return unit.status === filterStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6">
      {/* Header */}
      <div className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">flight_takeoff</span>
            TACTICAL_FLEET_REGISTRY
          </h2>
          <p className="text-xs text-[#849396] mt-1">
            DEPLOYMENT TELEMETRY, STEALTH COATINGS, AND ARMAMENT SPECIFICATIONS
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['ALL', 'ACTIVE', 'IN_TRANSIT', 'STANDBY', 'MAINTENANCE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 border uppercase transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'border-[#00e5ff] bg-[#00e5ff] text-[#051424] font-bold'
                  : 'border-[#3b494c] bg-[#122131] text-[#849396] hover:text-[#d4e4fa]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFleet.map((unit) => (
          <div
            key={unit.id}
            onClick={() => selectUnit(unit)}
            className="bg-[#0d1c2d] border border-[#3b494c] p-0 overflow-hidden hover:border-[#00e5ff] transition-all group cursor-pointer relative"
          >
            {/* Image Banner */}
            <div className="h-52 relative overflow-hidden bg-[#051424]">
              <img
                src={unit.image}
                alt={unit.name}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c2d] via-transparent to-transparent"></div>

              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 uppercase border ${
                  unit.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400' :
                  unit.status === 'IN_TRANSIT' ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]' :
                  'bg-[#3b494c] text-[#d4e4fa] border-[#849396]'
                }`}>
                  {unit.status}
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="text-xl font-bold text-[#00e5ff] block">{unit.code}</span>
                  <span className="text-xs text-[#d4e4fa] font-bold">{unit.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#849396] uppercase block">SPEED</span>
                  <span className="text-sm font-bold text-[#00e5ff]">{unit.speed}</span>
                </div>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#849396] leading-relaxed">{unit.description}</p>

              {/* Status Gauges */}
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-[#3b494c] pt-4">
                <div>
                  <div className="flex justify-between text-[10px] text-[#849396] uppercase font-bold mb-1">
                    <span>FUEL RESERVES</span>
                    <span className="text-[#00e5ff]">{unit.fuelPercent}%</span>
                  </div>
                  <div className="w-full bg-[#051424] h-1.5 border border-[#3b494c]">
                    <div className="bg-[#00e5ff] h-full" style={{ width: `${unit.fuelPercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#849396] uppercase font-bold mb-1">
                    <span>STEALTH COATING</span>
                    <span className="text-emerald-400">{unit.stealthPercent}%</span>
                  </div>
                  <div className="w-full bg-[#051424] h-1.5 border border-[#3b494c]">
                    <div className="bg-emerald-400 h-full" style={{ width: `${unit.stealthPercent}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Location & Action */}
              <div className="flex justify-between items-center text-xs border-t border-[#3b494c] pt-4">
                <div className="text-[11px]">
                  <span className="text-[#849396] uppercase block text-[9px]">LOCATION:</span>
                  <span className="text-[#d4e4fa] font-bold">{unit.currentLocation}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectUnit(unit);
                  }}
                  className="border border-[#00e5ff] text-[#00e5ff] px-4 py-2 font-bold text-xs uppercase hover:bg-[#00e5ff] hover:text-[#051424] transition-none flex items-center gap-1 cursor-pointer"
                >
                  <span>INSPECT & COMMAND</span>
                  <span className="material-symbols-outlined text-sm">settings</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
