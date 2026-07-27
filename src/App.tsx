/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTerminal } from './context/TerminalContext';

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
  const {
    activeTab,
    metrics,
    logs,
    fleet,
    flights,
    missions,
    operator,
    searchQuery,
    isSpecsOpen,
    isNewMissionOpen,
    isLoginOpen,
    selectedUnit,
    setIsSpecsOpen,
    setIsNewMissionOpen,
    setIsLoginOpen,
    setSelectedUnit,
    handleBookFlight,
    handleCreateMission,
    handleUpdateMissionStatus,
    handleUpdateUnitStatus,
    handleAddLog,
    handleSetClearance,
  } = useTerminal();

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
          {/* Active Tab Views */}
          <div className="flex-1">
            {activeTab === 'DASHBOARD' && (
              <>
                <HeroSection />
                <BentoGrid />
              </>
            )}

            {activeTab === 'SEARCH' && (
              <SearchView
                flights={flights}
                userClearance={operator.clearance}
                initialQuery={searchQuery}
                onBookFlight={handleBookFlight}
              />
            )}

            {activeTab === 'FLEET' && (
              <FleetView
                fleet={fleet}
                onSelectUnit={(unit) => setSelectedUnit(unit)}
              />
            )}

            {activeTab === 'BOOKINGS' && (
              <BookingsView
                missions={missions}
                onOpenNewMission={() => setIsNewMissionOpen(true)}
                onUpdateMissionStatus={handleUpdateMissionStatus}
              />
            )}

            {activeTab === 'PROTOCOLS' && (
              <ProtocolsView metrics={metrics} />
            )}

            {activeTab === 'LOGS' && (
              <LogsView logs={logs} onAddLog={handleAddLog} />
            )}

            {activeTab === 'SYSTEM' && (
              <SystemView metrics={metrics} />
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
