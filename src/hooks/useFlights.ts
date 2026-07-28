import { useQuery } from '@tanstack/react-query';

export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status?: string;
  craft?: string;
  load?: string;
  gate?: string;
  airline?: string;
  aircraft?: string;
  seatCapacity?: number;
  seatsFilled?: number;
}

const MOCK_FLIGHTS: Flight[] = [
  {
    id: 882,
    flightNumber: 'AL-882',
    origin: 'LHR_T7',
    destination: 'HND_CN',
    departureTime: new Date(Date.now() + 1800000).toISOString(),
    arrivalTime: new Date(Date.now() + 25200000).toISOString(),
    status: 'IN_FLIGHT',
    craft: 'STEALTH_INTERCEPTOR',
    load: '84%',
    gate: 'GATE_04',
    airline: 'AEROLOCK_TACTICAL',
  },
  {
    id: 104,
    flightNumber: 'AL-104',
    origin: 'JFK_SB',
    destination: 'GVA_H2',
    departureTime: new Date(Date.now() + 7200000).toISOString(),
    arrivalTime: new Date(Date.now() + 23400000).toISOString(),
    status: 'SCHEDULED',
    craft: 'ARMORED_TRANSPORTER',
    load: '67%',
    gate: 'GATE_12',
    airline: 'AEROLOCK_GLOBAL',
  },
  {
    id: 909,
    flightNumber: 'AL-909',
    origin: 'SIN_AT',
    destination: 'SYD_DP',
    departureTime: new Date(Date.now() + 3600000).toISOString(),
    arrivalTime: new Date(Date.now() + 17100000).toISOString(),
    status: 'BOARDING',
    craft: 'VIP_VECTOR',
    load: '92%',
    gate: 'GATE_01',
    airline: 'AEROLOCK_EXECUTIVE',
  },
  {
    id: 331,
    flightNumber: 'AL-331',
    origin: 'KEF_SZ',
    destination: 'ZRH_VA',
    departureTime: new Date(Date.now() + 14400000).toISOString(),
    arrivalTime: new Date(Date.now() + 27900000).toISOString(),
    status: 'SCHEDULED',
    craft: 'GHOST_RECON',
    load: '50%',
    gate: 'GATE_09',
    airline: 'AEROLOCK_RECON',
  },
  {
    id: 702,
    flightNumber: 'AL-702',
    origin: 'DXB_SC',
    destination: 'FRA_TL',
    departureTime: new Date(Date.now() + 21600000).toISOString(),
    arrivalTime: new Date(Date.now() + 34200000).toISOString(),
    status: 'SCHEDULED',
    craft: 'HEAVY_CARGO',
    load: '78%',
    gate: 'GATE_07',
    airline: 'AEROLOCK_CARGO',
  },
];

export const useFlights = () => {
  return useQuery<Flight[], Error>({
    queryKey: ['flights'],
    queryFn: async () => {
      const primaryUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/flights`;
      try {
        const response = await fetch(primaryUrl);
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Express backend offline
      }

      try {
        const fallbackResponse = await fetch('/api/flights');
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch {
        // Next.js API route offline
      }

      // Return mock flights fallback when backend server is offline
      return MOCK_FLIGHTS;
    },
  });
};
