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
}

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
        // Fallback for container runtime environment where Express API runs on port 3000
      }

      const fallbackResponse = await fetch('/api/flights');
      if (!fallbackResponse.ok) {
        throw new Error('[SYS_ERROR]: FAILED_TO_RETRIEVE_FLIGHT_MANIFEST');
      }
      return await fallbackResponse.json();
    },
  });
};
