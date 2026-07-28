import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export interface AdminStats {
  users: {
    total: number;
    customers: number;
    admins: number;
    active: number;
    inactive: number;
  };
  flights: {
    total: number;
  };
  bookings: {
    total: number;
    locked: number;
    confirmed: number;
    cancelled: number;
    expired: number;
  };
  waitlist: {
    total: number;
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  clvScore: number;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  createdAt: string;
}

export interface AdminFlight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

export interface AdminBooking {
  id: number;
  userId: number;
  flightId: number;
  seatId: number;
  status: 'LOCKED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  flight?: {
    id: number;
    flightNumber: string;
  };
  seat?: {
    id: number;
    seatNumber: string;
  };
}

const getAdminHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token =
    localStorage.getItem('adminToken') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch 4-panel system dashboard metrics (GET /admin/stats)
 */
export const useAdminStats = () => {
  return useQuery<AdminStats, Error>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get<AdminStats>('/admin/stats', {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
    refetchInterval: 10000,
  });
};

/**
 * Fetch all registered users (GET /users)
 */
export const useAdminUsers = () => {
  return useQuery<AdminUser[], Error>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>('/users', {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Fetch all flights (GET /flights)
 */
export const useAdminFlights = () => {
  return useQuery<AdminFlight[], Error>({
    queryKey: ['admin', 'flights'],
    queryFn: async () => {
      const response = await api.get<AdminFlight[]>('/flights', {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
  });
};

/**
 * Create a new flight schedule (POST /flights)
 */
export const useCreateFlight = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminFlight,
    Error,
    { flightNumber: string; origin: string; destination: string; departureTime: string; arrivalTime: string }
  >({
    mutationFn: async (flightData) => {
      const response = await api.post<AdminFlight>('/flights', flightData, {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flights'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
};

/**
 * Update existing flight schedule (PATCH /flights/:id)
 */
export const useUpdateFlight = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminFlight,
    Error,
    { id: number; data: Partial<{ flightNumber: string; origin: string; destination: string; departureTime: string; arrivalTime: string }> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<AdminFlight>(`/flights/${id}`, data, {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flights'] });
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
};

/**
 * Delete a flight schedule (DELETE /flights/:id)
 */
export const useDeleteFlight = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (flightId: number) => {
      const response = await api.delete<{ message: string }>(`/flights/${flightId}`, {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flights'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
};

/**
 * Fetch all system bookings for admin (GET /bookings/admin)
 */
export const useAdminBookings = (flightId?: number, status?: string) => {
  return useQuery<AdminBooking[], Error>({
    queryKey: ['admin', 'bookings', flightId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (flightId) params.append('flightId', String(flightId));
      if (status) params.append('status', status);

      const url = `/bookings/admin${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<AdminBooking[]>(url, {
        headers: getAdminHeaders(),
      });
      return response.data;
    },
    refetchInterval: 8000,
  });
};

/**
 * Admin Force-Cancel Booking (PATCH /bookings/admin/:id/cancel)
 */
export const useAdminCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { bookingId: number; userId: number; flightId: number; seatId: number; status: string },
    Error,
    number
  >({
    mutationFn: async (bookingId: number) => {
      const response = await api.patch<{ bookingId: number; userId: number; flightId: number; seatId: number; status: string }>(
        `/bookings/admin/${bookingId}/cancel`,
        {},
        { headers: getAdminHeaders() }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
