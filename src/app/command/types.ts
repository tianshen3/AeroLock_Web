export type ViewType = 'PERSONNEL' | 'WAITLIST' | 'VECTORS' | 'OVERRIDES';

export type VectorStatus = 'ON_TIME' | 'DEPARTED' | 'PRE_FLIGHT' | 'DELAYED' | 'IN_AIR' | 'TERMINATED';

export interface FlightVector {
  id: string;
  flight: string;
  route: string;
  departure: string;
  eta?: string;
  status: VectorStatus;
  altitude?: string;
  payload?: string;
  clearance?: string;
}

export type OverrideStatus = 'CONFIRMED' | 'PENDING' | 'OVERRIDDEN' | 'CANCELLED';

export interface OverrideRecord {
  id: string;
  user: string;
  flight: string;
  seat: string;
  status: OverrideStatus;
  sector: string;
  timestamp: string;
  reason?: string;
}

export interface PersonnelRecord {
  id: string;
  name: string;
  role: string;
  location: string;
  clearance: string;
  status: 'ACTIVE' | 'STANDBY' | 'ON_VECTOR' | 'OFFLINE';
}

export interface PayloadRecord {
  id: string;
  code: string;
  weight: string;
  destination: string;
  securityClass: string;
  status: 'VERIFIED' | 'IN_TRANSIT' | 'HOLD' | 'DISPATCHED';
}

export interface WaitlistItem {
  id: string;
  name: string;
  priorityLevel: number;
  requestedVector: string;
  timeInQueue: string;
}

export interface SystemNode {
  id: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'STANDBY' | 'SYNCING' | 'CRITICAL';
  pingMs: number;
  loadPct: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'SYS_INFO' | 'SYS_WARN' | 'EXEC_CMD' | 'OVERRIDE_ALERT';
  message: string;
  operator: string;
}

export interface OperatorProfile {
  id: string;
  name: string;
  clearance: string;
  node: string;
  protocol: string;
  activeSession: boolean;
}
