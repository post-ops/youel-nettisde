/**
 * Liten end-to-end-røyktest for booking-flyten:
 * 1. Henter ledige slots for en gitt dato
 * 2. Inserterer en booking direkte i DB
 * 3. Henter slots igjen og bekrefter at slot er borte
 * 4. Sletter booking igjen
 */
import { PrismaClient } from "@prisma/client";

const HOST = process.env.HOST ?? "http://localhost:3000";
const TARGET = process.env.SMOKE_DATE ?? "2026-05-04"; // mandag

async function fetchSlots(date: string) {
  const r = await fetch(`${HOST}/api/slots?date=${date}`);
  if (!r.ok) throw new Error(`/api/slots feilet: ${r.status}`);
  return (await r.json()) as { slots: Array<{ startsAt: string; time: string; available: boolean }> };
}

async function main() {
  const db = new PrismaClient();

  console.log(`→ Henter slots for ${TARGET}`);
  const before = await fetchSlots(TARGET);
  const target = before.slots.find((s) => s.available);
  if (!target) throw new Error("Ingen ledige slots å teste mot");
  console.log(`✓ Fant ${before.slots.filter(s=>s.available).length} ledige slots, tester ${target.time}`);

  const booking = await db.booking.create({
    data: {
      customerName: "Smoke Test",
      customerPhone: "+4791234567",
      customerEmail: "smoke@test.local",
      serviceId: "voksen",
      servicePrice: 400,
      startsAt: new Date(target.startsAt),
      endsAt: new Date(new Date(target.startsAt).getTime() + 30 * 60_000),
    },
  });
  console.log(`✓ Booking opprettet: ${booking.id}`);

  const after = await fetchSlots(TARGET);
  const same = after.slots.find((s) => s.startsAt === target.startsAt);
  if (same?.available) {
    throw new Error(`✗ Slot ${target.time} er fortsatt ledig etter booking!`);
  }
  console.log(`✓ Slot ${target.time} er nå opptatt`);

  await db.booking.delete({ where: { id: booking.id } });
  console.log("✓ Ryddet opp testen");

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
