/**
 * Seed eller oppdater admin-bruker.
 * Kjør:  npm run seed:admin -- <email> <password>
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Bruk: npm run seed:admin -- <email> <password>");
    process.exit(1);
  }
  const db = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`✓ Admin klar: ${user.email}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
