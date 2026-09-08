import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to PostgreSQL...");
  const [{ count }] = (await prisma.$queryRawUnsafe('SELECT count(*)::int as count FROM "User"')) as any[];
  console.log(`Connected successfully! Users in DB: ${count}`);

  console.log("Creating PasswordReset table if not exists...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PasswordReset" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
    );
  `);

  console.log("Creating indices...");
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PasswordReset_userId_idx" ON "PasswordReset"("userId");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PasswordReset_tokenHash_idx" ON "PasswordReset"("tokenHash");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
  `);

  console.log("Adding foreign key constraint...");
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PasswordReset_userId_fkey'
      ) THEN
        ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log("Verifying PasswordReset table in Prisma client...");
  const resetCount = await prisma.passwordReset.count();
  console.log(`PasswordReset records in table: ${resetCount}`);
  console.log("✅ Database schema is fully synced and operational!");
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
