import { NextResponse } from 'next/server';

import { authClientStore, type SessionRecord } from '@/lib/auth/client-store';

const SESSION_COOKIE = 'local-auth-session';

function parseCookie(value: string | undefined): SessionRecord | null {
  if (!value) return null;
  try {
    const json = JSON.parse(Buffer.from(value, 'base64').toString('utf-8')) as SessionRecord;
    return json;
  } catch (error) {
    console.warn('Failed to parse session cookie', error);
    return null;
  }
}

export async function POST(request: Request) {
  if (process.env.FEATURE_LOCAL_AUTH === 'false') {
    return NextResponse.json({ error: 'Local auth disabled' }, { status: 501 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const rawSession = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split('=')[1];

  const current = parseCookie(rawSession);
  if (!current) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const refreshed = authClientStore.issueSession(current.userId, current.remember ?? false);

  const response = NextResponse.json({
    token: refreshed.token,
    issuedAt: refreshed.issuedAt,
    expiresAt: refreshed.expiresAt,
    remember: refreshed.remember,
    user: { id: refreshed.userId, email: current.userId },
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: Buffer.from(JSON.stringify(refreshed)).toString('base64'),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(refreshed.expiresAt),
  });

  return response;
}
