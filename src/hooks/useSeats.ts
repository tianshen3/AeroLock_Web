import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Seat {
  id: number;
  seatNumber: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price?: number;
}

export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'https://aerolock-server.onrender.com/api';
};

export function useSeats(flightId: string) {
  return useQuery<Seat[]>({
    queryKey: ['seats', flightId],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/flights/${flightId}/seats`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`[SYS] ERROR_FETCHING_SEATS for flight ${flightId}:`, res.statusText);
          throw new Error(`Failed to fetch seat map: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) return data as Seat[];
        if (data && Array.isArray(data.data)) return data.data as Seat[];
        if (data && Array.isArray(data.seats)) return data.seats as Seat[];
        return [] as Seat[];
      } catch (err) {
        console.error(`[SYS] NETWORK_ERROR fetching seats for flight ${flightId}:`, err);
        throw err;
      }
    },
    enabled: !!flightId,
  });
}

export function useLockSeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flightId, seatId }: { flightId: number | string; seatId: number }) => {
      const baseUrl = getApiBaseUrl();
      const accessToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            'OPERATOR_BEARER_TOKEN_99021'
          : 'OPERATOR_BEARER_TOKEN_99021';

      const res = await fetch(`${baseUrl}/bookings/locks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ flightId, seatId }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[SYS] LOCK_SEQUENCE_FAILURE:', errText);
        throw new Error(`Failed to lock seat: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      const flightIdStr = String(variables.flightId);
      queryClient.invalidateQueries({ queryKey: ['seats', flightIdStr] });
    },
  });
}
