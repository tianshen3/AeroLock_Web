import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import api, { setAuthToken } from '../utils/api';

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
  accessToken?: string;
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
      // Sends POST request to /auth/login (api base URL includes /api)
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },

    onSuccess: (data, variables, context) => {
      // 1. Save returned JWT token to local storage and cookie helper
      const token = data.token || data.access_token || data.jwt || data.accessToken;
      if (token) {
        setAuthToken(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
      }

      // 2. Save and update user state
      const userObj: User = data.user || {
        id: variables.email,
        email: variables.email,
        name: variables.email.split('@')[0],
      };

      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj));
        if (setUserState) {
          setUserState(userObj);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
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
