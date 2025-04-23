// frontend/client-portal/src/utils/storage.ts
import { User } from "../types/auth.types";

// Constants for storage keys
const ACCESS_TOKEN_KEY = "lifeplace_client_access_token";
const REFRESH_TOKEN_KEY = "lifeplace_client_refresh_token";
const USER_KEY = "lifeplace_client_user";

/**
 * Store access and refresh tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store user data in localStorage
 */
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (e) {
    console.error("Failed to parse user data from localStorage:", e);
    return null;
  }
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
