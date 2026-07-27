/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TabType,
  ClearanceLevel,
  OperatorProfile,
  FlightVector,
  FleetUnit,
  MissionBooking,
  SystemLog,
  SystemMetrics,
} from './types';
import {
  INITIAL_METRICS,
  INITIAL_LOGS,
  INITIAL_FLEET,
  INITIAL_FLIGHTS,
  INITIAL_MISSIONS,
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { BentoGrid } from './components/BentoGrid';
import { Footer } from './components/Footer';

import { SpecsModal } from './components/SpecsModal';
import { NewMissionModal } from './components/NewMissionModal';
import { TerminalLoginModal } from './components/TerminalLoginModal';
import { FleetDetailModal } from './components/FleetDetailModal';

import { SearchView } from './components/views/SearchView';
import { FleetView } from './components/views/FleetView';
import { BookingsView } from './components/views/BookingsView';
import { ProtocolsView } from './components/views/ProtocolsView';
import { LogsView } from './components/views/LogsView';
import { SystemView } from './components/views/SystemView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State objects
  const [metrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [fleet, setFleet] = useState<FleetUnit[]>(INITIAL_FLEET);
  const [flights] = useState<FlightVector[]>(INITIAL_FLIGHTS);
  const [missions, setMissions] = useState<MissionBooking[]>(INITIAL_MISSIONS);

  const [operator, setOperator] = useState<OperatorProfile>({
    id: 'op-01',
    name: 'OPERATOR_01',
    clearance: 'L3_CLEARANCE',
    avatar: '',
    nodeLocation: 'NORWAY_SECTOR_07',
    sessionTime: 12840,
  });

  // Hero Search Query state
  const [searchQuery, setSearchQuery] = useState<{ origin: string; destination: string; date: string; pax: number }>({
    origin: '',
    destination: '',
    date: '2026-07-25',
    pax: 1,
  });

  // Modals state
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<FleetUnit | null>(null);

  // Handlers
  const handleInitiateSearch = (params: { origin: string; destination: string; date: string; pax: number }) => {
    setSearchQuery(params);
    setActiveTab('SEARCH');
  };

  const handleBookFlight = (flight: FlightVector) => {
    const newMission: MissionBooking = {
      id: `MSN-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: `Flight Vector ${flight.flightCode} Clearance Reserve`,
      origin: flight.originCode,
      destination: flight.destinationCode,
      departureDate: flight.departureTime.split(' ')[0],
      pax: searchQuery.pax || 1,
      cargoType: 'RESERVED_PASSENGER_PAYLOAD',
      priority: flight.clearanceRequired === 'L3_CLEARANCE' ? 'CRITICAL_ALPHA' : 'TACTICAL',
      status: 'DISPATCHED',
      encryptionKey: flight.encryption,
      assignedUnit: 'UNIT_X_99',
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
    };
    setMissions((prev) => [newMission, ...prev]);
  };

  const handleCreateMission = (missionData: Omit<MissionBooking, 'id' | 'timestamp' | 'status'>) => {
    const created: MissionBooking = {
      ...missionData,
      id: `MSN-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'DISPATCHED',
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
    };
    setMissions((prev) => [created, ...prev]);

    // Add log
    const log: SystemLog = {
      id: String(Date.now()),
      timestamp: '0.001s',
      logCode: `LOG_${Math.floor(Math.random() * 80000 + 10000)}`,
      message: `NEW_MISSION_DISPATCHED: ${created.id} [${created.priority}]`,
      status: 'ACTIVE',
      category: 'CLEARANCE',
    };
    setLogs((prev) => [log, ...prev]);
  };

  const handleUpdateMissionStatus = (id: string, status: MissionBooking['status']) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleUpdateUnitStatus = (unitId: string, newStatus: FleetUnit['status']) => {
    setFleet((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
    );
    if (selectedUnit && selectedUnit.id === unitId) {
      setSelectedUnit((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAddLog = (newLog: SystemLog) => {
    setLogs((prev) => [newLog, ...prev.slice(0, 200)]);
  };

  const handleSetClearance = (level: ClearanceLevel, name: string) => {
    setOperator((prev) => ({
      ...prev,
      clearance: level,
      name: name || 'OPERATOR_01',
    }));
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] font-mono selection:bg-[#00e5ff] selection:text-[#051424] flex flex-col relative">
      {/* Top Header */}
      <Header />

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar Shell */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="lg:ml-64 flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
          {/* Mobile Top Controls Toggle */}
          <div className="lg:hidden bg-[#122131] border-b border-[#3b494c] p-3 flex justify-between items-center text-xs font-mono">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex items-center gap-2 text-[#00e5ff] font-bold"
            >
              <span className="material-symbols-outlined">menu</span>
              <span>MENU / NAVIGATION</span>
            </button>
            <span className="text-[#849396] text-[10px]">OPERATOR: {operator.name}</span>
          </div>

          {/* Active Tab Views */}
          <div className="flex-1">
            {activeTab === 'DASHBOARD' && (
              <>
                <HeroSection />
                <BentoGrid />
              </>
            )}

            {activeTab === 'SEARCH' && (
              <SearchView />
            )}

            {activeTab === 'FLEET' && (
              <FleetView />
            )}

            {activeTab === 'BOOKINGS' && (
              <BookingsView />
            )}

            {activeTab === 'PROTOCOLS' && (
              <ProtocolsView />
            )}

            {activeTab === 'LOGS' && (
              <LogsView />
            )}

            {activeTab === 'SYSTEM' && (
              <SystemView />
            )}
          </div>

          {/* Footer Terminal */}
          <Footer />
        </main>
      </div>

      {/* Global Modals */}
      <SpecsModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />
      
      <NewMissionModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onSubmitMission={handleCreateMission}
      />

      <TerminalLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentLevel={operator.clearance}
        onSetClearance={handleSetClearance}
      />

      <FleetDetailModal
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onUpdateStatus={handleUpdateUnitStatus}
      />
    </div>
  );
}
