type LoginResult = 'success' | 'invalid' | 'locked';

function logMetric(event: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info(`[metrics:${event}]`, payload);
  }
}

export function recordLoginAttempt(email: string) {
  logMetric('login-attempt', { email, timestamp: new Date().toISOString() });
}

export function recordLoginResult(email: string, result: LoginResult) {
  logMetric('login-result', { email, result, timestamp: new Date().toISOString() });
}

export function recordRememberMe(enabled: boolean) {
  logMetric('remember-me', { enabled, timestamp: new Date().toISOString() });
}

export function recordLogout(email: string) {
  logMetric('logout', { email, timestamp: new Date().toISOString() });
}
