import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SUPER_ADMIN_EMAIL = 'super@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Super@123';
const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS)
  : 10;

async function main() {
  console.log('\n🌱  Seeding database...\n');

  // ── Super admin ────────────────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(
      `✓  Super admin already exists (${SUPER_ADMIN_EMAIL}) — skipping.`,
    );
  } else {
    const hashedPassword = await bcrypt.hash(
      SUPER_ADMIN_PASSWORD,
      BCRYPT_SALT_ROUNDS,
    );

    const superAdmin = await prisma.user.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isVerified: true,
        role: 'ADMIN',
      },
    });

    console.log(
      `✓  Super admin created  →  ${superAdmin.email}  (id: ${superAdmin.id})`,
    );
  }

  console.log('\n✅  Seeding complete.\n');
}

main()
  .catch((e) => {
    console.error('\n❌  Seed failed:\n', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
