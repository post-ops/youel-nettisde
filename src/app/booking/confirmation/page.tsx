import Link from "next/link";
import { CheckCircle2, CalendarDays, Clock, Phone, Scissors } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatTz } from "@/lib/datetime";
import { BUSINESS, findService } from "@/lib/config";
import { formatNok } from "@/lib/utils";

export const metadata = { title: "Bekreftelse" };

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const booking = id
    ? await db.booking.findUnique({ where: { id } })
    : null;
  const service = booking ? findService(booking.serviceId) : null;

  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-xl px-6">
          {booking && service ? (
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl mb-3">Vi sees!</h1>
              <p className="text-[var(--color-muted)] text-lg mb-10 text-pretty">
                Bestillingen din er bekreftet. Vi har sendt en bekreftelse til{" "}
                <span className="text-[var(--color-foreground)]">
                  {booking.customerEmail}
                </span>
                .
              </p>

              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-left">
                <Detail
                  icon={<Scissors className="h-5 w-5" />}
                  label="Tjeneste"
                  value={service.name}
                />
                <Detail
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Dag"
                  value={formatTz(booking.startsAt, "EEEE d. MMMM yyyy")}
                />
                <Detail
                  icon={<Clock className="h-5 w-5" />}
                  label="Tid"
                  value={`${formatTz(booking.startsAt, "HH:mm")} – ${formatTz(
                    booking.endsAt,
                    "HH:mm",
                  )}`}
                />
                <Detail label="Pris" value={formatNok(booking.servicePrice)} />
                <Detail
                  icon={<Phone className="h-5 w-5" />}
                  label="Trenger du å avbestille?"
                  value={`Ring oss på ${BUSINESS.phone}`}
                />
              </div>

              <Button asChild size="lg" className="mt-8">
                <Link href="/">Tilbake til forsiden</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl mb-3">Fant ikke bestillingen</h1>
              <p className="text-[var(--color-muted)] mb-6">
                Lenken kan være feil. Prøv å booke på nytt.
              </p>
              <Button asChild>
                <Link href="/booking">Bestill time</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-b-0 first:pt-0 last:pb-0">
      {icon ? (
        <span className="text-[var(--color-accent)] mt-0.5">{icon}</span>
      ) : (
        <span className="w-5" />
      )}
      <div className="flex-1">
        <div className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
          {label}
        </div>
        <div className="font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}
