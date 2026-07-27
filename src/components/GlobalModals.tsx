'use client';

import React from 'react';
import { useTerminal } from '../context/TerminalContext';
import { SpecsModal } from './SpecsModal';
import { TerminalLoginModal } from './TerminalLoginModal';
import { NewMissionModal } from './NewMissionModal';
import { FleetDetailModal } from './FleetDetailModal';

export const GlobalModals: React.FC = () => {
  const {
    isSpecsOpen,
    setIsSpecsOpen,
    isLoginOpen,
    setIsLoginOpen,
    isNewMissionOpen,
    setIsNewMissionOpen,
    selectedUnit,
    setSelectedUnit,
    operator,
    handleSetClearance,
    handleCreateMission,
    handleUpdateFleetStatus,
  } = useTerminal();

  return (
    <>
      <SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />

      <TerminalLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentLevel={operator.clearance}
        onSetClearance={handleSetClearance}
      />

      <NewMissionModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onSubmitMission={handleCreateMission}
      />

      <FleetDetailModal
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onUpdateStatus={handleUpdateFleetStatus}
      />
    </>
  );
};
