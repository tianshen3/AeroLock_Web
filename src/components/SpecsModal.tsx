'use client';

import React from 'react';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1c2d] border-2 border-[#00e5ff] w-full max-w-2xl p-6 relative font-mono text-[#d4e4fa] shadow-2xl space-y-6">
        {/* Corner Accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00e5ff]"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00e5ff]"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#3b494c] pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl">shield_with_heart</span>
            <div>
              <h3 className="font-bold text-lg text-[#00e5ff] uppercase tracking-wider">
                MAXIMUM_CARGO_PROTECTION_SPECIFICATION
              </h3>
              <p className="text-xs text-[#849396]">DOCUMENT ID: SPEC-AEROLOCK-2026-X89</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#849396] hover:text-[#00e5ff] p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Specifications Grid */}
        <div className="space-y-4 text-xs">
          <div className="bg-[#122131] p-4 border border-[#3b494c] space-y-2">
            <div className="text-[#00e5ff] font-bold text-sm uppercase">1. RADAR CLOAKING & SHIELDING</div>
            <p className="text-[#bac9cc] leading-relaxed">
              Proprietary carbon-nanotube metamaterial skin dampens RF signature by 99.98%. Operates seamlessly in passive anti-detection mode across all military X-band and S-band tracking nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#122131] p-3 border border-[#3b494c]">
              <span className="text-[#849396] block text-[10px] uppercase font-bold">KINETIC DEFENSE</span>
              <span className="text-[#00e5ff] font-bold text-sm">LEVEL 5 COMPOSITE HULL</span>
              <span className="text-xs text-[#bac9cc] block mt-1">Resists up to 30mm armor-piercing ordinance</span>
            </div>

            <div className="bg-[#122131] p-3 border border-[#3b494c]">
              <span className="text-[#849396] block text-[10px] uppercase font-bold">CARGO CONTAINER CRYPTO</span>
              <span className="text-[#00e5ff] font-bold text-sm">AES-256-GCM + HARDWARE HSM</span>
              <span className="text-xs text-[#bac9cc] block mt-1">Zero-knowledge key destruction on breach attempt</span>
            </div>

            <div className="bg-[#122131] p-3 border border-[#3b494c]">
              <span className="text-[#849396] block text-[10px] uppercase font-bold">ATMOSPHERIC RE-ENTRY</span>
              <span className="text-[#00e5ff] font-bold text-sm">MACH 6.5 THERMAL MATRIX</span>
              <span className="text-xs text-[#bac9cc] block mt-1">Sustained thermal resistance up to 2,800°C</span>
            </div>

            <div className="bg-[#122131] p-3 border border-[#3b494c]">
              <span className="text-[#849396] block text-[10px] uppercase font-bold">EMP SHIELDING</span>
              <span className="text-[#00e5ff] font-bold text-sm">FARADAY Cage Double-Hull</span>
              <span className="text-xs text-[#bac9cc] block mt-1">Attenuates nuclear pulse up to 200 kV/m</span>
            </div>
          </div>

          <div className="border border-[#00e5ff]/30 bg-[#00e5ff]/5 p-3 flex justify-between items-center text-[11px]">
            <span className="text-[#849396]">CLEARANCE STATUS:</span>
            <span className="text-[#00e5ff] font-bold">APPROVED FOR L2_COMMAND & L3_CLEARANCE</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#3b494c]">
          <button
            onClick={onClose}
            className="bg-[#00e5ff] text-[#051424] font-bold text-xs px-6 py-2 uppercase hover:bg-[#00daf3] transition-colors"
          >
            ACKNOWLEDGE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
