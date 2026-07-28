import React from 'react';
import { ViewType } from '../types';
import { Users, Hourglass, Rocket, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeView: ViewType;
  setView: (view: ViewType) => void;
  vectorCount: number;
  overrideCount: number;
  personnelCount: number;
  waitlistCount?: number;
  logCount?: number;
  operatorName: string;
  setOperatorName: (name: string) => void;
  playBeep: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setView,
  vectorCount,
  overrideCount,
  personnelCount,
  waitlistCount = 0,
  operatorName,
  setOperatorName,
  playBeep
}) => {
  const [isEditingOperator, setIsEditingOperator] = React.useState(false);
  const [tempName, setTempName] = React.useState(operatorName);

  const handleNav = (v: ViewType) => {
    playBeep();
    setView(v);
  };

  const handleSaveOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setOperatorName(tempName.trim().toUpperCase());
    }
    setIsEditingOperator(false);
  };

  return (
    <aside className="w-full md:w-64 border-r border-[#3b494c] flex flex-col bg-[#0d1c2d] shrink-0 font-mono rounded-none">
      <nav className="flex-1 py-4 sm:py-6">
        <div className="px-4 pb-2 text-[10px] text-[#849396] font-bold tracking-widest uppercase">
          LOCAL TACTICAL MENU
        </div>
        <ul className="space-y-2">
          <li>
            <button
              id="btn-PERSONNEL"
              onClick={() => handleNav('PERSONNEL')}
              className={`w-full text-left px-6 py-3.5 border-l-2 transition-all duration-75 flex items-center justify-between group rounded-none ${
                activeView === 'PERSONNEL'
                  ? 'bg-[#122131] text-[#ffb4ab] border-[#ffb4ab]'
                  : 'bg-transparent text-[#bac9cc] border-[#3b494c] hover:bg-[#122131]/60 hover:text-[#d4e4fa]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs tracking-wider uppercase">PERSONNEL</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#3b494c] bg-[#051424] text-[#d4e4fa] rounded-none">
                {personnelCount}
              </span>
            </button>
          </li>

          <li>
            <button
              id="btn-WAITLIST"
              onClick={() => handleNav('WAITLIST')}
              className={`w-full text-left px-6 py-3.5 border-l-2 transition-all duration-75 flex items-center justify-between group rounded-none ${
                activeView === 'WAITLIST'
                  ? 'bg-[#122131] text-[#ffb4ab] border-[#ffb4ab]'
                  : 'bg-transparent text-[#bac9cc] border-[#3b494c] hover:bg-[#122131]/60 hover:text-[#d4e4fa]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Hourglass className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs tracking-wider uppercase">WAITLIST</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#3b494c] bg-[#051424] text-[#d4e4fa] rounded-none">
                {waitlistCount}
              </span>
            </button>
          </li>

          <li>
            <button
              id="btn-VECTORS"
              onClick={() => handleNav('VECTORS')}
              className={`w-full text-left px-6 py-3.5 border-l-2 transition-all duration-75 flex items-center justify-between group rounded-none ${
                activeView === 'VECTORS'
                  ? 'bg-[#122131] text-[#ffb4ab] border-[#ffb4ab]'
                  : 'bg-transparent text-[#bac9cc] border-[#3b494c] hover:bg-[#122131]/60 hover:text-[#d4e4fa]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs tracking-wider uppercase">VECTORS</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#3b494c] bg-[#051424] text-[#d4e4fa] rounded-none">
                {vectorCount}
              </span>
            </button>
          </li>

          <li>
            <button
              id="btn-OVERRIDES"
              onClick={() => handleNav('OVERRIDES')}
              className={`w-full text-left px-6 py-3.5 border-l-2 transition-all duration-75 flex items-center justify-between group rounded-none ${
                activeView === 'OVERRIDES'
                  ? 'bg-[#122131] text-[#ffb4ab] border-[#ffb4ab]'
                  : 'bg-transparent text-[#bac9cc] border-[#3b494c] hover:bg-[#122131]/60 hover:text-[#d4e4fa]'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs tracking-wider uppercase">OVERRIDES</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#3b494c] bg-[#051424] text-[#d4e4fa] rounded-none">
                {overrideCount}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* OPERATOR BOX */}
      <div className="p-4 sm:p-5 border-t border-[#3b494c] bg-[#122131] rounded-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffb4ab]/10 border border-[#ffb4ab] flex items-center justify-center text-[#ffb4ab] font-bold text-xs font-mono rounded-none">
              AD
            </div>
            <div>
              <p className="text-[10px] text-[#849396] leading-none mb-1 font-mono uppercase">OPERATOR</p>
              {isEditingOperator ? (
                <form onSubmit={handleSaveOperator} className="flex gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-[#051424] border border-[#ffb4ab] text-[#d4e4fa] text-[11px] font-bold px-1 py-0.5 w-28 uppercase focus:outline-none font-mono rounded-none"
                    autoFocus
                  />
                  <button type="submit" className="text-[10px] bg-[#ffb4ab] text-[#051424] font-bold px-1.5 rounded-none">
                    OK
                  </button>
                </form>
              ) : (
                <p
                  onClick={() => setIsEditingOperator(true)}
                  className="text-[12px] font-bold text-[#d4e4fa] hover:text-[#ffb4ab] cursor-pointer flex items-center gap-1 font-mono uppercase"
                  title="Click to edit operator ID"
                >
                  <span>{operatorName}</span>
                </p>
              )}
            </div>
          </div>
          <span title="Clearance L2 COMMAND Verified">
            <ShieldCheck className="w-4 h-4 text-[#ffb4ab]" />
          </span>
        </div>
      </div>
    </aside>
  );
};
