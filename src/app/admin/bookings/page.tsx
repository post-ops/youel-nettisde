import { db } from "@/lib/db";
import { formatTz } from "@/lib/datetime";
import { findService } from "@/lib/config";
import { BookingsTable } from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bestillinger" };

export default async function BookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { startsAt: "desc" },
    take: 200,
  });

  const rows = bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    customerEmail: b.customerEmail,
    service: `${findService(b.serviceId).name} · ${b.servicePrice} kr`,
    when: formatTz(b.startsAt, "EEE d. MMM yyyy · HH:mm"),
    startsAt: b.startsAt.toISOString(),
    status: b.status,
    notes: b.notes,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl mb-2">Bestillinger</h1>
      <p className="text-[var(--color-muted)] mb-6">
        Alle innkomne bestillinger — avbestill om nødvendig.
      </p>
      <BookingsTable rows={rows} />
    </div>
  );
}
