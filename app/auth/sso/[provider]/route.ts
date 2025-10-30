import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirectTo') ?? '/';
  const target = new URL(`https://sso.example.com/${params.provider}`);
  target.searchParams.set('redirect', redirect);
  return NextResponse.redirect(target);
}
