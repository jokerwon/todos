import { createToken, getIssueTimestamps, hashPassword, verifyPassword } from './hash';
import { logAuthEvent } from './audit';

const CREDENTIALS_KEY = 'auth.credentials';
const SESSION_KEY = 'auth.session';
const AUDIT_KEY = 'auth.audit';

type AuditEvent = 'success' | 'failure' | 'lockout';

export interface CredentialRecord {
  email: string;
  passwordHash: string;
  salt: string;
  failedAttempts: number;
  lockedUntil?: string | null;
}

export interface SessionRecord {
  token: string;
  userId: string;
  issuedAt: string;
  expiresAt: string;
  remember: boolean;
}

interface AuditRecord {
  timestamp: string;
  event: AuditEvent;
  email: string;
  metadata?: Record<string, unknown>;
}

const inMemoryStorage = new Map<string, string>();

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(key: string): string | null {
  if (isBrowser()) {
    return window.localStorage.getItem(key);
  }
  return inMemoryStorage.get(key) ?? null;
}

function writeStorage(key: string, value: string) {
  if (isBrowser()) {
    window.localStorage.setItem(key, value);
  } else {
    inMemoryStorage.set(key, value);
  }
}

function deleteStorage(key: string) {
  if (isBrowser()) {
    window.localStorage.removeItem(key);
  } else {
    inMemoryStorage.delete(key);
  }
}

function readCredentials(): CredentialRecord[] {
  const raw = readStorage(CREDENTIALS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CredentialRecord[];
  } catch (error) {
    console.warn('Failed to parse credentials store', error);
    return [];
  }
}

function persistCredentials(credentials: CredentialRecord[]) {
  writeStorage(CREDENTIALS_KEY, JSON.stringify(credentials));
}

function readSession(): SessionRecord | null {
  const raw = readStorage(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionRecord;
  } catch (error) {
    console.warn('Failed to parse session store', error);
    return null;
  }
}

function persistSession(session: SessionRecord | null) {
  if (!session) {
    deleteStorage(SESSION_KEY);
    return;
  }
  writeStorage(SESSION_KEY, JSON.stringify(session));
}

function appendAudit(record: AuditRecord) {
  const raw = readStorage(AUDIT_KEY);
  const list: AuditRecord[] = raw ? JSON.parse(raw) : [];
  list.push(record);
  writeStorage(AUDIT_KEY, JSON.stringify(list.slice(-1000))); // keep last 1000
}

export type LoginStatus =
  | { status: 'success'; session: SessionRecord }
  | { status: 'failure'; reason: 'invalid-credentials' | 'locked'; retryAfter?: number };

export class AuthClientStore {
  async ensureCredential(email: string, password: string) {
    const records = readCredentials();
    const existing = records.find((record) => record.email === email);
    if (existing) return existing;

    const { hash, salt } = await hashPassword(password);
    const record: CredentialRecord = {
      email,
      passwordHash: hash,
      salt,
      failedAttempts: 0,
      lockedUntil: null,
    };
    records.push(record);
    persistCredentials(records);
    return record;
  }

  async login(email: string, password: string, remember = false): Promise<LoginStatus> {
    const records = readCredentials();
    const record = records.find((entry) => entry.email === email);

    if (!record) {
      appendAudit({ timestamp: new Date().toISOString(), event: 'failure', email });
      logAuthEvent('failure', email);
      return { status: 'failure', reason: 'invalid-credentials' };
    }

    if (record.lockedUntil && new Date(record.lockedUntil) > new Date()) {
      appendAudit({ timestamp: new Date().toISOString(), event: 'lockout', email });
      logAuthEvent('lockout', email, { lockedUntil: record.lockedUntil });
      const retryAfter = Math.ceil(
        (new Date(record.lockedUntil).getTime() - Date.now()) / 1000,
      );
      return { status: 'failure', reason: 'locked', retryAfter };
    }

    const valid = await verifyPassword(password, record.passwordHash, record.salt);

    if (!valid) {
      record.failedAttempts += 1;
      if (record.failedAttempts >= 5) {
        const lockMinutes = Math.min(60, record.failedAttempts * 2);
        record.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000).toISOString();
      }
      persistCredentials(records);
      appendAudit({ timestamp: new Date().toISOString(), event: 'failure', email });
      return { status: 'failure', reason: 'invalid-credentials' };
    }

    record.failedAttempts = 0;
    record.lockedUntil = null;
    persistCredentials(records);

    const session = this.issueSession(record.email, remember);
    appendAudit({ timestamp: new Date().toISOString(), event: 'success', email });
    logAuthEvent('success', email, { remember });
    return { status: 'success', session };
  }

  issueSession(userId: string, remember: boolean): SessionRecord {
    const { issuedAt, expiresAt } = getIssueTimestamps(remember ? 60 * 24 * 14 : 30);
    const session: SessionRecord = {
      token: createToken(),
      userId,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      remember,
    };
    persistSession(session);
    return session;
  }

  setSession(session: SessionRecord) {
    persistSession(session);
  }

  refreshSession(): SessionRecord | null {
    const current = readSession();
    if (!current) return null;

    const expiresAt = new Date(current.expiresAt);
    if (expiresAt <= new Date()) {
      this.clearSession();
      return null;
    }

    return this.issueSession(current.userId, current.remember);
  }

  getSession(): SessionRecord | null {
    const session = readSession();
    if (!session) return null;
    if (new Date(session.expiresAt) <= new Date()) {
      this.clearSession();
      return null;
    }
    return session;
  }

  clearSession() {
    const current = readSession();
    persistSession(null);
    logAuthEvent('logout', current?.userId ?? 'unknown');
  }
}

export const authClientStore = new AuthClientStore();
