import { describe, expect, it } from 'vitest';

import { createToken, hashPassword, verifyPassword } from '@/lib/auth/hash';

describe('hash utilities', () => {
  it('hashes and verifies password deterministically', async () => {
    const password = 'MySecurePassword!';
    const { hash, salt } = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(salt).toBeDefined();

    const matches = await verifyPassword(password, hash, salt);
    expect(matches).toBe(true);

    const mismatch = await verifyPassword('wrong', hash, salt);
    expect(mismatch).toBe(false);
  });

  it('creates random tokens', () => {
    const token1 = createToken();
    const token2 = createToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThanOrEqual(43); // base64url 32 bytes -> 43 chars
  });
});
