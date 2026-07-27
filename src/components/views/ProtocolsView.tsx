'use client';

import React, { useState } from 'react';
import { SystemMetrics } from '../../types';

interface ProtocolsViewProps {
  metrics?: SystemMetrics;
}

export const ProtocolsView: React.FC<ProtocolsViewProps> = () => {
  const [activeEncryption, setActiveEncryption] = useState('AES-256-GCM');
  const [pinging, setPinging] = useState(false);
  const [pingResults, setPingResults] = useState<{ node: string; latency: number; status: string }[]>([
    { node: 'LONDON_LHR_T7', latency: 12, status: 'PASS' },
    { node: 'TOKYO_HND_CN', latency: 42, status: 'PASS' },
    { node: 'GENEVA_GVA_H2', latency: 18, status: 'PASS' },
    { node: 'JFK_STRATEGIC_BASE', latency: 28, status: 'PASS' },
  ]);
  const [rotationMsg, setRotationMsg] = useState<string | null>(null);

  const handleRunPingTest = () => {
    setPinging(true);
    setTimeout(() => {
      setPingResults([
        { node: 'LONDON_LHR_T7', latency: Math.floor(Math.random() * 10) + 8, status: 'PASS' },
        { node: 'TOKYO_HND_CN', latency: Math.floor(Math.random() * 15) + 35, status: 'PASS' },
        { node: 'GENEVA_GVA_H2', latency: Math.floor(Math.random() * 8) + 14, status: 'PASS' },
        { node: 'JFK_STRATEGIC_BASE', latency: Math.floor(Math.random() * 12) + 22, status: 'PASS' },
      ]);
      setPinging(false);
    }, 1200);
  };

  const handleRotateKeys = () => {
    setRotationMsg('KEY ROTATION INITIATED. RE-ENCRYPTING ACTIVE TRANSIT CHANNELS...');
    setTimeout(() => {
      setRotationMsg('SUCCESS: ALL NODES UPDATED WITH NEW AES-256 HARDWARE SEED.');
      setTimeout(() => setRotationMsg(null), 4000);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6">
      {/* Header */}
      <div className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">verified_user</span>
            SECURITY_&_PROTOCOLS
          </h2>
          <p className="text-xs text-[#849396] mt-1">
            AES-256-GCM KEY ROTATION, QUANTUM FIREWALL, AND SENSOR DIAGNOSTICS
          </p>
        </div>

        <button
          onClick={handleRotateKeys}
          className="bg-[#00e5ff] text-[#051424] font-bold px-4 py-2 text-xs uppercase hover:bg-[#00daf3] flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">key</span>
          ROTATE ENCRYPTION KEYS
        </button>
      </div>

      {rotationMsg && (
        <div className="bg-[#00e5ff]/20 border border-[#00e5ff] p-4 text-[#00e5ff] font-bold text-xs">
          {rotationMsg}
        </div>
      )}

      {/* Security Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Encryption Standards */}
        <div className="bg-[#0d1c2d] border border-[#3b494c] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#00e5ff]">
            <span className="material-symbols-outlined">lock</span>
            <h3 className="font-bold text-base uppercase">ACTIVE ENCRYPTION</h3>
          </div>

          <div className="space-y-3 text-xs">
            {['AES-256-GCM', 'QUANTUM_ECC_512', 'POST_QUANTUM_KYBER'].map((enc) => (
              <div
                key={enc}
                onClick={() => setActiveEncryption(enc)}
                className={`p-3 border cursor-pointer flex justify-between items-center ${
                  activeEncryption === enc
                    ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff]'
                    : 'border-[#3b494c] bg-[#122131] text-[#849396]'
                }`}
              >
                <div>
                  <div className="font-bold">{enc}</div>
                  <div className="text-[10px] text-[#849396]">Hardware Security Module (HSM)</div>
                </div>
                {activeEncryption === enc && <span className="material-symbols-outlined text-sm">check</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Node Latency Diagnostics */}
        <div className="bg-[#0d1c2d] border border-[#3b494c] p-6 space-y-4 md:col-span-2">
          <div className="flex justify-between items-center border-b border-[#3b494c] pb-3">
            <div className="flex items-center gap-2 text-[#00e5ff]">
              <span className="material-symbols-outlined">sensors</span>
              <h3 className="font-bold text-base uppercase">GLOBAL NODE LATENCY & DIAGNOSTICS</h3>
            </div>

            <button
              onClick={handleRunPingTest}
              disabled={pinging}
              className="border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-[#051424] px-3 py-1 text-xs font-bold uppercase cursor-pointer"
            >
              {pinging ? 'TESTING...' : 'RUN PING TEST'}
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {pingResults.map((res) => (
              <div
                key={res.node}
                className="bg-[#122131] border border-[#3b494c] p-3 flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-[#d4e4fa]">{res.node}</span>
                  <span className="text-[10px] text-[#849396] block">ENCRYPTED TUNNEL ACTIVE</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#00e5ff] font-bold">{res.latency} ms</span>
                  <span className="text-xs text-emerald-400 font-bold border border-emerald-400/50 bg-emerald-400/10 px-2 py-0.5">
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-[#122131] border border-[#3b494c] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#00e5ff] uppercase flex items-center gap-2">
          <span className="material-symbols-outlined">shield</span>
          AEROLOCK MANDATORY SECURITY PROTOCOLS V4.0
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 border border-[#3b494c] bg-[#051424]">
            <span className="text-[#00e5ff] font-bold block mb-1">AUTOMATED LOCKDOWN</span>
            <p className="text-[#bac9cc] text-[11px]">
              If 3 failed clearance checks occur within 10 seconds, terminal automatically seals active corridors and triggers EMP counter-shading.
            </p>
          </div>

          <div className="p-3 border border-[#3b494c] bg-[#051424]">
            <span className="text-[#00e5ff] font-bold block mb-1">ZERO-KNOWLEDGE AUDIT</span>
            <p className="text-[#bac9cc] text-[11px]">
              Flight manifests and cargo payloads are hashed with zero-knowledge cryptographic proofs. No raw identity logs stored in browser cache.
            </p>
          </div>

          <div className="p-3 border border-[#3b494c] bg-[#051424]">
            <span className="text-[#00e5ff] font-bold block mb-1">EPHEMERAL COMM SEEDS</span>
            <p className="text-[#bac9cc] text-[11px]">
              Communication seeds self-destruct after each 60-minute interval. Transit telemetry automatically rotates to secondary frequencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
