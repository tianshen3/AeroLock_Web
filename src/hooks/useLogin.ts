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
  accessToken?: string;
  expiresIn: number;
}

export interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
  mutationOptions?: Omit<UseMutationOptions<LoginResponse, Error, LoginCredentials>, 'mutationFn'>;
}

//TanStack Query mutation hook for user authentication.
// Sends a POST request with email and password to /api/auth/login.
// On success, saves the returned JWT token to local storage.

export const useLogin = (options?: UseLoginOptions) => {
  const { onSuccess, onError, mutationOptions } = options || {};

  return useMutation<LoginResponse, Error, LoginCredentials>({
    ...mutationOptions,
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      
      // Safely grab the exact property NestJS sends
      const token = data.accessToken;
      
      if (token) {
        setAuthToken(token);
        localStorage.setItem('auth_token', token);
        // Storing as just 'token' as well, in case other parts of your app look for it
        localStorage.setItem('token', token); 
      }

      // Trigger callback options if passed
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