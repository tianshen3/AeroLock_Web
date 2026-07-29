'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ViewType, FlightVector, OverrideRecord, SystemLog } from './types';
import {
  INITIAL_VECTORS,
  INITIAL_OVERRIDES,
  INITIAL_PERSONNEL,
  INITIAL_WAITLIST,
  INITIAL_LOGS,
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PersonnelView } from './components/PersonnelView';
import { WaitlistView } from './components/WaitlistView';
import { VectorsView } from './components/VectorsView';
import { OverridesView } from './components/OverridesView';
import { AtmosphericOverlay } from './components/AtmosphericOverlay';
import { Terminal, X, Send } from 'lucide-react';
import {
  useAdminStats,
  useAdminUsers,
  useAdminFlights,
  useCreateFlight,
  useUpdateFlight,
  useDeleteFlight,
  useAdminBookings,
  useAdminCancelBooking,
} from '../../hooks/useAdmin';

interface Toast {
  id: string;
  type: 'INFO' | 'WARN' | 'SUCCESS' | 'ALERT';
  text: string;
}

export default function CommandPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>('PERSONNEL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [operatorName, setOperatorName] = useState<string>('COMMAND_ADMIN_v1.0');

  // Verify Admin Authorization on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clearance = localStorage.getItem('clearance');
      const userStr = localStorage.getItem('user');
      let isAdmin = false;

      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.role === 'ADMIN' && clearance === 'L2_COMMAND') {
            isAdmin = true;
          }
        } catch {
          // ignore parsing error
        }
      }

      if (!isAdmin || clearance !== 'L2_COMMAND') {
        // Unauthenticated or insufficient clearance -> redirect to login
        router.push('/login?returnUrl=/command&tier=L2_COMMAND');
      }
    }
  }, [router]);

  // LIVE TANSTACK QUERY DATA HOOKS
  const { data: statsData, isLoading: isStatsLoading } = useAdminStats();
  const { data: usersData, isLoading: isUsersLoading } = useAdminUsers();
  const { data: flightsData, isLoading: isFlightsLoading } = useAdminFlights();
  const { data: bookingsData, isLoading: isBookingsLoading } = useAdminBookings();

  // MUTATIONS
  const createFlightMutation = useCreateFlight();
  const updateFlightMutation = useUpdateFlight();
  const deleteFlightMutation = useDeleteFlight();
  const cancelBookingMutation = useAdminCancelBooking();

  // Local state fallbacks
  const [vectors, setVectors] = useState<FlightVector[]>(INITIAL_VECTORS);
  const [overrides, setOverrides] = useState<OverrideRecord[]>(INITIAL_OVERRIDES);
  const [personnel] = useState(INITIAL_PERSONNEL);
  const [waitlist] = useState(INITIAL_WAITLIST);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showQuickCmd, setShowQuickCmd] = useState<boolean>(false);
  const [cmdInput, setCmdInput] = useState<string>('');

  // Audio Beep synth using Web Audio API
  const playBeep = (freq = 880, type: OscillatorType = 'sine', duration = 0.05) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext may be restricted before user interaction
    }
  };

  // Toast Helper
  const addToast = (text: string, type: 'INFO' | 'WARN' | 'SUCCESS' | 'ALERT' = 'INFO') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ id, text, type }, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Dismiss Toast
  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add Log Entry
  const addLog = (message: string, level: SystemLog['level'] = 'EXEC_CMD') => {
    const now = new Date();
    const timeStr = now.toISOString().slice(11, 22) + 'Z';
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      level,
      message,
      operator: operatorName,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Vector Handlers (Calling Live API / POST /flights, PATCH /flights/:id, DELETE /flights/:id)
  const handleAddVector = (newVec: { flightNumber: string; origin: string; destination: string; departureTime: string; arrivalTime: string }) => {
    createFlightMutation.mutate(newVec, {
      onSuccess: (data) => {
        addToast(`NEW VECTOR INJECTED VIA API: ${data.flightNumber}`, 'SUCCESS');
        addLog(`INITIATED VECTOR [${data.flightNumber}] :: ROUTE: ${data.origin} > ${data.destination}`, 'EXEC_CMD');
      },
      onError: () => {
        // Fallback local update
        const created: FlightVector = {
          id: `vec-${Date.now()}`,
          flight: newVec.flightNumber,
          route: `${newVec.origin} > ${newVec.destination}`,
          departure: newVec.departureTime,
          eta: newVec.arrivalTime,
          status: 'PRE_FLIGHT',
          altitude: '38,000 FT',
          payload: '15.0 TONS',
          clearance: 'LEVEL-4 COMMAND',
        };
        setVectors((prev) => [created, ...prev]);
        addToast(`VECTOR INJECTED (LOCAL): ${created.flight}`, 'SUCCESS');
        addLog(`LOCAL VECTOR INJECTED [${created.flight}]`, 'EXEC_CMD');
      },
    });
  };

  const handleUpdateVector = (id: number, updated: { departureTime?: string; arrivalTime?: string; flightNumber?: string; origin?: string; destination?: string }) => {
    updateFlightMutation.mutate({ id, data: updated }, {
      onSuccess: (data) => {
        addToast(`VECTOR UPDATED VIA API: ${data.flightNumber || id}`, 'INFO');
        addLog(`UPDATED VECTOR DATA FOR [${data.flightNumber || id}]`, 'EXEC_CMD');
      },
      onError: () => {
        setVectors((prev) =>
          prev.map((v) => (v.id === String(id) ? { ...v, departure: updated.departureTime || v.departure } : v))
        );
        addToast(`VECTOR UPDATED (LOCAL): ${id}`, 'INFO');
      },
    });
  };

  const handleTerminateVector = (id: number) => {
    deleteFlightMutation.mutate(id, {
      onSuccess: () => {
        addToast(`VECTOR TERMINATED VIA API: ${id}`, 'ALERT');
        addLog(`FORCE TERMINATED VECTOR [${id}] VIA API`, 'OVERRIDE_ALERT');
      },
      onError: () => {
        setVectors((prev) => prev.filter((v) => v.id !== String(id)));
        addToast(`VECTOR TERMINATED (LOCAL): ${id}`, 'ALERT');
        addLog(`FORCE TERMINATED VECTOR [${id}]`, 'OVERRIDE_ALERT');
      },
    });
  };

  // Override / Booking Force Cancel Handler (Calling Live API / PATCH /bookings/admin/:id/cancel)
  const handleForceCancelOverride = (bookingId: number, reason: string) => {
    cancelBookingMutation.mutate(bookingId, {
      onSuccess: (data) => {
        addToast(`FORCE CANCEL SUCCESSFUL FOR BOOKING #${data.bookingId}`, 'ALERT');
        addLog(`FORCE CANCELLED RESERVATION #${data.bookingId} :: REASON: ${reason}`, 'OVERRIDE_ALERT');
      },
      onError: () => {
        // Fallback local state update
        setOverrides((prev) =>
          prev.map((o) => (o.id === String(bookingId) ? { ...o, status: 'CANCELLED', reason } : o))
        );
        addToast(`FORCE CANCEL ENGAGED (LOCAL): #${bookingId}`, 'ALERT');
        addLog(`FORCE CANCELLED LOCAL RESERVATION #${bookingId} :: REASON: ${reason}`, 'OVERRIDE_ALERT');
      },
    });
  };

  const handleAddOverride = (record: Omit<OverrideRecord, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
    const newRecord: OverrideRecord = {
      ...record,
      id: `ovr-${Date.now()}`,
      timestamp: timeStr,
    };
    setOverrides((prev) => [newRecord, ...prev]);
    addToast(`PRIORITY OVERRIDE INJECTED: ${newRecord.user}`, 'SUCCESS');
    addLog(`INJECTED MANUAL OVERRIDE FOR [${newRecord.user}] ON SECTOR [${newRecord.sector}]`, 'EXEC_CMD');
  };

  // Command Line Injector
  const handleQuickCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    playBeep(1200, 'square', 0.08);
    const upperCmd = cmdInput.trim().toUpperCase();
    addLog(`COMMAND EXECUTED: ${upperCmd}`, 'EXEC_CMD');
    addToast(`EXECUTED: ${upperCmd}`, 'SUCCESS');

    if (upperCmd.includes('PERSONNEL')) setActiveView('PERSONNEL');
    if (upperCmd.includes('WAITLIST')) setActiveView('WAITLIST');
    if (upperCmd.includes('VECTOR')) setActiveView('VECTORS');
    if (upperCmd.includes('OVERRIDE')) setActiveView('OVERRIDES');

    setCmdInput('');
    setShowQuickCmd(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#051424] text-[#d4e4fa] font-mono selection:bg-[#ffb4ab] selection:text-[#051424]">
      {/* HEADER */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(!soundEnabled);
          addToast(soundEnabled ? 'BEELINE AUDIO MUTED' : 'BEELINE AUDIO ARMED', 'INFO');
        }}
        onOpenQuickCmd={() => {
          playBeep();
          setShowQuickCmd(true);
        }}
        activeView={activeView}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR TACTICAL MENU */}
        <Sidebar
          activeView={activeView}
          setView={(view) => {
            setActiveView(view);
            addLog(`NAVIGATED TO VIEW: ${view}`, 'SYS_INFO');
          }}
          vectorCount={flightsData ? flightsData.length : vectors.length}
          overrideCount={bookingsData ? bookingsData.length : overrides.length}
          personnelCount={usersData ? usersData.filter((u) => u.role !== 'ADMIN').length : personnel.length}
          waitlistCount={statsData ? statsData.waitlist.total : waitlist.length}
          logCount={logs.length}
          operatorName={operatorName}
          setOperatorName={(name) => {
            setOperatorName(name);
            addToast(`OPERATOR UPDATED: ${name}`, 'SUCCESS');
            addLog(`OPERATOR CLEARANCE ID SWITCHED TO [${name}]`, 'EXEC_CMD');
          }}
          playBeep={playBeep}
        />

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto grid-blueprint p-4 sm:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeView === 'PERSONNEL' && (
              <PersonnelView
                personnel={personnel}
                adminUsers={usersData}
                stats={statsData}
                isLoading={isUsersLoading || isStatsLoading}
                playBeep={playBeep}
              />
            )}

            {activeView === 'WAITLIST' && (
              <WaitlistView
                waitlist={waitlist}
                stats={statsData}
                playBeep={playBeep}
              />
            )}

            {activeView === 'VECTORS' && (
              <VectorsView
                vectors={vectors}
                adminFlights={flightsData}
                onAddVector={handleAddVector}
                onUpdateVector={handleUpdateVector}
                onTerminateVector={handleTerminateVector}
                isLoading={isFlightsLoading}
                playBeep={playBeep}
              />
            )}

            {activeView === 'OVERRIDES' && (
              <OverridesView
                overrides={overrides}
                adminBookings={bookingsData}
                onForceCancel={handleForceCancelOverride}
                onAddOverride={handleAddOverride}
                isLoading={isBookingsLoading}
                isCancelling={cancelBookingMutation.isPending}
                playBeep={playBeep}
              />
            )}
          </div>
        </main>
      </div>

      {/* QUICK COMMAND MODAL */}
      {showQuickCmd && (
        <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="panel-bg border-technical border-[#ffb4ab] w-full max-w-xl p-6 relative shadow-2xl rounded-none font-mono">
            <div className="flex items-center justify-between border-b border-[#3b494c] pb-4 mb-4">
              <h3 className="font-bold text-sm text-[#ffb4ab] flex items-center gap-2 uppercase">
                <Terminal className="w-4 h-4" />
                COMMAND_INJECTOR :: TERMINAL OVERRIDE
              </h3>
              <button
                onClick={() => setShowQuickCmd(false)}
                className="p-1 border border-[#3b494c] hover:border-[#ffb4ab] text-[#ffb4ab] rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCmdSubmit} className="space-y-4 text-xs font-mono">
              <p className="text-xs text-[#849396] uppercase">
                ENTER SYSTEM DIRECTIVE OR NAVIGATION KEYWORD (PERSONNEL | WAITLIST | VECTORS | OVERRIDES):
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  placeholder="E.G. GOTO OVERRIDES OR REKEY_AES_256..."
                  className="flex-1 bg-[#051424] border border-[#ffb4ab] text-[#d4e4fa] text-xs p-3 font-mono uppercase focus:outline-none rounded-none"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#ffb4ab] text-[#051424] font-bold text-xs flex items-center gap-2 hover:bg-white transition-colors shrink-0 rounded-none uppercase font-mono"
                >
                  <Send className="w-4 h-4" />
                  INJECT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATMOSPHERIC HUD & TOASTS */}
      <AtmosphericOverlay toasts={toasts} onDismissToast={handleDismissToast} />
    </div>
  );
}
