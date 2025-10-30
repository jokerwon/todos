import { NextResponse } from 'next/server';

import { authClientStore } from '@/lib/auth/client-store';
import { recordLogout } from '@/lib/observability/auth-metrics';

const SESSION_COOKIE = 'local-auth-session';

export async function POST() {
  const response = NextResponse.json(null, { status: 204 });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    expires: new Date(0),
    path: '/',
  });

  const session = authClientStore.getSession();
  if (session) {
    recordLogout(session.userId);
  }
  authClientStore.clearSession();

  return response;
}
