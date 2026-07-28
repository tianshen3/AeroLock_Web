/**
 * Utility functions for resolving user display names from API responses or local storage objects.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawUserPayload = any;

/**
 * Resolves the user's first name from any raw user/profile object payload.
 */
export const getResolvedFirstName = (raw: RawUserPayload): string | null => {
  if (!raw || typeof raw !== 'object') return null;

  const target = raw.data || raw.user || raw.profile || raw.operator || raw.result || raw;

  const directFirst =
    target.firstName ||
    target.first_name ||
    target.givenName ||
    raw.firstName ||
    raw.first_name ||
    raw.givenName;

  if (directFirst && typeof directFirst === 'string' && directFirst.trim()) {
    return directFirst.trim();
  }

  const directName =
    target.name ||
    target.fullName ||
    target.full_name ||
    target.displayName ||
    raw.name ||
    raw.fullName ||
    raw.full_name ||
    raw.displayName;

  if (directName && typeof directName === 'string' && directName.trim()) {
    return directName.trim().split(' ')[0];
  }

  const email = target.email || raw.email;
  if (email && typeof email === 'string' && email.trim()) {
    const prefix = email.split('@')[0];
    if (prefix) return prefix;
  }

  return null;
};

/**
 * Resolves the user's full display name from any raw user/profile object payload.
 */
export const getResolvedFullName = (raw: RawUserPayload): string | null => {
  if (!raw || typeof raw !== 'object') return null;

  const target = raw.data || raw.user || raw.profile || raw.operator || raw.result || raw;

  const firstName =
    target.firstName ||
    target.first_name ||
    target.givenName ||
    raw.firstName ||
    raw.first_name ||
    raw.givenName;

  const lastName =
    target.lastName ||
    target.last_name ||
    target.familyName ||
    raw.lastName ||
    raw.last_name ||
    raw.familyName;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  const directName =
    target.name ||
    target.fullName ||
    target.full_name ||
    target.displayName ||
    raw.name ||
    raw.fullName ||
    raw.full_name ||
    raw.displayName;

  if (directName && typeof directName === 'string' && directName.trim()) {
    return directName.trim();
  }

  if (firstName && typeof firstName === 'string' && firstName.trim()) {
    return firstName.trim();
  }

  const email = target.email || raw.email;
  if (email && typeof email === 'string' && email.trim()) {
    const prefix = email.split('@')[0];
    if (prefix) return prefix;
  }

  return null;
};

/**
 * Helper to check local storage for logged in user info.
 */
export const getStoredUserObject = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return null;
};
