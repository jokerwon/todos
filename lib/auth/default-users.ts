import { authClientStore } from './client-store';

const DEFAULT_USERS = [
  { email: 'demo@example.com', password: 'password123' },
  { email: 'product@example.com', password: 'product123' },
  { email: 'admin@example.com', password: 'admin123' },
];

let seeded = false;

export async function seedDefaultUsers() {
  if (seeded || process.env.FEATURE_LOCAL_AUTH === 'false') return;
  seeded = true;
  await Promise.all(
    DEFAULT_USERS.map(({ email, password }) => authClientStore.ensureCredential(email, password)),
  );
}

export function listSeedUsers() {
  return DEFAULT_USERS.map(({ email, password }) => ({ email, password }));
}
