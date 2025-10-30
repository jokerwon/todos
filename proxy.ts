import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const LEGACY_PUBLIC_PATHS = ['/login', '/api/internal/reminder-dispatch'];
const LOCAL_PUBLIC_PREFIXES = ['/auth/login', '/auth/forgot-password', '/api/auth', '/auth/sso'];
const SESSION_COOKIE = 'local-auth-session';

export function proxy(request: NextRequest) {
  if (process.env.FEATURE_LOCAL_AUTH !== 'false') {
    return handleLocalAuth(request);
  }

  return handleLegacyAuth(request);
}

function handleLocalAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || isPublicPath(pathname, LOCAL_PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = parseSessionCookie(sessionCookie);

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(loginUrl);
}

function handleLegacyAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname, LEGACY_PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ??
    request.cookies.get('__Secure-next-auth.session-token')?.value ??
    request.headers.get('authorization');

  if (!sessionToken) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function isPublicPath(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function parseSessionCookie(value: string | undefined) {
  if (!value) return null;
  try {
    const decoded = decodeBase64(value);
    const session = JSON.parse(decoded) as {
      token: string;
      expiresAt: string;
    };
    if (!session.token || !session.expiresAt) return null;
    if (new Date(session.expiresAt) <= new Date()) return null;
    return session;
  } catch (error) {
    console.warn('Failed to parse auth session cookie', error);
    return null;
  }
}

function decodeBase64(value: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64').toString('utf-8');
  }
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(value);
  }
  throw new Error('Base64 decoding not supported in this environment');
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
