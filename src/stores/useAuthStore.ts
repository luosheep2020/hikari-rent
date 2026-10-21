'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AuthUser,
  LoginResponse,
} from '@/types/auth';

type ProfilePatch = Partial<
  Pick<AuthUser, 'nickname' | 'email' | 'phone' | 'avatar'>
>;

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: string | null;

  hydrated: boolean;
  loginOpen: boolean;

  openLogin: () => void;
  closeLogin: () => void;

  login: (result: LoginResponse) => void;
  logout: () => Promise<void>;

  setUser: (user: AuthUser) => void;
  setHydrated: () => void;
  updateProfile: (patch: ProfilePatch) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expiresAt: null,

      hydrated: false,
      loginOpen: false,

      openLogin: () => {
        set({ loginOpen: true });
      },

      closeLogin: () => {
        set({ loginOpen: false });
      },

      login: (result) => {
        set({
          user: result.user,
          accessToken: result.accessToken,
          expiresAt: result.expiresAt,
          loginOpen: false,
        });
      },

      logout: async () => {
        const token = get().accessToken;

        if (token) {
          const { authApi } = await import('@/api/auth');

          try {
            await authApi.logout();
          } catch (error) {
            const { ApiError } = await import('@/api/client');

            // An expired or revoked session is already signed out.
            if (
              !(error instanceof ApiError)
              || error.status !== 401
            ) {
              throw error;
            }
          }
        }

        // Do not clear a newer login started during this request.
        if (get().accessToken === token) {
          get().clearSession();
        }
      },

      setUser: (user) => {
        set({ user });
      },

      setHydrated: () => {
        set({ hydrated: true });
      },

      // Update the UI cache after the profile API succeeds.
      updateProfile: (patch) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, ...patch }
            : null,
        }));
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          expiresAt: null,
        });
      },
    }),
    {
      name: 'hikari-auth-v1',

      storage: createJSONStorage(
        () => sessionStorage,
      ),

      skipHydration: true,

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
      }),
    },
  ),
);
