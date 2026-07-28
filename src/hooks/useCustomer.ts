import { useQuery } from '@tanstack/react-query';

// TypeScript Interfaces for API Responses
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Booking {
  bookingId: string;
  flightId: string;
  seatId: string;
  status: string;
}

export type Bookings = Booking[];

const BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'https://aerolock-server.onrender.com/api';

/**
 * Helper function to retrieve the JWT access token safely from localStorage
 */
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || localStorage.getItem('token');
};

/**
 * Authenticated HTTP GET request handler with Bearer token authentication header
 */
const fetchAuthenticated = async <T>(endpoint: string): Promise<T> => {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
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
        // use status message if JSON parse fails
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    // If backend is unaccessible or offline in local dev mode, handle 401 or throw error
    if (error instanceof Error && error.message.includes('401')) {
      throw error;
    }
    
    // Pass along error for TanStack Query handling
    throw error instanceof Error ? error : new Error('FETCH_FAILED');
  }
};

/**
 * TanStack useQuery hook that performs a GET request to https://aerolock-server.onrender.com/api/auth/profile
 */
export const useProfile = () => {
  const token = getAccessToken();
  return useQuery<Profile, Error>({
    queryKey: ['profile', token || 'guest'],
    queryFn: () => fetchAuthenticated<Profile>('/auth/profile'),
    staleTime: token ? 1000 * 60 * 30 : 0, // 30 min if authenticated, 0 for guest
    retry: 1,
  });
};

/**
 * TanStack useQuery hook that performs a GET request to http://localhost:5001/api/bookings/me
 */
export const useMyBookings = () => {
  return useQuery<Bookings, Error>({
    queryKey: ['myBookings'],
    queryFn: () => fetchAuthenticated<Bookings>('/bookings/me'),
  });
};

export default useProfile;
