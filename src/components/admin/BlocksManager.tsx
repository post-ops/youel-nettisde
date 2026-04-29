"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  blockWholeDay,
  createBlock,
  deleteBlock,
} from "@/server/actions/createBlock";

type Row = { id: string; when: string; timeRange: string; reason: string | null };

export function BlocksManager({ rows }: { rows: Row[] }) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"day" | "range">("day");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("12:00");
  const [reason, setReason] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      toast.error("Velg en dato");
      return;
    }

    startTransition(async () => {
      const res =
        mode === "day"
          ? await blockWholeDay(date, reason || undefined)
          : await createBlock({
              startsAt: localToIso(date, from),
              endsAt: localToIso(date, to),
              reason: reason || undefined,
            });

      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke opprette blokk");
        return;
      }
      toast.success("Blokk opprettet");
      setDate("");
      setReason("");
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteBlock(id);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke slette");
        return;
      }
      toast.success("Blokk fjernet");
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form
        onSubmit={submit}
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="text-lg mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-[var(--color-accent)]" />
          Ny blokk
        </h2>

        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            size="sm"
            variant={mode === "day" ? "primary" : "secondary"}
            onClick={() => setMode("day")}
          >
            Hel dag
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "range" ? "primary" : "secondary"}
            onClick={() => setMode("range")}
          >
            Tidsrom
          </Button>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="date">Dato</Label>
            <Input
              id="date"
              type="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
          </div>
          {mode === "range" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from">Fra</Label>
                <Input
                  id="from"
                  type="time"
                  value={from}
                  required
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="to">Til</Label>
                <Input
                  id="to"
                  type="time"
                  value={to}
                  required
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          ) : null}
          <div>
            <Label htmlFor="reason">Grunn (valgfritt)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sykdom, ferie, lunsj…"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Lagrer…
              </>
            ) : (
              "Opprett blokk"
            )}
          </Button>
        </div>
      </form>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg">Aktive blokker</h2>
        </div>
        {rows.length === 0 ? (
          <div className="p-6 text-center text-[var(--color-muted)] text-sm">
            Ingen aktive blokker.
          </div>
        ) : (
          <ul>
            {rows.map((r) => (
              <li
                key={r.id}
                className="px-6 py-4 border-b border-[var(--color-border)] last:border-b-0 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-medium">{r.when}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-0.5">
                    {r.timeRange}
                    {r.reason ? ` · ${r.reason}` : ""}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(r.id)}
                  disabled={pending}
                  aria-label="Slett blokk"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Konverter "YYYY-MM-DD" + "HH:mm" (lokal nettleser-tid) til ISO. */
function localToIso(date: string, time: string): string {
  // Lager en lokal Date (browser-tid antas å være Europe/Oslo for admin) og
  // serialiserer til ISO. Server-side sjekkes uansett mot åpningstid.
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0).toISOString();
}
