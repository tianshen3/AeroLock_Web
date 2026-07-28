import { useQuery } from '@tanstack/react-query';

export interface UserProfilePayload {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
  user?: {
    id?: string;
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
 * Fetches operator profile payload from backend endpoint
 */
const fetchUserProfile = async (): Promise<UserProfilePayload> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(PROFILE_ENDPOINT, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}: Failed to fetch profile data`);
  }

  return response.json();
};

/**
 * TanStack useQuery hook for fetching and caching operator profile data.
 * Caches in memory with 30 minute staleTime for future profile page usage.
 */
export const useUserProfile = () => {
  return useQuery<UserProfilePayload, Error>({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export default useUserProfile;
