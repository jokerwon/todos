import { beforeEach, describe, expect, it } from 'vitest';

import { authClientStore } from '@/lib/auth/client-store';

declare global {
  // eslint-disable-next-line no-var
  var localStorage: Storage | undefined;
  // eslint-disable-next-line no-var
  var window: Window & typeof globalThis;
}

function mockLocalStorage() {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };

  Object.assign(globalThis, {
    window: { localStorage: storage },
    localStorage: storage,
  });

  return map;
}

describe('login flow (integration)', () => {
  beforeEach(async () => {
    const map = mockLocalStorage();
    map.clear();
    await authClientStore.ensureCredential('demo@example.com', 'password123');
    authClientStore.clearSession();
  });

  it('issues short-lived sessions when remember me disabled', async () => {
    const result = await authClientStore.login('demo@example.com', 'password123', false);
    if (result.status !== 'success') throw new Error('Expected success');

    const session = result.session;
    const delta = new Date(session.expiresAt).getTime() - new Date(session.issuedAt).getTime();
    expect(delta).toBeLessThanOrEqual(45 * 60 * 1000); // <= 45 minutes buffer
  });

  it('issues long-lived sessions when remember me enabled', async () => {
    const result = await authClientStore.login('demo@example.com', 'password123', true);
    if (result.status !== 'success') throw new Error('Expected success');
    const session = result.session;
    const delta = new Date(session.expiresAt).getTime() - new Date(session.issuedAt).getTime();
    expect(delta).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000);
  });

  it('refreshes existing session before expiry', () => {
    const login = authClientStore.login('demo@example.com', 'password123', true);
    return login.then((result) => {
      if (result.status !== 'success') throw new Error('Expected success');
      const refreshed = authClientStore.refreshSession();
      expect(refreshed).not.toBeNull();
      if (!refreshed) return;
      expect(refreshed.token).not.toEqual(result.session.token);
    });
  });
});
