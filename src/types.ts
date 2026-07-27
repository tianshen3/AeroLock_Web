export type TabType = 'DASHBOARD' | 'SEARCH' | 'FLEET' | 'BOOKINGS' | 'PROTOCOLS' | 'SYSTEM' | 'LOGS';

export type ClearanceLevel = 'L1_CIVILIAN' | 'L2_COMMAND';

export interface OperatorProfile {
  id: string;
  name: string;
  clearance: ClearanceLevel;
  avatar: string;
  nodeLocation: string;
  sessionTime: number;
}

export interface FlightVector {
  id: string;
  flightCode: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  paxCapacity: number;
  availablePax: number;
  stealthClass: string;
  speed: string;
  status: 'SCHEDULED' | 'BOARDING' | 'IN_FLIGHT' | 'AIRBORNE' | 'ARRIVED';
  encryption: string;
  clearanceRequired: ClearanceLevel;
}

export interface FleetUnit {
  id: string;
  code: string;
  name: string;
  stealthClass: string;
  speed: string;
  range: string;
  payloadCapacity: string;
  status: 'ACTIVE' | 'STANDBY' | 'IN_TRANSIT' | 'MAINTENANCE';
  fuelPercent: number;
  stealthPercent: number;
  image: string;
  description: string;
  armament: string;
  currentLocation: string;
  destination: string;
}

export interface MissionBooking {
  id: string;
  title: string;
  origin: string;
  destination: string;
  departureDate: string;
  pax: number;
  cargoType: string;
  priority: 'ROUTINE' | 'TACTICAL' | 'CRITICAL_ALPHA';
  status: 'PENDING' | 'DISPATCHED' | 'EN_ROUTE' | 'COMPLETED';
  encryptionKey: string;
  assignedUnit: string;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  logCode: string;
  message: string;
  status: 'OK' | 'ACTIVE' | 'WARNING' | 'CRITICAL';
  category: 'NETWORK' | 'SECURITY' | 'NAVIGATION' | 'CLEARANCE';
}

export interface SystemMetrics {
  uptimePercent: number;
  jitterMs: number;
  encryptionLevel: string;
  nodePingMs: number;
  activeFleetCount: number;
  authScope: string;
  systemStatus: 'NOMINAL' | 'ELEVATED' | 'DEFCON_2';
}
