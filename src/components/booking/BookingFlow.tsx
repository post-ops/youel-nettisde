"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { nb } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  Check,
  Scissors,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OPENING_HOURS,
  DAY_KEYS,
  SERVICES,
  type Service,
} from "@/lib/config";
import { cn, formatNok } from "@/lib/utils";
import { createBooking } from "@/server/actions/createBooking";

type Slot = { startsAt: string; time: string; available: boolean };

type Step = "service" | "date" | "time" | "contact";

function ymd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function BookingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const sixtyDaysOut = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 60);
    return d;
  }, [today]);

  const isClosedDay = (d: Date) => {
    const key = DAY_KEYS[d.getDay()];
    return OPENING_HOURS[key] === null;
  };

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlots(null);
    setSelectedSlot(null);
    fetch(`/api/slots?date=${ymd(date)}`)
      .then((r) => r.json())
      .then((data: { slots: Slot[] }) => {
        if (cancelled) return;
        setSlots(data.slots);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Kunne ikke hente ledige tider. Prøv igjen.");
      })
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [date]);

  function pickService(s: Service) {
    setService(s);
    setStep("date");
  }

  function pickDate(d: Date | undefined) {
    if (!d) return;
    setDate(d);
    setStep("time");
  }

  function pickSlot(s: Slot) {
    setSelectedSlot(s);
    setStep("contact");
  }

  function goBack() {
    if (step === "contact") setStep("time");
    else if (step === "time") setStep("date");
    else if (step === "date") setStep("service");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !service) return;
    startTransition(async () => {
      const res = await createBooking({
        ...form,
        serviceId: service.id,
        startsAt: selectedSlot.startsAt,
      });
      if (!res.ok) {
        toast.error(res.error);
        if (res.error.includes("ledig")) {
          setStep("time");
          setSelectedSlot(null);
          if (date) {
            const data = await fetch(`/api/slots?date=${ymd(date)}`).then(
              (r) => r.json(),
            );
            setSlots(data.slots);
          }
        }
        return;
      }
      router.push(`/booking/confirmation?id=${res.bookingId}`);
    });
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <Stepper step={step} />

      <div className="p-6 md:p-10">
        <AnimatePresence mode="wait">
          {step === "service" ? (
            <motion.div
              key="service"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl mb-6 flex items-center gap-3">
                <Scissors className="h-5 w-5 text-[var(--color-accent)]" />
                Velg tjeneste
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickService(s)}
                    className={cn(
                      "text-left rounded-[var(--radius-md)] border bg-[var(--color-surface-2)] p-5 transition-all",
                      service?.id === s.id
                        ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30"
                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-serif text-xl">{s.name}</div>
                        <div className="text-sm text-[var(--color-muted)] mt-1">
                          {s.description}
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <Clock className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                          {s.durationMinutes} min
                        </div>
                      </div>
                      <div className="font-serif text-2xl text-[var(--color-accent)] tabular-nums shrink-0">
                        {formatNok(s.priceNok)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}

          {step === "date" ? (
            <motion.div
              key="date"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-[var(--color-accent)]" />
                  Velg dag
                </h2>
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                  Endre tjeneste
                </Button>
              </div>
              {service ? <ServiceBadge service={service} /> : null}
              <div className="flex justify-center md:justify-start">
                <DayPicker
                  mode="single"
                  locale={nb}
                  weekStartsOn={1}
                  fromDate={today}
                  toDate={sixtyDaysOut}
                  selected={date ?? undefined}
                  onSelect={pickDate}
                  disabled={[{ before: today }, { after: sixtyDaysOut }, isClosedDay]}
                />
              </div>
            </motion.div>
          ) : null}

          {step === "time" ? (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[var(--color-accent)]" />
                  Velg tid
                </h2>
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                  Endre dato
                </Button>
              </div>
              <DateBadge date={date!} />
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-[var(--color-muted)] py-12 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Henter ledige tider…
                </div>
              ) : slots && slots.length > 0 ? (
                <TimeGrid slots={slots} onPick={pickSlot} />
              ) : (
                <div className="py-12 text-center text-[var(--color-muted)]">
                  Ingen tider tilgjengelig denne dagen.
                </div>
              )}
            </motion.div>
          ) : null}

          {step === "contact" && selectedSlot && date && service ? (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Dine kontaktdetaljer</h2>
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                  Endre tid
                </Button>
              </div>

              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[var(--color-muted)] text-xs uppercase tracking-[0.2em]">
                    {service.name}
                  </div>
                  <div className="mt-1 font-medium truncate">
                    {date.toLocaleDateString("nb-NO", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · kl. {selectedSlot.time}
                  </div>
                </div>
                <div className="text-[var(--color-accent)] font-serif text-2xl shrink-0">
                  {formatNok(service.priceNok)}
                </div>
              </div>

              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Fullt navn</Label>
                  <Input
                    id="name"
                    required
                    autoComplete="name"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    placeholder="Ola Nordmann"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm({ ...form, customerPhone: e.target.value })
                    }
                    placeholder="912 34 567"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    value={form.customerEmail}
                    onChange={(e) =>
                      setForm({ ...form, customerEmail: e.target.value })
                    }
                    placeholder="ola@eksempel.no"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notat (valgfritt)</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Spesielle ønsker eller noe vi bør vite?"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3 mt-2">
                  <p className="text-xs text-[var(--color-muted)] md:mr-auto md:max-w-sm">
                    Ved å bekrefte godtar du å bli kontaktet på telefon/e-post
                    om timen.
                  </p>
                  <Button type="submit" size="lg" disabled={pending}>
                    {pending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Bekrefter…
                      </>
                    ) : (
                      <>
                        Bekreft bestilling
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items: { key: Step; label: string }[] = [
    { key: "service", label: "Tjeneste" },
    { key: "date", label: "Dato" },
    { key: "time", label: "Tid" },
    { key: "contact", label: "Bekreft" },
  ];
  const idx = items.findIndex((i) => i.key === step);
  return (
    <div className="border-b border-[var(--color-border)] px-6 md:px-10 py-4 overflow-x-auto">
      <ol className="flex items-center gap-2 text-sm whitespace-nowrap">
        {items.map((it, i) => {
          const active = i === idx;
          const done = i < idx;
          return (
            <li key={it.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                  done && "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-accent-foreground)]",
                  active && !done && "border-[var(--color-accent)] text-[var(--color-accent)]",
                  !active && !done && "border-[var(--color-border)] text-[var(--color-muted)]",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  active ? "text-[var(--color-foreground)]" : "text-[var(--color-muted)]",
                )}
              >
                {it.label}
              </span>
              {i < items.length - 1 ? (
                <span className="mx-2 h-px w-6 bg-[var(--color-border)]" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DateBadge({ date }: { date: Date }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-4 py-2 mb-6 inline-flex items-center gap-2 text-sm">
      <CalendarDays className="h-4 w-4 text-[var(--color-accent)]" />
      {date.toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}
    </div>
  );
}

function ServiceBadge({ service }: { service: Service }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)] px-4 py-2 mb-6 inline-flex items-center gap-2 text-sm">
      <Scissors className="h-4 w-4 text-[var(--color-accent)]" />
      {service.name} · {formatNok(service.priceNok)}
    </div>
  );
}

function TimeGrid({
  slots,
  onPick,
}: {
  slots: Slot[];
  onPick: (s: Slot) => void;
}) {
  const morning = slots.filter((s) => parseInt(s.time) < 12);
  const afternoon = slots.filter((s) => parseInt(s.time) >= 12);

  return (
    <div className="grid gap-6">
      {morning.length > 0 ? (
        <Group title="Formiddag" slots={morning} onPick={onPick} />
      ) : null}
      {afternoon.length > 0 ? (
        <Group title="Ettermiddag" slots={afternoon} onPick={onPick} />
      ) : null}
    </div>
  );
}

function Group({
  title,
  slots,
  onPick,
}: {
  title: string;
  slots: Slot[];
  onPick: (s: Slot) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3">
        {title}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {slots.map((s) => (
          <button
            key={s.startsAt}
            type="button"
            onClick={() => s.available && onPick(s)}
            disabled={!s.available}
            className={cn(
              "h-11 rounded-[var(--radius-md)] border text-sm font-medium tabular-nums transition-all",
              s.available
                ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/10"
                : "border-[var(--color-border)]/50 bg-transparent text-[var(--color-muted)]/50 line-through cursor-not-allowed",
            )}
          >
            {s.time}
          </button>
        ))}
      </div>
    </div>
  );
}
