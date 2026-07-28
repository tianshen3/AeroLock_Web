import React, { useState } from 'react';
import { Search, UserCheck, Filter } from 'lucide-react';
import { PersonnelRecord } from '../types';
import { AdminUser, AdminStats } from '../../../hooks/useAdmin';

interface PersonnelViewProps {
  personnel: PersonnelRecord[];
  adminUsers?: AdminUser[];
  stats?: AdminStats;
  isLoading?: boolean;
  playBeep: () => void;
}

export const PersonnelView: React.FC<PersonnelViewProps> = ({
  personnel,
  adminUsers,
  isLoading,
  playBeep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'STANDBY' | 'ON_VECTOR' | 'OFFLINE'>('ALL');

  // Convert live admin users from GET /users to personnel view format if available
  const displayPersonnel: PersonnelRecord[] = React.useMemo(() => {
    if (adminUsers && adminUsers.length > 0) {
      return adminUsers
        .filter((u) => u.role !== 'ADMIN') // Single admin hidden from personnel list
        .map((u) => ({
          id: String(u.id),
          name: u.name.toUpperCase(),
          role: `CUSTOMER (CLV: ${u.clvScore})`,
          location: '',
          clearance: '',
          status: u.isActive ? 'ACTIVE' : 'OFFLINE',
        }));
    }
    return personnel
      .filter((p) => p.role !== 'CHIEF TACTICAL OPERATOR' && !p.clearance.includes('COMMAND'))
      .map((p) => ({
        ...p,
        location: p.location === 'CIVILIAN SECTOR' ? '' : p.location,
        clearance: p.clearance === 'LEVEL 1 - CIVILIAN' ? '' : p.clearance,
      }));
  }, [adminUsers, personnel]);

  const filtered = displayPersonnel.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location ? p.location.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (p.clearance ? p.clearance.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* CONTROLS BAR */}
      <div className="panel-bg border-technical p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between rounded-none">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#051424] border border-[#3b494c] px-3 py-2 rounded-none">
          <Search className="w-4 h-4 text-[#849396]" />
          <input
            type="text"
            placeholder="SEARCH PERSONNEL BY NAME OR ROLE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-[#d4e4fa] focus:outline-none w-full font-mono placeholder-[#849396] uppercase"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-[#849396] shrink-0" />
          <span className="text-[10px] text-[#849396] font-bold shrink-0 uppercase">STATUS:</span>
          {(['ALL', 'ACTIVE', 'STANDBY', 'ON_VECTOR', 'OFFLINE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                playBeep();
                setStatusFilter(st);
              }}
              className={`px-2.5 py-1 text-[10px] font-bold border transition-colors shrink-0 rounded-none uppercase ${
                statusFilter === st
                  ? 'bg-[#ffb4ab]/10 border-[#ffb4ab] text-[#ffb4ab]'
                  : 'bg-[#051424] border-[#3b494c] text-[#849396] hover:text-[#d4e4fa]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* PERSONNEL DIRECTORY TABLE */}
      <div className="panel-bg border-technical p-6 rounded-none">
        <div className="flex items-center justify-between border-b border-[#3b494c] pb-3 mb-4">
          <h3 className="font-bold text-sm tracking-wider flex items-center gap-2 text-[#d4e4fa] uppercase">
            <UserCheck className="w-4 h-4 text-[#ffb4ab]" />
            ACTIVE_PERSONNEL_DIRECTORY
          </h3>
          <span className="text-[10px] text-[#00e5ff] font-mono">
            {isLoading ? 'SYNCING_DB...' : `${filtered.length} RECORDS DISPLAYED`}
          </span>
        </div>

        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-4 border border-[#3b494c] bg-[#051424] hover:border-[#ffb4ab] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-none"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#d4e4fa] font-mono uppercase">{p.name}</span>
                  {p.clearance && (
                    <span className="text-[10px] font-mono px-2 py-0.5 border border-[#ffb4ab]/60 text-[#ffb4ab] bg-[#0d1c2d] rounded-none">
                      {p.clearance}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#849396] flex items-center gap-2 font-mono uppercase">
                  <span>{p.role}</span>
                  {p.location && (
                    <>
                      <span>::</span>
                      <span className="text-[#d4e4fa]/80">{p.location}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`px-3 py-1 border text-[10px] font-bold font-mono tracking-wider rounded-none ${
                    p.status === 'ACTIVE'
                      ? 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10'
                      : p.status === 'ON_VECTOR'
                      ? 'border-[#ffb4ab] text-[#ffb4ab] bg-[#ffb4ab]/10'
                      : 'border-[#3b494c] text-[#849396] bg-[#051424]'
                  }`}
                >
                  [{p.status}]
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center border border-dashed border-[#3b494c] text-[#849396] text-xs font-mono uppercase rounded-none">
              NO PERSONNEL RECORDS MATCHING FILTER CRITERIA
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
