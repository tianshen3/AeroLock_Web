import { useQuery } from '@tanstack/react-query';

export interface UserProfilePayload {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
  user?: {
    id?: string | number;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  [key: string]: unknown;
}

const PROFILE_ENDPOINT = 'https://aerolock-server.onrender.com/api/auth/profile';

/**
 * Helper to retrieve bearer auth token from localStorage safely
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token')
  );
};

/**
 * Fetches operator profile payload from backend endpoint with local storage fallback
 */
const fetchUserProfile = async (): Promise<UserProfilePayload> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== 'undefined' && data) {
        try {
          const existingStr = localStorage.getItem('user');
          const existing = existingStr ? JSON.parse(existingStr) : {};
          const updatedUser = {
            ...existing,
            ...data,
            name:
              data.name ||
              (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : existing.name),
            firstName: data.firstName || data.user?.firstName || existing.firstName,
            lastName: data.lastName || data.user?.lastName || existing.lastName,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('storage'));
        } catch {
          // ignore
        }
      }
      return data;
    }
  } catch (err) {
    console.warn('[useUserProfile]: Remote endpoint unreachable, falling back to local user storage.', err);
  }

  // Fallback if remote API is offline or returns non-200, but local user data exists
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        // ignore
      }
    }
  }

  throw new Error('UNAUTHENTICATED');
};

/**
 * TanStack useQuery hook for fetching and caching operator profile data.
 * Dynamic queryKey includes the token so login/logout instantly triggers a fresh fetch.
 */
export const useUserProfile = () => {
  const token = getAuthToken();

  return useQuery<UserProfilePayload, Error>({
    queryKey: ['userProfile', token || 'guest'],
    queryFn: fetchUserProfile,
    staleTime: token ? 1000 * 60 * 30 : 0, // 30 minutes if token exists, 0 for guest
    retry: 1,
  });
};

export default useUserProfile;
