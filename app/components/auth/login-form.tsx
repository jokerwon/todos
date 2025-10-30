'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useSession } from '@/app/hooks/use-session';
import { authClientStore, type SessionRecord } from '@/lib/auth/client-store';
import { recordRememberMe } from '@/lib/observability/auth-metrics';
import { RememberToggle } from './remember-toggle';

interface LoginFormProps {
  defaultEmail?: string;
}

export function LoginForm({ defaultEmail = '' }: LoginFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirectTo') ?? '/';
  const { hydrate, setRedirect } = useSession();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setRedirect(redirectTo);

    startTransition(async () => {
      const response = await fetch('/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? '登录失败，请稍后再试。');
        return;
      }

      const data = (await response.json()) as {
        token: string;
        issuedAt: string;
        expiresAt: string;
        user: { id: string; email: string };
      };

      const session: SessionRecord = {
        token: data.token,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        userId: data.user.id,
        remember,
      };

      authClientStore.setSession(session);
      hydrate();
      setRedirect(null);
      recordRememberMe(remember);
      router.replace(redirectTo);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {error ? (
        <div
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-testid="login-error"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <RememberToggle checked={remember} onChange={setRemember} />
        <span className="text-xs text-muted-foreground">
          如果是共享设备，请不要勾选
        </span>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
        disabled={pending}
      >
        {pending ? '登录中…' : '登录'}
      </button>
    </form>
  );
}
