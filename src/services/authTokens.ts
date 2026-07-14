import type { AuthTokens } from "@/types";

const STORAGE_KEY = "intellectum-auth-tokens";
export const AUTH_EXPIRED_EVENT = "intellectum-auth-expired";

type PersistedTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

let memoryTokens: PersistedTokens = { accessToken: null, refreshToken: null };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readPersistedTokens(): PersistedTokens {
  if (!canUseStorage()) return { accessToken: null, refreshToken: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as PersistedTokens;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function persistTokens(tokens: PersistedTokens): void {
  if (!canUseStorage()) return;
  try {
    if (!tokens.accessToken && !tokens.refreshToken) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Ignore storage errors.
  }
}

memoryTokens = readPersistedTokens();

export const authTokens = {
  getAccessToken(): string | null {
    return memoryTokens.accessToken;
  },

  getRefreshToken(): string | null {
    return memoryTokens.refreshToken;
  },

  setTokens(accessToken: string | null, refreshToken: string | null): void {
    memoryTokens = { accessToken, refreshToken };
    persistTokens(memoryTokens);
  },

  setFromAuthResponse(tokens: AuthTokens): void {
    this.setTokens(tokens.accessToken ?? null, tokens.refreshToken ?? null);
  },

  clearTokens(): void {
    memoryTokens = { accessToken: null, refreshToken: null };
    persistTokens(memoryTokens);
  },

  isAuthenticated(): boolean {
    return Boolean(memoryTokens.accessToken);
  },
};

export function emitAuthExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}
