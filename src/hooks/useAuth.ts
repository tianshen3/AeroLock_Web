import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  user?: UserProfile;
  message?: string;
  [key: string]: unknown;
}

const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:5001/api';
};

/**
 * TanStack Query useLogin mutation hook.
 * Sends email and password payload to POST /auth/login endpoint.
 */
export const useLogin = (
  options?: Omit<
    UseMutationOptions<LoginResponse, Error, LoginCredentials>,
    'mutationFn'
  >
) => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMsg = `[SYS_ERROR]: AUTHENTICATION_FAILED - CREDENTIALS_REJECTED`;
        try {
          const errData = await response.json();
          if (errData.message || errData.error) {
            errorMsg = `[SYS_ERROR]: ${(errData.message || errData.error).toUpperCase()}`;
          }
        } catch {
          // Fall back to standard error message
        }
        throw new Error(errorMsg);
      }

      const data: LoginResponse = await response.json();
      return data;
    },
    ...options,
  });
};

export default useLogin;
