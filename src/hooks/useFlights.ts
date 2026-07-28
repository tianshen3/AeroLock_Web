import { useQuery } from '@tanstack/react-query';

export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'https://aerolock-server.onrender.com/api';
};

export const useFlights = () => {
  return useQuery<Flight[], Error>({
    queryKey: ['flights'],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const targetUrl = `${baseUrl}/flights`;

      console.log(`[SYS_NETWORK_OUTBOUND]: Requesting -> ${targetUrl}`);

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`[SYS_ERROR]: HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[SYS_NETWORK_PARSED]:', data);

      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.flights)) return data.flights;
      if (data && Array.isArray(data.results)) return data.results;

      return [];
    },
  });
};
