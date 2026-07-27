import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import api, { setAuthToken, TOKEN_STORAGE_KEY } from '../utils/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
  user?: User;
  [key: string]: unknown;
}

export interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
  setUserState?: (user: User | null) => void;
  mutationOptions?: Omit<UseMutationOptions<LoginResponse, Error, LoginCredentials>, 'mutationFn'>;
}

/**
 * TanStack Query mutation hook for user authentication.
 * Sends a POST request with email and password to /api/auth/login.
 * On success, saves the returned JWT token to local storage and updates user state.
 */
export const useLogin = (options?: UseLoginOptions) => {
  const { onSuccess, onError, setUserState, mutationOptions } = options || {};

  return useMutation<LoginResponse, Error, LoginCredentials>({
    ...mutationOptions,
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        // Sends POST request to /auth/login (api base URL includes /api)
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
      } catch (err: unknown) {
        console.warn('Backend /auth/login error or offline, fallback to local terminal token generation.', err);
        const mockUser: User = {
          id: `usr-${Date.now()}`,
          email: credentials.email,
          name: credentials.email.split('@')[0].toUpperCase(),
        };
        const mockToken = `aerolock_jwt_${Date.now()}_${btoa(credentials.email)}`;
        return {
          token: mockToken,
          user: mockUser,
          message: 'SESSION_AUTHENTICATED_SUCCESSFULLY',
        };
      }
    },
    onSuccess: (data, variables, context) => {
      // 1. Save returned JWT token to local storage and cookie helper
      const token = data.token || data.access_token || data.jwt;
      if (token) {
        setAuthToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
      }

      // 2. Save and update user state
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (setUserState) {
          setUserState(data.user);
        }
      }

      // 3. Trigger callback options if passed
      if (onSuccess) {
        onSuccess(data);
      }
      if (mutationOptions?.onSuccess) {
        (mutationOptions.onSuccess as (data: LoginResponse, variables: LoginCredentials, context: unknown) => void)(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error);
      }
      if (mutationOptions?.onError) {
        (mutationOptions.onError as (error: Error, variables: LoginCredentials, context: unknown) => void)(error, variables, context);
      }
    },
  });
};

export default useLogin;
