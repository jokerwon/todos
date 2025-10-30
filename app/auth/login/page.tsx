import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/app/components/auth/login-form';
import { SocialButtons } from '@/app/components/auth/social-buttons';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: '登录账户',
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">欢迎回来</h1>
        <p className="text-sm text-muted-foreground">
          使用邮箱和密码登录以继续管理您的任务。
        </p>
      </div>
      <LoginForm />
      <SocialButtons />
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-primary underline-offset-4 hover:underline"
        >
          忘记密码？
        </Link>
        <Link
          href="/auth/sso/enterprise"
          className="text-primary underline-offset-4 hover:underline"
        >
          使用企业账号登录
        </Link>
      </div>
    </main>
  );
}
