type AuditEvent = 'success' | 'failure' | 'lockout' | 'logout';

export function logAuthEvent(event: AuditEvent, email: string, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[auth:audit]', { event, email, metadata, timestamp: new Date().toISOString() });
  }
}
