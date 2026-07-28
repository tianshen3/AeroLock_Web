'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  TabType,
  ClearanceLevel,
  OperatorProfile,
  FlightVector,
  FleetUnit,
  MissionBooking,
  SystemLog,
  SystemMetrics,
} from '../types';
import {
  INITIAL_METRICS,
  INITIAL_LOGS,
  INITIAL_FLEET,
  INITIAL_FLIGHTS,
  INITIAL_MISSIONS,
} from '../data/mockData';

interface TerminalContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  metrics: SystemMetrics;
  logs: SystemLog[];
  fleet: FleetUnit[];
  flights: FlightVector[];
  missions: MissionBooking[];
  operator: OperatorProfile;
  searchQuery: { origin: string; destination: string; date: string; pax: number };
  isSpecsOpen: boolean;
  isNewMissionOpen: boolean;
  isLoginOpen: boolean;
  selectedUnit: FleetUnit | null;
  setIsSpecsOpen: (open: boolean) => void;
  setIsNewMissionOpen: (open: boolean) => void;
  setIsLoginOpen: (open: boolean) => void;
  setSelectedUnit: (unit: FleetUnit | null) => void;
  handleInitiateSearch: (params: { origin: string; destination: string; date: string; pax: number }) => void;
  handleBookFlight: (flight: FlightVector) => void;
  handleCreateMission: (missionData: Omit<MissionBooking, 'id' | 'timestamp' | 'status'>) => void;
  handleUpdateMissionStatus: (id: string, status: MissionBooking['status']) => void;
  handleUpdateUnitStatus: (unitId: string, newStatus: FleetUnit['status']) => void;
  handleUpdateFleetStatus: (unitId: string, newStatus: FleetUnit['status']) => void;
  handleAddLog: (newLog: SystemLog) => void;
  handleSetClearance: (level: ClearanceLevel, name: string) => void;
  handleLogout: () => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [metrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [fleet, setFleet] = useState<FleetUnit[]>(INITIAL_FLEET);
  const [flights] = useState<FlightVector[]>(INITIAL_FLIGHTS);
  const [missions, setMissions] = useState<MissionBooking[]>(INITIAL_MISSIONS);

  const [operator, setOperator] = useState<OperatorProfile>({
    id: 'op-01',
    name: 'OPERATOR_01',
    clearance: 'L2_COMMAND',
    avatar: '',
    nodeLocation: 'NORWAY_SECTOR_07',
    sessionTime: 12840,
  });

  // Sync operator state with localStorage token and user data
  React.useEffect(() => {
    const syncOperatorState = () => {
      if (typeof window === 'undefined') return;

      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const savedClearance = localStorage.getItem('clearance') as ClearanceLevel | null;

      if (token) {
        let name = 'OPERATOR_01';
        let clearance: ClearanceLevel = savedClearance || 'L2_COMMAND';

        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            if (userObj.name) name = String(userObj.name).toUpperCase();
            if (userObj.role && String(userObj.role).toUpperCase().includes('CIVILIAN')) {
              clearance = 'L1_CIVILIAN';
            } else if (userObj.role) {
              clearance = 'L2_COMMAND';
            }
          } catch {
            // Keep default fallback
          }
        }

        setOperator((prev) => ({
          ...prev,
          name,
          clearance,
        }));
      } else {
        setOperator({
          id: 'op-01',
          name: 'OPERATOR_01',
          clearance: 'L1_CIVILIAN',
          avatar: '',
          nodeLocation: 'NORWAY_SECTOR_07',
          sessionTime: 12840,
        });
      }
    };

    syncOperatorState();

    window.addEventListener('storage', syncOperatorState);
    window.addEventListener('focus', syncOperatorState);

    return () => {
      window.removeEventListener('storage', syncOperatorState);
      window.removeEventListener('focus', syncOperatorState);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState<{ origin: string; destination: string; date: string; pax: number }>({
    origin: '',
    destination: '',
    date: '2026-07-25',
    pax: 1,
  });

  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<FleetUnit | null>(null);

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
      priority: flight.clearanceRequired === 'L2_COMMAND' ? 'CRITICAL_ALPHA' : 'TACTICAL',
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
    const opName = name || 'OPERATOR_01';
    setOperator((prev) => ({
      ...prev,
      clearance: level,
      name: opName,
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('clearance', level);
      const existingUserStr = localStorage.getItem('user');
      if (existingUserStr) {
        try {
          const userObj = JSON.parse(existingUserStr);
          userObj.role = level;
          userObj.name = opName;
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch {
          localStorage.setItem('user', JSON.stringify({ name: opName, role: level }));
        }
      } else {
        localStorage.setItem('user', JSON.stringify({ name: opName, role: level }));
      }
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('clearance');
      window.dispatchEvent(new Event('storage'));
    }
    setOperator({
      id: 'op-01',
      name: 'OPERATOR_01',
      clearance: 'L1_CIVILIAN',
      avatar: '',
      nodeLocation: 'NORWAY_SECTOR_07',
      sessionTime: 12840,
    });
  };

  return (
    <TerminalContext.Provider
      value={{
        activeTab,
        setActiveTab,
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
        handleInitiateSearch,
        handleBookFlight,
        handleCreateMission,
        handleUpdateMissionStatus,
        handleUpdateUnitStatus,
        handleUpdateFleetStatus: handleUpdateUnitStatus,
        handleAddLog,
        handleSetClearance,
        handleLogout,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
