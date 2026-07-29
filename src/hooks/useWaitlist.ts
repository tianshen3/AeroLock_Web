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

// Client localStorage persistence helpers for user waitlist entries
const STORAGE_KEY = 'aerolock_user_waitlists';

export const getStoredWaitlists = (): WaitlistEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addStoredWaitlist = (entry: WaitlistEntry) => {
  if (typeof window === 'undefined') return;
  const current = getStoredWaitlists();
  const exists = current.some((item) => String(item.id) === String(entry.id) || item.flightId === entry.flightId);
  if (!exists) {
    const updated = [entry, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};

export const removeStoredWaitlist = (id: string | number) => {
  if (typeof window === 'undefined') return;
  const current = getStoredWaitlists();
  const updated = current.filter((item) => String(item.id) !== String(id) && item.flightId !== Number(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/**
 * 1. useJoinWaitlist: Mutation targeting POST /waitlist with payload { flightId: number }
 */
export function useJoinWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ flightId }: { flightId: number }) => {
      const baseUrl = getApiBaseUrl();
      const targetUrl = `${baseUrl}/waitlist`;
      const authHeaders = getAuthHeaders();
      const payload = { flightId: Number(flightId) };

      console.log('[AEROLOCK_WAITLIST] OUTBOUND POST /waitlist:', {
        url: targetUrl,
        method: 'POST',
        headers: authHeaders,
        body: payload,
      });

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log('[AEROLOCK_WAITLIST] INBOUND RESPONSE:', {
        status: res.status,
        statusText: res.statusText,
        body: responseText,
      });

      if (!res.ok) {
        let errorMsg = `HTTP_${res.status}_${res.statusText}`;
        try {
          const parsed = JSON.parse(responseText);
          errorMsg = parsed.message || parsed.error || errorMsg;
        } catch {
          if (responseText) errorMsg = responseText;
        }
        throw new Error(errorMsg);
      }

      try {
        return JSON.parse(responseText);
      } catch {
        return { success: true, message: responseText };
      }
    },
    onSuccess: (data, variables) => {
      if (data) {
        const newEntry: WaitlistEntry = {
          id: data.id || `wl_${variables.flightId}_${Date.now()}`,
          userId: data.userId,
          flightId: Number(variables.flightId),
          flightNumber: `AL-${String(variables.flightId).padStart(3, '0')}`,
          sector: 'SFO → JFK',
          departure: '14:30 UTC',
          position: data.position || 1,
          total: 1,
          createdAt: new Date().toISOString(),
        };
        addStoredWaitlist(newEntry);
      }

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
      const targetUrl = `${baseUrl}/waitlist/${id}`;

      console.log('[AEROLOCK_WAITLIST] OUTBOUND DELETE /waitlist/:id:', targetUrl);

      const res = await fetch(targetUrl, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      removeStoredWaitlist(id);

      if (!res.ok) {
        const errorText = await res.text();
        console.warn('[AEROLOCK_WAITLIST] DELETE /waitlist FAILED:', res.status, errorText);
      }

      return res.status === 204 ? { success: true } : res.json().catch(() => ({ success: true }));
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
        flightNumber: b.flightNumber || `AL-${String(b.flightId || '001').padStart(3, '0')}`,
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
 * 7. useActiveWaitlist: Query targeting user's active waitlists synced with GET /waitlist/flights/:flightId
 */
export function useActiveWaitlist() {
  return useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      const stored = getStoredWaitlists();

      const updatedEntries: WaitlistEntry[] = [];
      for (const entry of stored) {
        try {
          const res = await fetch(`${baseUrl}/waitlist/flights/${entry.flightId}`, { headers });
          if (res.ok) {
            const list: QueueMember[] = await res.json();
            const total = Array.isArray(list) ? list.length : 1;
            const userIdx = Array.isArray(list)
              ? list.findIndex((m) => String(m.id || m.userId) === String(entry.id || entry.userId))
              : -1;
            const pos = userIdx !== -1 ? userIdx + 1 : entry.position || 1;

            updatedEntries.push({
              ...entry,
              position: pos,
              total: total > 0 ? total : 1,
            });
          } else {
            updatedEntries.push(entry);
          }
        } catch {
          updatedEntries.push(entry);
        }
      }

      return updatedEntries;
    },
    refetchInterval: 15000,
  });
}
