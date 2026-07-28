'use client';

import { useQuery } from '@tanstack/react-query';

// ─── Booking Status (matches backend enum exactly) ────────────────────────────

export type BookingStatus = 'LOCKED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

// ─── Booking shape as returned by the API (flat — no nested relations) ────────
// Confirmed by: GET /api/bookings/confirm response shape:
// { bookingId, userId, flightId, seatId, status }

export interface Booking {
  // The server's primary key field is `bookingId`, not `id`
  bookingId: number;
  userId?: number;
  flightId: number;
  seatId: number;
  status: BookingStatus;
  // Fields that may exist if server populates them in the list endpoint
  id?: number | string;
  passengerName?: string;
  pnr?: string;
  flightCode?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  seatNumber?: string;
  seat?: {
    seatNumber?: string;
    price?: number;
  };
  price?: string | number;
  fare?: string | number;
  [key: string]: any;
}

export type BookingsList = Booking[];

// ─── Base URL ─────────────────────────────────────────────────────────────────

const BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'https://aerolock-server.onrender.com/api';

// ─── Auth Token Retrieval ─────────────────────────────────────────────────────

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token')
  );
};

// ─── Authenticated Fetch ──────────────────────────────────────────────────────

const fetchAuthenticated = async <T>(endpoint: string): Promise<T> => {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    throw new Error('401 Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP_ERROR_${response.status}`;
    try {
      const json = JSON.parse(errorText);
      errorMessage = json.message || errorMessage;
    } catch {
      // Use status message if JSON parse fails
    }
    throw new Error(errorMessage);
  }

  const raw = await response.json();
  // Log raw shape to console so we can inspect field names in DevTools
  console.log('[AEROLOCK_BOOKINGS] RAW_API_RESPONSE:', JSON.stringify(raw));
  return raw as T;
};

// ─── Envelope unwrapper ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrapBookings = (raw: any): BookingsList => {
  if (Array.isArray(raw)) return raw as BookingsList;
  if (raw && Array.isArray(raw.data)) return raw.data as BookingsList;
  if (raw && Array.isArray(raw.bookings)) return raw.bookings as BookingsList;
  if (raw && Array.isArray(raw.results)) return raw.results as BookingsList;
  return [];
};

// ─── useBookings Hook ──────────────────────────────────────────────────────────────────

/**
 * TanStack useQuery hook that performs a GET request to
 * https://aerolock-server.onrender.com/api/bookings/me
 * with Authorization: Bearer <token> header.
 */
export const useBookings = () => {
  const token = getAccessToken();
  return useQuery<BookingsList, Error>({
    queryKey: ['bookings', 'me', token || 'guest'],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await fetchAuthenticated<any>('/bookings/me');
      return unwrapBookings(raw);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export default useBookings;
