'use client';

import { ReactNode, useEffect } from 'react';

import { useSession } from '@/app/hooks/use-session';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const { hydrate, refresh } = useSession();

  useEffect(() => {
    hydrate();

    const interval = window.setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [hydrate, refresh]);

  return <>{children}</>;
}
