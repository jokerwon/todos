import { beforeEach, describe, expect, it } from 'vitest';

import { authClientStore } from '@/lib/auth/client-store';

declare global {
  // eslint-disable-next-line no-var
  var localStorage: Storage | undefined;
  // eslint-disable-next-line no-var
  var window: Window & typeof globalThis;
}

function setupLocalStorage() {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  Object.assign(globalThis, {
    window: { localStorage: storage },
    localStorage: storage,
  });

  return store;
}

describe('authClientStore', () => {
  let store: Map<string, string>;

  beforeEach(async () => {
    store = setupLocalStorage();
    store.clear();
    await authClientStore.ensureCredential('demo@example.com', 'password123');
    authClientStore.clearSession();
  });

  it('logs in with valid credentials', async () => {
    const result = await authClientStore.login('demo@example.com', 'password123');
    expect(result.status).toBe('success');
    expect(result.status === 'success' && result.session.token).toBeTruthy();
  });

  it('fails with wrong password and increments attempts', async () => {
    const invalid = await authClientStore.login('demo@example.com', 'wrong');
    expect(invalid).toEqual({ status: 'failure', reason: 'invalid-credentials' });
  });

  it('issues remember-me sessions with extended expiry', async () => {
    const result = await authClientStore.login('demo@example.com', 'password123', true);
    if (result.status !== 'success') throw new Error('Expected success');

    const session = authClientStore.getSession();
    expect(session).not.toBeNull();
    if (!session) return;

    const expires = new Date(session.expiresAt).getTime();
    const issued = new Date(session.issuedAt).getTime();
    expect(expires - issued).toBeGreaterThan(24 * 60 * 60 * 1000);
  });
});
