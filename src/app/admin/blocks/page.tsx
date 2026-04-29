import { db } from "@/lib/db";
import { formatTz } from "@/lib/datetime";
import { BlocksManager } from "@/components/admin/BlocksManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blokker" };

export default async function BlocksPage() {
  const now = new Date();
  const blocks = await db.block.findMany({
    where: { endsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
  });

  const rows = blocks.map((b) => ({
    id: b.id,
    when: formatTz(b.startsAt, "EEE d. MMM yyyy"),
    timeRange: `${formatTz(b.startsAt, "HH:mm")} – ${formatTz(b.endsAt, "HH:mm")}`,
    reason: b.reason,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl mb-2">Blokker</h1>
      <p className="text-[var(--color-muted)] mb-6">
        Marker dager eller tidsrom du ikke kan ta imot kunder.
      </p>
      <BlocksManager rows={rows} />
    </div>
  );
}
