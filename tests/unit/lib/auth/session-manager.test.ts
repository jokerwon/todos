import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession, useSessionStore } from '@/app/hooks/use-session';

declare global {
  // eslint-disable-next-line no-var
  var window: Window & typeof globalThis;
}

describe('useSession hook', () => {
  beforeEach(() => {
    useSessionStore.setState({ session: null, redirectTo: null, loading: false });
    Object.assign(globalThis, {
      window: {
        location: {
          assign: vi.fn(),
        },
      },
    });
  });

  it('stores redirect path when requireAuth invoked without session', () => {
    const session = useSession();
    session.requireAuth('/tasks');
    expect(useSessionStore.getState().redirectTo).toBe('/tasks');
    expect((window.location.assign as unknown as vi.Mock).mock.calls[0][0]).toContain(
      'redirectTo=%2Ftasks',
    );
  });

  it('clears redirect after login success', () => {
    const session = useSession();
    session.setRedirect('/tasks');
    session.setRedirect(null);
    expect(useSessionStore.getState().redirectTo).toBeNull();
  });
});
