import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { diaryApi } from "@/services/api";
import type { LoginCredentials } from "@/types";
import { AUTH_EXPIRED_EVENT, authTokens } from "@/services/authTokens";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: authTokens.getAccessToken(),
      refreshToken: authTokens.getRefreshToken(),
      isLoading: false,
      isBootstrapping: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await diaryApi.login(credentials);
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading: false,
          });
          authTokens.setTokens(tokens.accessToken, tokens.refreshToken);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Login failed";
          set({ error: message, isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        await diaryApi.logout(refreshToken);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
          isBootstrapping: false,
        });
        authTokens.clearTokens();
      },

      bootstrap: async () => {
        const state = useAuthStore.getState();
        const accessToken = state.accessToken ?? authTokens.getAccessToken();
        const refreshToken = state.refreshToken ?? authTokens.getRefreshToken();
        if (!accessToken && !refreshToken) return;
        if (accessToken && state.user) {
          diaryApi.setAccessToken(accessToken);
          set({
            accessToken,
            refreshToken,
            isBootstrapping: false,
          });
          return;
        }
        set({ isBootstrapping: true, error: null });
        try {
          if (accessToken) {
            diaryApi.setAccessToken(accessToken);
          }
          const user = await diaryApi.getCurrentUser();
          set({
            user,
            accessToken,
            refreshToken,
            isBootstrapping: false,
          });
        } catch {
          if (refreshToken) {
            try {
              const nextTokens = await diaryApi.refresh(refreshToken);
              diaryApi.setAccessToken(nextTokens.accessToken);
              if (state.user) {
                set({
                  user: state.user,
                  accessToken: nextTokens.accessToken,
                  refreshToken: nextTokens.refreshToken ?? refreshToken,
                  isBootstrapping: false,
                });
                authTokens.setTokens(nextTokens.accessToken, nextTokens.refreshToken ?? refreshToken);
                return;
              }
              const user = await diaryApi.getCurrentUser();
              set({
                user,
                accessToken: nextTokens.accessToken,
                refreshToken: nextTokens.refreshToken ?? refreshToken,
                isBootstrapping: false,
              });
              authTokens.setTokens(nextTokens.accessToken, nextTokens.refreshToken ?? refreshToken);
              return;
            } catch {
              // continue to clear state below
            }
          }
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isBootstrapping: false,
          });
          authTokens.clearTokens();
        }
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        authTokens.setTokens(accessToken, refreshToken);
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: "intellectum-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    }
  )
);

export function selectIsAuthenticated(state: AuthState): boolean {
  return Boolean((state.accessToken || authTokens.getAccessToken()) && state.user);
}

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_EXPIRED_EVENT, () => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isBootstrapping: false,
      error: null,
    });
    authTokens.clearTokens();
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  });
}
