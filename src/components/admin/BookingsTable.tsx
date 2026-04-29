"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminCancelBooking } from "@/server/actions/createBlock";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  when: string;
  startsAt: string;
  status: string;
  notes: string | null;
};

export function BookingsTable({ rows }: { rows: Row[] }) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function cancel(id: string) {
    startTransition(async () => {
      const res = await adminCancelBooking(id);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke avbestille");
        return;
      }
      toast.success("Bestilling avbestilt");
      setConfirmId(null);
    });
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted)]">
            <th className="px-4 py-3 font-medium">Tid</th>
            <th className="px-4 py-3 font-medium">Kunde</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Tjeneste</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Telefon</th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">E-post</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-[var(--color-muted)]">
                Ingen bestillinger ennå.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-2)]/50"
              >
                <td className="px-4 py-3 tabular-nums">{r.when}</td>
                <td className="px-4 py-3 font-medium">{r.customerName}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-[var(--color-muted)]">
                  {r.service}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <a
                    href={`tel:${r.customerPhone}`}
                    className="hover:text-[var(--color-accent)]"
                  >
                    {r.customerPhone}
                  </a>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <a
                    href={`mailto:${r.customerEmail}`}
                    className="hover:text-[var(--color-accent)]"
                  >
                    {r.customerEmail}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
                      r.status === "CONFIRMED"
                        ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                        : "bg-[var(--color-muted)]/20 text-[var(--color-muted)]",
                    )}
                  >
                    {r.status === "CONFIRMED" ? "Bekreftet" : "Avbestilt"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "CONFIRMED" &&
                  new Date(r.startsAt) > new Date() ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmId(r.id)}
                    >
                      <X className="h-3 w-3" /> Avbestill
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Dialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avbestille timen?</DialogTitle>
            <DialogDescription>
              Bestillingen markeres som avbestilt og fjernes fra Google Kalender.
              Kunden får en e-post med beskjed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setConfirmId(null)}>
              Avbryt
            </Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => confirmId && cancel(confirmId)}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Avbestiller…
                </>
              ) : (
                "Ja, avbestill"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
