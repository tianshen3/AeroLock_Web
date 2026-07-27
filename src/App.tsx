'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTerminal } from './context/TerminalContext';
import { AppShell } from './components/AppShell';

import { HeroSection } from './components/HeroSection';
import { BentoGrid } from './components/BentoGrid';

import { SearchView } from './components/views/SearchView';
import { FleetView } from './components/views/FleetView';
import { BookingsView } from './components/views/BookingsView';
import { ProtocolsView } from './components/views/ProtocolsView';
import { LogsView } from './components/views/LogsView';
import { SystemView } from './components/views/SystemView';

function AppContent() {
  const {
    activeTab,
    metrics,
    logs,
    fleet,
    flights,
    missions,
    operator,
    searchQuery,
    setIsNewMissionOpen,
    setSelectedUnit,
    handleBookFlight,
    handleUpdateMissionStatus,
    handleAddLog,
  } = useTerminal();

  return (
    <>
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
    </>
  );
}

export default function App() {
  return (
    <AppShell>
      <AppContent />
    </AppShell>
  );
}
