'use client';

import React, { useState } from 'react';
import { useTerminal } from '../../context/TerminalContext';

export const SystemView: React.FC = () => {
  const { metrics } = useTerminal();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([
    'AEROLOCK CORE SYSTEM SHELL V4.8.2 [x86_64-aerolock-linux]',
    'Type "help" or "status" to query node metrics and command tools.',
    '------------------------------------------------------------',
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...history, `> ${inputVal}`];

    switch (cmd) {
      case 'help':
        newHistory.push(
          'AVAILABLE SYSTEM COMMANDS:',
          '  status    - Print cluster status, memory usage, and node pings',
          '  fleet     - List active stealth aircraft and position coordinates',
          '  scan      - Execute high-frequency RF radar frequency sweep',
          '  ping      - Measure network latency across global nodes',
          '  lockdown  - Toggle emergency defense lockdown state',
          '  clear     - Clear terminal buffer output'
        );
        break;
      case 'status':
        newHistory.push(
          `SYSTEM_STATUS: ${metrics.systemStatus}`,
          `UPTIME: ${metrics.uptimePercent}% | JITTER: ${metrics.jitterMs}ms`,
          `ENCRYPTION: ${metrics.encryptionLevel}`,
          `NODE PING: ${metrics.nodePingMs}ms | FLEET UNITS: ${metrics.activeFleetCount}`,
          `MEMORY: 128GB / 256GB ECC RAM | CPU LOAD: 14% [32 CORES NOMINAL]`
        );
        break;
      case 'fleet':
        newHistory.push(
          'FLEET ROSTER TELEMETRY:',
          '  UNIT_X_99          [ACTIVE] MACH 4.2  - SECTOR_07_NORWAY',
          '  UNIT_ALPHA_01      [TRANSIT] MACH 2.1 - PACIFIC_NODE_03',
          '  UNIT_SKY_SHADOW    [STANDBY] MACH 5.8 - HANGAR_NORTH_BAY',
          '  UNIT_VECTOR_STRIKER [ACTIVE] MACH 3.5  - LONDON_TERMINAL_01'
        );
        break;
      case 'scan':
        newHistory.push(
          'INITIATING RF RADAR FREQUENCY SWEEP...',
          'SCANNING 100MHz - 40GHz BANDWIDTH...',
          'NO UNIDENTIFIED ANOMALIES DETECTED IN ACTIVE CORRIDORS.',
          'ALL 4,812 FLEET UNITS REPORTING AES-256 ENCRYPTED SIGNALS.'
        );
        break;
      case 'ping':
        newHistory.push(
          'PINGING GLOBAL COORDINATION NODES:',
          '  LHR_T7 (London)    : 12ms [OK]',
          '  HND_CN (Tokyo)     : 42ms [OK]',
          '  GVA_H2 (Geneva)    : 18ms [OK]',
          '  JFK_SB (New York)  : 28ms [OK]'
        );
        break;
      case 'clear':
        setHistory([
          'AEROLOCK CORE SYSTEM SHELL V4.8.2 [x86_64-aerolock-linux]',
          'Type "help" for available commands.',
          '------------------------------------------------------------',
        ]);
        setInputVal('');
        return;
      case 'lockdown':
        newHistory.push(
          'WARNING: EMERGENCY DEFENSE LOCKDOWN ENGAGED.',
          'CARGO CORRIDORS SEALED. ALL UNACCEPTED DISPATCH ORDERS FROZEN.'
        );
        break;
      default:
        newHistory.push(`Command not recognized: "${cmd}". Type "help" for command list.`);
    }

    setHistory(newHistory);
    setInputVal('');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6">
      {/* Header */}
      <div className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">terminal</span>
            SYSTEM_DIAGNOSTICS_&_CLI
          </h2>
          <p className="text-xs text-[#849396] mt-1">
            CORE KERNEL CONTROL, HARDWARE TELEMETRY, AND INTERACTIVE SHELL
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-[#122131] border border-[#3b494c] px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[#00e5ff] font-bold">KERNEL 6.12.0-AEROLOCK</span>
        </div>
      </div>

      {/* Hardware Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-[#0d1c2d] border border-[#3b494c] p-4">
          <span className="text-[#849396] text-[10px] uppercase font-bold block">CPU CLUSTER LOAD</span>
          <span className="text-xl font-bold text-[#00e5ff] mt-1 block">14.2%</span>
          <div className="w-full bg-[#051424] h-1 mt-2">
            <div className="bg-[#00e5ff] h-full" style={{ width: '14.2%' }}></div>
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3b494c] p-4">
          <span className="text-[#849396] text-[10px] uppercase font-bold block">MEMORY ALLOCATION</span>
          <span className="text-xl font-bold text-[#d4e4fa] mt-1 block">128.4 GB</span>
          <div className="w-full bg-[#051424] h-1 mt-2">
            <div className="bg-[#d4e4fa] h-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3b494c] p-4">
          <span className="text-[#849396] text-[10px] uppercase font-bold block">QUANTUM KEY ENTROPY</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">99.99 %</span>
          <div className="w-full bg-[#051424] h-1 mt-2">
            <div className="bg-emerald-400 h-full" style={{ width: '99.99%' }}></div>
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3b494c] p-4">
          <span className="text-[#849396] text-[10px] uppercase font-bold block">COMMUNICATIONS BUS</span>
          <span className="text-xl font-bold text-[#00e5ff] mt-1 block">3.2 Tbps</span>
          <div className="w-full bg-[#051424] h-1 mt-2">
            <div className="bg-[#00e5ff] h-full" style={{ width: '78%' }}></div>
          </div>
        </div>
      </div>

      {/* Interactive Terminal CLI Box */}
      <div className="bg-[#010f1f] border-2 border-[#3b494c] p-4 font-mono text-xs space-y-3 relative shadow-2xl">
        <div className="scanline"></div>

        <div className="flex justify-between items-center border-b border-[#3b494c] pb-2 text-[#849396] text-[10px]">
          <span>INTERACTIVE TERMINAL CLI</span>
          <span className="text-[#00e5ff]">SHELL: /bin/aerolock-sh</span>
        </div>

        <div className="h-64 overflow-y-auto space-y-1 text-[#bac9cc] select-text">
          {history.map((line, index) => (
            <div
              key={index}
              className={line.startsWith('>') ? 'text-[#00e5ff] font-bold' : ''}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-[#3b494c] pt-2">
          <span className="text-[#00e5ff] font-bold">&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="TYPE COMMAND (e.g., help, status, scan, fleet, ping, clear)..."
            className="w-full bg-transparent border-none text-[#00e5ff] font-bold focus:outline-none focus:ring-0 p-0 text-xs"
          />
          <button
            type="submit"
            className="bg-[#00e5ff] text-[#051424] font-bold px-4 py-1 text-xs uppercase hover:bg-[#00daf3] cursor-pointer"
          >
            EXECUTE
          </button>
        </form>
      </div>
    </div>
  );
};
