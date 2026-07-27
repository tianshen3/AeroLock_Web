import axios, { InternalAxiosRequestConfig } from 'axios';

//storage key used for storing the JWT token
export const TOKEN_STORAGE_KEY = 'auth_token';

//resolving the base url
const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getBaseUrl();

//retrival of stored jwt token from local storage or cookies
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) return token;

  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_STORAGE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};


//stores the jwt token in the local storage or cookies
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  document.cookie = `${TOKEN_STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
};

//clears the stored jwt token
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; max-age=0`;
};

//configured axios request for api
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

//request interceptor to attach the bearer token to it
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//response intercerptor for unauthorized response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeAuthToken();
    }
    return Promise.reject(error);
  }
);

export default api;