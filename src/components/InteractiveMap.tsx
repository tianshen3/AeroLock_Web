'use client';

import React, { useState } from 'react';

interface RadarNode {
  id: string;
  name: string;
  code: string;
  x: number; // percentage
  y: number; // percentage
  status: 'ACTIVE' | 'CLEARANCE' | 'STANDBY';
  flights: string[];
}

const NODES: RadarNode[] = [
  { id: '1', name: 'LONDON_TERMINAL_7', code: 'LHR_T7', x: 28, y: 32, status: 'ACTIVE', flights: ['AL-882', 'AL-104'] },
  { id: '2', name: 'GENEVA_HUB_02', code: 'GVA_H2', x: 38, y: 38, status: 'ACTIVE', flights: ['AL-104'] },
  { id: '3', name: 'TOKYO_HANEDA_NODE', code: 'HND_CN', x: 82, y: 36, status: 'ACTIVE', flights: ['AL-882', 'MSN-9901'] },
  { id: '4', name: 'JFK_STRATEGIC_BASE', code: 'JFK_SB', x: 18, y: 35, status: 'CLEARANCE', flights: ['AL-104', 'MSN-9901'] },
  { id: '5', name: 'SINGAPORE_AIR_TERMINAL', code: 'SIN_AT', x: 74, y: 58, status: 'ACTIVE', flights: ['AL-909'] },
  { id: '6', name: 'SYDNEY_DEFENCE_PRECINCT', code: 'SYD_DP', x: 88, y: 78, status: 'STANDBY', flights: ['AL-909'] },
];

interface InteractiveMapProps {
  onSelectNode?: (node: RadarNode) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(NODES[0]);
  const mapImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuD6M8sDddeNTbW5dDarFPMcSKJLQnOqhLa9tNr847B9ch8jfSXMxNauuM8NFPSNhKLah4RFJ8zClm-E1DkE89jzmClZGmK3i5e7D6otk-jjNU2HHbXUKJ7Rl1kIUs1zWUl7ty5I8hWqS8FC2vYbncrdDvrb_KrJyKIXd3AoI_FWtP_Nky-AhzEpzvc7soSokqFe6KtL8uWmqtxu-XJsnggCt7uMjGYwgIJ_aL6LNpoXT6v26t5339LTP-sZiV37ENxFHbHv6VhtKiQ";

  return (
    <div className="relative w-full h-48 md:h-60 bg-[#122131] border border-[#3b494c] overflow-hidden group select-none">
      {/* Background Image with HUD overlay */}
      <div
        className="w-full h-full bg-cover bg-center opacity-85 group-hover:opacity-100 transition-opacity duration-500 filter contrast-125 saturate-50"
        style={{ backgroundImage: `url('${mapImage}')` }}
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-bg-dense opacity-30 pointer-events-none"></div>

      {/* SVG Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <line x1="28%" y1="32%" x2="82%" y2="36%" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4 2" className="animate-pulse" />
        <line x1="18%" y1="35%" x2="38%" y2="38%" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
        <line x1="74%" y1="58%" x2="88%" y2="78%" stroke="#00e5ff" strokeWidth="1" opacity="0.8" />
        <line x1="28%" y1="32%" x2="38%" y2="38%" stroke="#00e5ff" strokeWidth="1.2" />
      </svg>

      {/* Radar Node Markers */}
      {NODES.map((node) => {
        const isSelected = selectedNode?.id === node.id;
        return (
          <div
            key={node.id}
            onClick={() => {
              setSelectedNode(node);
              if (onSelectNode) onSelectNode(node);
            }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/node"
          >
            <div className="relative flex items-center justify-center">
              <span className={`absolute w-4 h-4 rounded-full border ${isSelected ? 'border-[#00e5ff] animate-ping' : 'border-[#00e5ff]/40'}`}></span>
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00e5ff]' : 'bg-[#00e5ff]/70'} group-hover/node:scale-150 transition-transform`}></span>
              
              {/* Tooltip Label */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#051424] text-[#00e5ff] text-[9px] font-mono px-1.5 py-0.5 border border-[#00e5ff] opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none">
                {node.code}
              </div>
            </div>
          </div>
        );
      })}

      {/* Selected Node Status Bar HUD */}
      {selectedNode && (
        <div className="absolute bottom-2 left-2 right-2 bg-[#051424]/90 border border-[#00e5ff]/50 px-3 py-1.5 flex justify-between items-center z-30 font-mono text-[11px] text-[#d4e4fa] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00e5ff] animate-pulse"></span>
            <span className="font-bold text-[#00e5ff]">{selectedNode.name}</span>
            <span className="text-[#849396]">({selectedNode.code})</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px]">
            <span>STATUS: <strong className="text-emerald-400">{selectedNode.status}</strong></span>
            <span>ACTIVE VECTORS: <strong className="text-[#00e5ff]">{selectedNode.flights.join(', ')}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
