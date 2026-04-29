// Kjøres før `next build` på Vercel.
// - Skipper prisma db push hvis DATABASE_URL mangler (med tydelig advarsel).
// - Kjører prisma db push hvis DATABASE_URL er satt.
// Lokalt brukes "npm run db:push" manuelt.
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn(
    "\n⚠ DATABASE_URL er ikke satt — hopper over `prisma db push`.",
  );
  console.warn(
    "  Appen vil bygge, men kjøretid feiler til en Postgres-DB er koblet til.",
  );
  console.warn(
    "  På Vercel: Storage → Create Database → Neon (Postgres) → Redeploy.\n",
  );
  process.exit(0);
}

console.log("→ Synker Prisma-skjemaet til Postgres…");
try {
  execSync("npx prisma db push --accept-data-loss --skip-generate", {
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  console.error("\n✗ `prisma db push` feilet.");
  console.error(
    "  Sjekk at DATABASE_URL peker på en levende Postgres-instans og at",
  );
  console.error(
    "  brukeren har CREATE-rettigheter. Vercel Postgres setter dette korrekt.",
  );
  console.error(err?.message ?? err);
  process.exit(1);
}
