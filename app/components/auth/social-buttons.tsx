'use client';

const ssoEnabled = process.env.NEXT_PUBLIC_FEATURE_SSO_ENABLED !== 'false';

export function SocialButtons() {
  if (!ssoEnabled) return null;

  const providers = [
    { id: 'enterprise', label: '使用企业账号登录' },
    { id: 'github', label: '使用 GitHub 登录' },
  ];

  return (
    <div className="space-y-2" data-testid="sso-buttons">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => {
            window.location.assign(`/auth/sso/${provider.id}`);
          }}
          className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {provider.label}
        </button>
      ))}
    </div>
  );
}
