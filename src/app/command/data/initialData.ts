import { FlightVector, OverrideRecord, PersonnelRecord, PayloadRecord, WaitlistItem, SystemNode, SystemLog } from '../types';

export const INITIAL_VECTORS: FlightVector[] = [
  { id: 'vec-1', flight: 'AL-909', route: 'JFK > LHR', departure: '2026-08-15 08:00Z', eta: '2026-08-15 19:45Z', status: 'ON_TIME', altitude: '38,000 FT', payload: '14.2 TONS', clearance: 'LEVEL-4' },
  { id: 'vec-2', flight: 'AL-104', route: 'HND > LAX', departure: '2026-08-15 12:30Z', eta: '2026-08-15 22:15Z', status: 'DEPARTED', altitude: '41,000 FT', payload: '22.0 TONS', clearance: 'LEVEL-5' },
  { id: 'vec-3', flight: 'AL-772', route: 'DXB > CDG', departure: '2026-08-16 01:15Z', eta: '2026-08-16 08:30Z', status: 'PRE_FLIGHT', altitude: '36,000 FT', payload: '18.5 TONS', clearance: 'LEVEL-3' },
  { id: 'vec-4', flight: 'AL-303', route: 'FRA > SYD', departure: '2026-08-16 05:45Z', eta: '2026-08-16 23:10Z', status: 'IN_AIR', altitude: '43,000 FT', payload: '19.8 TONS', clearance: 'LEVEL-5' },
  { id: 'vec-5', flight: 'AL-512', route: 'SFO > ICN', departure: '2026-08-16 09:00Z', eta: '2026-08-16 20:20Z', status: 'ON_TIME', altitude: '39,000 FT', payload: '12.0 TONS', clearance: 'LEVEL-4' },
  { id: 'vec-6', flight: 'AL-888', route: 'SIN > AMS', departure: '2026-08-16 14:20Z', eta: '2026-08-17 02:00Z', status: 'DELAYED', altitude: '37,000 FT', payload: '25.4 TONS', clearance: 'LEVEL-5' }
];

export const INITIAL_OVERRIDES: OverrideRecord[] = [
  { id: 'ovr-1', user: 'JOHN SMITH', flight: 'AL-101', seat: '1A', status: 'CONFIRMED', sector: 'ALPHA-01', timestamp: '2026-07-28 10:12:04Z' },
  { id: 'ovr-2', user: 'SARAH CONNOR', flight: 'AL-101', seat: '1B', status: 'CONFIRMED', sector: 'ALPHA-01', timestamp: '2026-07-28 10:15:33Z' },
  { id: 'ovr-3', user: 'ELLEN RIPLEY', flight: 'AL-202', seat: '4C', status: 'PENDING', sector: 'BRAVO-09', timestamp: '2026-07-28 10:22:11Z' },
  { id: 'ovr-4', user: 'MARCUS VANCE', flight: 'AL-303', seat: '2A', status: 'CONFIRMED', sector: 'CHARLIE-04', timestamp: '2026-07-28 09:44:18Z' },
  { id: 'ovr-5', user: 'T-800 SECURITY', flight: 'AL-909', seat: '0A', status: 'OVERRIDDEN', sector: 'DIRECTOR-SEC', timestamp: '2026-07-28 08:30:00Z' },
  { id: 'ovr-6', user: 'KARA THRACE', flight: 'AL-772', seat: '3F', status: 'PENDING', sector: 'VIP-POD', timestamp: '2026-07-28 10:40:55Z' }
];

