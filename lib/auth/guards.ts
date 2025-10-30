import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'local-auth-session';

export function extractSession(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const json = JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8')) as {
      token: string;
      expiresAt: string;
    };
    if (new Date(json.expiresAt) <= new Date()) return null;
    return json;
  } catch (error) {
    console.warn('Failed to extract session', error);
    return null;
  }
}

export function requireSession(request: NextRequest) {
  const session = extractSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}
