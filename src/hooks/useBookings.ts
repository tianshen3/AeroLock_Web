'use client';

import { useQuery } from '@tanstack/react-query';

// ─── Booking Type ────────────────────────────────────────────────────────────

export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export interface Booking {
  id: string;
  bookingId?: string;
  flightId?: string;
  flightCode?: string;
  passengerName?: string;
  origin?: string;
  destination?: string;
  seatId?: string;
  seat?: string;
  status: BookingStatus;
  price?: string;
  fare?: string;
  fareClass?: 'FIRST' | 'BUSINESS' | 'ECONOMY';
  departureTime?: string;
  vectorTimestamp?: string;
  pnr?: string;
  [key: string]: unknown;
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

  return (await response.json()) as T;
};

// ─── useBookings Hook ─────────────────────────────────────────────────────────

/**
 * TanStack useQuery hook that performs a GET request to
 * https://aerolock-server.onrender.com/api/bookings/me
 * with Authorization: Bearer <token> header.
 */
export const useBookings = () => {
  const token = getAccessToken();
  return useQuery<BookingsList, Error>({
    queryKey: ['bookings', 'me', token || 'guest'],
    queryFn: () => fetchAuthenticated<BookingsList>('/bookings/me'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export default useBookings;
