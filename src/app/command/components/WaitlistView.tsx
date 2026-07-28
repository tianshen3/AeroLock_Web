import React, { useState } from 'react';
import { Hourglass, Search, CheckCircle2 } from 'lucide-react';
import { WaitlistItem } from '../types';
import { AdminStats } from '../../../hooks/useAdmin';

interface WaitlistViewProps {
  waitlist: WaitlistItem[];
  stats?: AdminStats;
  playBeep: () => void;
}

export const WaitlistView: React.FC<WaitlistViewProps> = ({ waitlist, stats, playBeep }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = waitlist.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.requestedVector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* CONTROLS BAR */}
      <div className="panel-bg border-technical p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between rounded-none">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#051424] border border-[#3b494c] px-3 py-2 rounded-none">
          <Search className="w-4 h-4 text-[#849396]" />
          <input
            type="text"
            placeholder="SEARCH QUEUE BY NAME OR REQUESTED VECTOR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-[#d4e4fa] focus:outline-none w-full font-mono placeholder-[#849396] uppercase"
          />
        </div>
        <div className="text-xs text-[#849396] font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#ffb4ab]" />
          <span>STANDBY AUTO-PROMOTION ACTIVE ({stats ? `${stats.waitlist.total} IN SYSTEM` : 'LIVE'})</span>
        </div>
      </div>

      {/* WAITLIST TABLE */}
      <div className="panel-bg border-technical p-6 rounded-none">
        <div className="flex items-center justify-between border-b border-[#3b494c] pb-3 mb-4">
          <h3 className="font-bold text-sm tracking-wider flex items-center gap-2 text-[#d4e4fa] uppercase">
            <Hourglass className="w-4 h-4 text-[#ffb4ab]" />
            WAITLIST_PRIORITY_QUEUE
          </h3>
          <span className="text-[10px] text-[#00e5ff] font-mono uppercase">
            {stats ? `${stats.waitlist.total} TOTAL QUEUED` : `${filtered.length} CANDIDATES IN QUEUE`}
          </span>
        </div>

        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 border border-[#3b494c] bg-[#051424] hover:border-[#ffb4ab] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-none"
            >
              <div className="flex items-center gap-4">
                <span className="w-7 h-7 border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 flex items-center justify-center font-bold text-xs text-[#ffb4ab] font-mono shrink-0 rounded-none">
                  #{idx + 1}
                </span>
                <div>
                  <p className="font-bold text-sm text-[#d4e4fa] font-mono uppercase">{item.name}</p>
                  <p className="text-xs text-[#849396] font-mono">
                    REQUESTED VECTOR: <span className="text-[#00e5ff] uppercase">{item.requestedVector}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center font-mono">
                <div className="text-right">
                  <p className="text-[10px] text-[#849396]">PRIORITY</p>
                  <p className="text-xs font-bold text-[#ffb4ab]">LEVEL {item.priorityLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#849396]">WAIT TIME</p>
                  <p className="text-xs text-[#d4e4fa]">{item.timeInQueue}</p>
                </div>
                <button
                  onClick={() => playBeep()}
                  className="px-3 py-1 border border-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-[#051424] text-[#ffb4ab] text-[10px] font-bold transition-colors rounded-none uppercase"
                >
                  PROMOTE
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center border border-dashed border-[#3b494c] text-[#849396] text-xs font-mono uppercase rounded-none">
              NO WAITLIST QUEUE ITEMS MATCHING FILTER
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
