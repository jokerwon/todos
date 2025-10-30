'use client';

import { useCallback } from 'react';
import { create } from 'zustand';

import { authClientStore, type SessionRecord } from '@/lib/auth/client-store';

interface SessionState {
  session: SessionRecord | null;
  redirectTo: string | null;
  loading: boolean;
  setRedirect(path: string | null): void;
  hydrate(): void;
  refresh(): Promise<void>;
  clear(): void;
}

const isBrowser = () => typeof window !== 'undefined';

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  redirectTo: null,
  loading: true,
  setRedirect: (path) => set({ redirectTo: path }),
  hydrate: () => {
    if (!isBrowser()) return;
    const session = authClientStore.getSession();
    set({ session, loading: false });
  },
  refresh: async () => {
    if (!isBrowser()) return;
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!response.ok) {
        set({ session: null });
        return;
      }
      const data = (await response.json()) as {
        token: string;
        issuedAt: string;
        expiresAt: string;
        user: { id: string };
        remember?: boolean;
      };
      const session: SessionRecord = {
        token: data.token,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        userId: data.user.id,
        remember: data.remember ?? false,
      };
      authClientStore.setSession(session);
      set({ session });
    } catch (error) {
      console.warn('Failed to refresh session', error);
      set({ session: null });
    }
  },
  clear: () => {
    authClientStore.clearSession();
    set({ session: null, loading: false });
  },
}));

export function useSession() {
  const session = useSessionStore((state) => state.session);
  const loading = useSessionStore((state) => state.loading);
  const redirectTo = useSessionStore((state) => state.redirectTo);
  const hydrate = useSessionStore((state) => state.hydrate);
  const refresh = useSessionStore((state) => state.refresh);
  const clear = useSessionStore((state) => state.clear);
  const setRedirect = useSessionStore((state) => state.setRedirect);

  const isAuthenticated = !!session && new Date(session.expiresAt) > new Date();

  const requireAuth = useCallback(
    (path: string) => {
      if (!isAuthenticated && isBrowser()) {
        setRedirect(path);
        window.location.assign(`/auth/login?redirectTo=${encodeURIComponent(path)}`);
      }
    },
    [isAuthenticated, setRedirect],
  );

  return {
    session,
    loading,
    redirectTo,
    hydrate,
    refresh,
    clear,
    setRedirect,
    isAuthenticated,
    requireAuth,
  } as const;
}
