import { http, HttpResponse } from 'msw';

interface LoginRequestBody {
  email: string;
  password: string;
  remember?: boolean;
}

const TEST_USER = {
  email: 'demo@example.com',
  password: 'password123',
};

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequestBody;

    if (body.email === TEST_USER.email && body.password === TEST_USER.password) {
      return HttpResponse.json({
        token: 'mock-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        user: {
          id: 'user-1',
          email: TEST_USER.email,
        },
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/auth/logout', () => HttpResponse.json(null, { status: 204 })),
  http.post('/api/auth/refresh', () =>
    HttpResponse.json({
      token: 'mock-token-refreshed',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      user: {
        id: 'user-1',
        email: TEST_USER.email,
      },
    }),
  ),
];
