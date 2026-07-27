'use client';

import React, { useState, useEffect } from 'react';
import { useTerminal } from '../../context/TerminalContext';
import { SystemLog } from '../../types';

export const LogsView: React.FC = () => {
  const { logs, handleAddLog } = useTerminal();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoStreaming, setIsAutoStreaming] = useState(true);
  const [customMsg, setCustomMsg] = useState('');

  // Auto stream simulation
  useEffect(() => {
    if (!isAutoStreaming) return;

    const interval = setInterval(() => {
      const logCodes = ['LOG_48829', 'LOG_48830', 'LOG_48831', 'LOG_48832', 'LOG_48833'];
      const msgs = [
        'ORBITAL_RE_ENTRY_VECTOR_SYNCHRONIZED',
        'AES256_SEED_ROTATE_PASS',
        'CLEARANCE_SLOT_VALIDATED_NODE_HND',
        'STEALTH_RADAR_CALIBRATION_CHECK_OK',
        'EMP_DAMPENER_FIELD_STABLE',
      ];
      const categories: SystemLog['category'][] = ['NETWORK', 'SECURITY', 'NAVIGATION', 'CLEARANCE'];

      const randomIdx = Math.floor(Math.random() * msgs.length);
      const newLog: SystemLog = {
        id: String(Date.now()),
        timestamp: `${(Math.random() * 0.2).toFixed(3)}s`,
        logCode: logCodes[randomIdx],
        message: msgs[randomIdx],
        status: Math.random() > 0.8 ? 'ACTIVE' : 'OK',
        category: categories[Math.floor(Math.random() * categories.length)],
      };

      handleAddLog(newLog);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoStreaming, handleAddLog]);

  const filteredLogs = logs.filter((log) => {
    const matchesCat = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg) return;
    const newLog: SystemLog = {
      id: String(Date.now()),
      timestamp: '0.001s',
      logCode: `LOG_${Math.floor(Math.random() * 90000 + 10000)}`,
      message: customMsg.toUpperCase(),
      status: 'OK',
      category: 'SECURITY',
    };
    handleAddLog(newLog);
    setCustomMsg('');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-mono text-[#d4e4fa] space-y-6">
      {/* Header */}
      <div className="border-b border-[#3b494c] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined">receipt_long</span>
            SYSTEM_&_NETWORK_LOGS
          </h2>
          <p className="text-xs text-[#849396] mt-1">
            REAL-TIME TERMINAL EVENT STREAM, NETWORK DIAGNOSTICS, AND AUDIT TRAILS
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsAutoStreaming(!isAutoStreaming)}
            className={`px-4 py-2 text-xs font-bold uppercase border flex items-center gap-2 cursor-pointer ${
              isAutoStreaming
                ? 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10'
                : 'border-[#849396] text-[#849396]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoStreaming ? 'bg-[#00e5ff] animate-ping' : 'bg-[#849396]'}`}></span>
            {isAutoStreaming ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1c2d] border border-[#3b494c] p-4 flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'SECURITY', 'NETWORK', 'NAVIGATION', 'CLEARANCE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 border uppercase cursor-pointer ${
                filterCategory === cat
                  ? 'border-[#00e5ff] bg-[#00e5ff] text-[#051424] font-bold'
                  : 'border-[#3b494c] bg-[#122131] text-[#849396]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="FILTER LOGS..."
            className="w-full bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none uppercase text-xs"
          />
        </div>
      </div>

      {/* Log Terminal Display Box */}
      <div className="bg-[#010f1f] border border-[#3b494c] p-4 h-96 overflow-y-auto space-y-2 font-mono text-xs">
        <div className="text-[#849396] text-[10px] pb-2 border-b border-[#3b494c] flex justify-between">
          <span>TERMINAL STREAM BUFFER [MAX 500]</span>
          <span>AUTOSCROLL: ENABLED</span>
        </div>

        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#122131] py-1.5 px-2 hover:bg-[#122131] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-[#849396] text-[10px] font-bold min-w-[60px]">{log.timestamp}</span>
              <span className="text-[#00e5ff] font-bold min-w-[90px]">{log.logCode}</span>
              <span className="text-[#d4e4fa]">{log.message}</span>
            </div>

            <div className="flex items-center gap-3 mt-1 sm:mt-0">
              <span className="text-[9px] bg-[#3b494c]/40 text-[#849396] px-1.5 py-0.5 uppercase">
                {log.category}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  log.status === 'OK' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Entry Form */}
      <form onSubmit={handleManualSubmit} className="bg-[#0d1c2d] border border-[#3b494c] p-4 flex gap-3 text-xs">
        <input
          type="text"
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          placeholder="DISPATCH MANUAL TERMINAL LOG ENTRY..."
          className="flex-1 bg-[#122131] border border-[#3b494c] p-2 text-[#d4e4fa] focus:border-[#00e5ff] focus:outline-none uppercase"
        />
        <button
          type="submit"
          className="bg-[#00e5ff] text-[#051424] font-bold px-6 py-2 uppercase hover:bg-[#00daf3] cursor-pointer"
        >
          POST_LOG
        </button>
      </form>
    </div>
  );
};