export const INITIAL_PERSONNEL: PersonnelRecord[] = [
  { id: 'p-1', name: 'COMMANDER A. VANCE', role: 'CHIEF TACTICAL OPERATOR', location: 'LHR-COMMAND', clearance: 'LEVEL 5 - TOP SECRET', status: 'ACTIVE' },
  { id: 'p-2', name: 'FLIGHT CAPT. H. SOLO', role: 'VECTOR NAVIGATOR', location: 'AL-909 COCKPIT', clearance: 'LEVEL 4 - ALPHA', status: 'ON_VECTOR' },
  { id: 'p-3', name: 'DR. L. STRAUSS', role: 'CORE SYNC ANALYST', location: 'JFK-COMMAND', clearance: 'LEVEL 5 - TOP SECRET', status: 'ACTIVE' },
  { id: 'p-4', name: 'OFFICER D. MILLER', role: 'PAYLOAD INSPECTOR', location: 'DXB TERMINAL 3', clearance: 'LEVEL 3 - CONFIDENTIAL', status: 'STANDBY' },
  { id: 'p-5', name: 'AGENT J. BOURNE', role: 'OVERRIDE PROTOCOL CHIEF', location: 'CDG HUB', clearance: 'LEVEL 5 - BLACK OPS', status: 'ACTIVE' }
];

export const INITIAL_PAYLOADS: PayloadRecord[] = [
  { id: 'pay-1', code: 'PLD-9941-X', weight: '4.2 TONS', destination: 'LHR-HUB', securityClass: 'CLASS-1 CRYPTO', status: 'VERIFIED' },
  { id: 'pay-2', code: 'PLD-8820-A', weight: '12.0 TONS', destination: 'LAX-DIRECT', securityClass: 'CLASS-3 HAZMAT', status: 'IN_TRANSIT' },
  { id: 'pay-3', code: 'PLD-7703-M', weight: '8.5 TONS', destination: 'CDG-PORT', securityClass: 'CLASS-2 HARDWARE', status: 'VERIFIED' },
  { id: 'pay-4', code: 'PLD-1102-Z', weight: '3.1 TONS', destination: 'SYD-BASE', securityClass: 'CLASS-5 MILITARY', status: 'HOLD' }
];

export const INITIAL_WAITLIST: WaitlistItem[] = [
  { id: 'wl-1', name: 'DR. SAMANTHA CARTER', priorityLevel: 1, requestedVector: 'AL-909 (JFK > LHR)', timeInQueue: '00:14:22' },
  { id: 'wl-2', name: 'COL. JACK O\'NEILL', priorityLevel: 1, requestedVector: 'AL-104 (HND > LAX)', timeInQueue: '00:32:05' },
  { id: 'wl-3', name: 'DIRECTOR NICK FURY', priorityLevel: 2, requestedVector: 'AL-772 (DXB > CDG)', timeInQueue: '01:05:40' },
  { id: 'wl-4', name: 'AMBASSADOR SPOCK', priorityLevel: 3, requestedVector: 'AL-303 (FRA > SYD)', timeInQueue: '02:11:18' }
];

export const SYSTEM_NODES: SystemNode[] = [
  { id: 'node-1', name: 'LHR-COMMAND-01', location: 'LONDON / UK', status: 'ONLINE', pingMs: 12, loadPct: 42 },
  { id: 'node-2', name: 'JFK-COMMAND-02', location: 'NEW YORK / USA', status: 'ONLINE', pingMs: 68, loadPct: 58 },
  { id: 'node-3', name: 'HND-COMMAND-03', location: 'TOKYO / JPN', status: 'ONLINE', pingMs: 142, loadPct: 35 },
  { id: 'node-4', name: 'CDG-COMMAND-04', location: 'PARIS / FRA', status: 'SYNCING', pingMs: 24, loadPct: 81 }
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: 'log-1', timestamp: '14:32:01.002Z', level: 'SYS_INFO', message: 'CORE_SYNC HANDSHAKE INITIALIZED ON PORT 3000', operator: 'SYSTEM' },
  { id: 'log-2', timestamp: '14:32:00.812Z', level: 'EXEC_CMD', message: 'OVERRIDE CONSOLE SESSION AUTHENTICATED FOR ADMIN_V1.0', operator: 'ADMIN_V1.0' },
  { id: 'log-3', timestamp: '14:31:45.190Z', level: 'SYS_INFO', message: 'AES-256-GCM HARDWARE ENCRYPTION CHANNEL ACTIVE', operator: 'SYSTEM' },
  { id: 'log-4', timestamp: '14:30:12.441Z', level: 'OVERRIDE_ALERT', message: 'PRIORITY_ACCESS_OVERRIDE ENGAGED FOR SECTOR ALPHA-01', operator: 'ADMIN_V1.0' }
];
