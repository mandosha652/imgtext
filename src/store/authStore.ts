import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { shouldBypassAuth } from '@/config/env';

// Mock user for development
const DEV_USER: User = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  name: 'Dev User',
  tier: 'pro',
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
};

// Check if access_token cookie exists (matches client.ts cookie name)
const hasAccessTokenCookie = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some(c => c.startsWith('access_token='));
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: shouldBypassAuth ? DEV_USER : null,
      isAuthenticated: shouldBypassAuth,
      isLoading: !shouldBypassAuth,

      setUser: user =>
        set({
          user: shouldBypassAuth ? DEV_USER : user,
          isAuthenticated: shouldBypassAuth || !!user,
          isLoading: false,
        }),

      setLoading: isLoading =>
        set({ isLoading: shouldBypassAuth ? false : isLoading }),

      logout: () =>
        set({
          user: shouldBypassAuth ? DEV_USER : null,
          isAuthenticated: shouldBypassAuth,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        // After hydrating from localStorage, verify cookies still exist.
        // If tokens were cleared (logout, 401 redirect, backend wipe) but
        // localStorage wasn't cleaned up, reset to logged-out state.
        if (shouldBypassAuth || !state) return;
        if (state.isAuthenticated && !hasAccessTokenCookie()) {
          state.setUser(null);
        }
      },
    }
  )
);
