import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authClientStore } from '@/lib/auth/client-store';
import { recordLoginAttempt, recordLoginResult } from '@/lib/observability/auth-metrics';
import { seedDefaultUsers } from '@/lib/auth/default-users';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});

const SESSION_COOKIE = 'local-auth-session';

// Seed demo user for local testing if running in development/feature flag
void seedDefaultUsers();

export async function POST(request: Request) {
  if (process.env.FEATURE_LOCAL_AUTH === 'false') {
    return NextResponse.json({ error: 'Local auth disabled' }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { email, password, remember = false } = parsed.data;
  recordLoginAttempt(email);
  const result = await authClientStore.login(email, password, remember);

  if (result.status !== 'success') {
    recordLoginResult(email, result.reason === 'locked' ? 'locked' : 'invalid');
    const status = result.reason === 'locked' ? 423 : 401;
    return NextResponse.json({ error: result.reason, retryAfter: result.retryAfter }, { status });
  }

  const session = result.session;
  recordLoginResult(email, 'success');
  const response = NextResponse.json({
    token: session.token,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
    remember,
    user: {
      id: session.userId,
      email,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: Buffer.from(
      JSON.stringify({
        token: session.token,
        expiresAt: session.expiresAt,
        remember,
        issuedAt: session.issuedAt,
      }),
    ).toString('base64'),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(session.expiresAt),
  });

  return response;
}
