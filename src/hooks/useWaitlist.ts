'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Booking {
  id: number;
  bookingId?: number;
  userId?: string | number;
  flightId?: number;
  flightNumber?: string;
  status: 'LOCKED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
}

export interface WaitlistEntry {
  id: string | number;
  userId?: string | number;
  flightId: number;
  flightNumber?: string;
  sector?: string;
  departure?: string;
  position?: number;
  total?: number;
  createdAt?: string;
}

export interface QueueMember {
  id?: string | number;
  userId: string | number;
  clvScore?: number;
  position?: number;
  joinedAt?: string;
}

const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'https://aerolock-server.onrender.com/api';
};

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token')
  );
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * 1. useJoinWaitlist: Mutation targeting POST /waitlist with payload { flightId: number }
 */
export function useJoinWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ flightId }: { flightId: number }) => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/waitlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ flightId: Number(flightId) }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to join waitlist: ${errorText || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlistQueue', variables.flightId] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
}

/**
 * 2. useLeaveWaitlist: Mutation targeting DELETE /waitlist/:id
 */
export function useLeaveWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/waitlist/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to leave waitlist: ${errorText || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
}

/**
 * 3. useWaitlistQueue: Query targeting GET /waitlist/flights/:flightId
 * refetchInterval: 15000 (15s polling)
 */
export function useWaitlistQueue(flightId: number, currentUserId?: string | number) {
  const query = useQuery<QueueMember[]>({
    queryKey: ['waitlistQueue', flightId],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/waitlist/flights/${flightId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch waitlist queue');
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    enabled: !!flightId,
    refetchInterval: 15000,
  });

  const queueList = query.data || [];
  const userIndex = currentUserId
    ? queueList.findIndex((item) => String(item.userId) === String(currentUserId))
    : -1;
  const position = userIndex !== -1 ? userIndex + 1 : null;
  const total = queueList.length;

  return {
    ...query,
    queueList,
    position,
    total,
  };
}

/**
 * 4. useUserBookings: Query targeting GET /bookings/me
 * refetchInterval: 15000 (15s polling)
 * Filters result to detect any booking with status === 'LOCKED'
 */
export function useUserBookings() {
  const query = useQuery<Booking[]>({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/bookings/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch user bookings');
      const data = await res.json();
      const bookings: Booking[] = Array.isArray(data)
        ? data
        : data.data || data.bookings || [];
      return bookings.map((b) => ({
        ...b,
        id: b.id || b.bookingId || 0,
        flightNumber: b.flightNumber || `AL-${b.flightId || '001'}`,
        createdAt: b.createdAt || new Date().toISOString(),
      }));
    },
    refetchInterval: 15000,
  });

  const lockedBooking = query.data?.find((b) => b.status === 'LOCKED') || null;

  return {
    ...query,
    lockedBooking,
  };
}

/**
 * 5. useConfirmSeat: Mutation targeting POST /bookings/confirm with payload { bookingId: number }
 */
export function useConfirmSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: number }) => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/bookings/confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId: Number(bookingId) }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to confirm seat: ${errorText || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * 6. useDeclineSeat: Mutation targeting POST /bookings/cancel with payload { bookingId: number }
 */
export function useDeclineSeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: number }) => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/bookings/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId: Number(bookingId) }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to decline seat: ${errorText || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * 7. useActiveWaitlist: Query targeting user's active waitlist entries
 */
export function useActiveWaitlist() {
  return useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/waitlist/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        // Fallback to /waitlist if /waitlist/me is 404
        const fallbackRes = await fetch(`${baseUrl}/waitlist`, {
          headers: getAuthHeaders(),
        });
        if (!fallbackRes.ok) throw new Error('Failed to fetch user active waitlists');
        const fallbackData = await fallbackRes.json();
        return Array.isArray(fallbackData) ? fallbackData : fallbackData.data || [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    refetchInterval: 15000,
  });
}
