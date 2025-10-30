import { seedDefaultUsers, listSeedUsers } from '@/lib/auth/default-users';

async function main() {
  await seedDefaultUsers();
  // eslint-disable-next-line no-console
  console.table(listSeedUsers(), ['email', 'password']);
}

main();
