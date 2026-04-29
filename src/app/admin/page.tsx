import Link from "next/link";
import { CalendarDays, Phone, Mail, Ban, ListChecks, Type, ImageIcon } from "lucide-react";
import { db } from "@/lib/db";
import { formatTz } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oversikt" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const inSevenDays = addDays(now, 7);

  const [upcoming, todays, activeBlocks, totalBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        status: "CONFIRMED",
        startsAt: { gte: now, lte: inSevenDays },
      },
      orderBy: { startsAt: "asc" },
      take: 30,
    }),
    db.booking.count({
      where: {
        status: "CONFIRMED",
        startsAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
    }),
    db.block.findMany({
      where: { endsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
    db.booking.count({
      where: {
        status: "CONFIRMED",
        startsAt: { gte: now },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl">Oversikt</h1>
          <p className="text-[var(--color-muted)] mt-1">
            Velkommen tilbake.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="secondary">
            <Link href="/admin/content">
              <Type className="h-4 w-4" />
              Tekst
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/images">
              <ImageIcon className="h-4 w-4" />
              Bilder
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/blocks">
              <Ban className="h-4 w-4" />
              Blokker
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/bookings">
              <ListChecks className="h-4 w-4" />
              Alle bestillinger
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="I dag" value={todays} />
        <Stat label="Neste 7 dager" value={upcoming.length} />
        <Stat label="Totalt fremover" value={totalBookings} />
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--color-accent)]" />
            <h2 className="text-lg">Kommende bestillinger</h2>
          </div>
          {upcoming.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-muted)]">
              Ingen bestillinger de neste 7 dagene.
            </div>
          ) : (
            <ul>
              {upcoming.map((b) => (
                <li
                  key={b.id}
                  className="px-6 py-4 border-b border-[var(--color-border)] last:border-b-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-[var(--color-accent)] tabular-nums">
                        {formatTz(b.startsAt, "EEE d. MMM HH:mm")}
                      </span>
                      <span className="font-medium truncate">
                        {b.customerName}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-[var(--color-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {b.customerPhone}
                      </span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3" />
                        {b.customerEmail}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
            <Ban className="h-4 w-4 text-[var(--color-accent)]" />
            <h2 className="text-lg">Aktive blokker</h2>
          </div>
          {activeBlocks.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-muted)] text-sm">
              Ingen blokker aktive.
            </div>
          ) : (
            <ul>
              {activeBlocks.map((b) => (
                <li
                  key={b.id}
                  className="px-6 py-3 border-b border-[var(--color-border)] last:border-b-0 text-sm"
                >
                  <div className="font-medium">
                    {formatTz(b.startsAt, "EEE d. MMM")}
                  </div>
                  <div className="text-[var(--color-muted)] text-xs">
                    {formatTz(b.startsAt, "HH:mm")} –{" "}
                    {formatTz(b.endsAt, "HH:mm")}
                    {b.reason ? ` · ${b.reason}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {label}
      </div>
      <div className="mt-2 font-serif text-4xl text-[var(--color-accent)] tabular-nums">
        {value}
      </div>
    </div>
  );
}
