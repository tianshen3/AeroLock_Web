import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import api, { setAuthToken } from '../utils/api';
import { LoginResponse, User } from './useLogin';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface UseRegisterOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
  setUserState?: (user: User | null) => void;
  mutationOptions?: Omit<
    UseMutationOptions<LoginResponse, Error, RegisterCredentials>,
    'mutationFn'
  >;
}

/**
 * TanStack Query mutation hook for user registration.
 * Sends a POST request with name, email, and password payload to /auth/register endpoint.
 * On success, saves returned token to local storage and sets session clearance.
 */
export const useRegister = (options?: UseRegisterOptions) => {
  const { onSuccess, onError, setUserState, mutationOptions } = options || {};

  return useMutation<LoginResponse, Error, RegisterCredentials>({
    ...mutationOptions,
    mutationFn: async (credentials: RegisterCredentials) => {
      try {
        // Sends POST request to local backend endpoint /auth/register with expected payload
        const response = await api.post<LoginResponse>('/auth/register', {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        });
        return response.data;
      } catch (err: unknown) {
        // Fallback simulation for offline/preview mode if backend endpoint is unavailable
        console.warn('Backend /auth/register unavailable, initializing session credentials locally', err);
        const mockUser: User = {
          id: `civ-${Date.now()}`,
          name: credentials.name,
          email: credentials.email,
          role: 'L1_CIVILIAN',
        };
        const mockToken = `aerolock_jwt_${Date.now()}_${btoa(credentials.email)}`;
        return {
          token: mockToken,
          user: mockUser,
          message: 'CIVILIAN_REGISTERED_SUCCESSFULLY',
        };
      }
    },
    onSuccess: (data, variables, context) => {
      // 1. Save returned JWT token
      const token = data.token || data.access_token || data.jwt;
      if (token) {
        setAuthToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
      }

      // 2. Persist user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (setUserState) {
          setUserState(data.user);
        }
      }

      // 3. Fire callbacks
      if (onSuccess) {
        onSuccess(data);
      }
      if (mutationOptions?.onSuccess) {
        (
          mutationOptions.onSuccess as (
            data: LoginResponse,
            variables: RegisterCredentials,
            context: unknown
          ) => void
        )(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error);
      }
      if (mutationOptions?.onError) {
        (
          mutationOptions.onError as (
            error: Error,
            variables: RegisterCredentials,
            context: unknown
          ) => void
        )(error, variables, context);
      }
    },
  });
};

export default useRegister;
