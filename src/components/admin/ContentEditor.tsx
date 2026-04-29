"use client";

import { useState, useTransition } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTENT_KEYS,
  DEFAULT_CONTENT,
  type ContentKey,
} from "@/lib/config";
import { saveContent } from "@/server/actions/content";

const FIELD_META: Record<
  ContentKey,
  { label: string; group: string; multiline?: boolean }
> = {
  "hero.title": { label: "Hero-tittel", group: "Forsiden" },
  "hero.tagline": { label: "Hero-undertittel (gull)", group: "Forsiden" },
  "hero.subtitle": { label: "Hero-tekst", group: "Forsiden", multiline: true },
  "about.eyebrow": { label: "Om-seksjon · etikett", group: "Om Molat" },
  "about.title": { label: "Om-tittel (linje 1)", group: "Om Molat" },
  "about.titleAccent": { label: "Om-tittel (linje 2, gull)", group: "Om Molat" },
  "about.description": {
    label: "Om-beskrivelse",
    group: "Om Molat",
    multiline: true,
  },
  "service.eyebrow": { label: "Tjenester · etikett", group: "Tjenester" },
  "service.title": { label: "Tjenester-tittel", group: "Tjenester" },
  "service.description": {
    label: "Tjenester-beskrivelse",
    group: "Tjenester",
    multiline: true,
  },
  "gallery.eyebrow": { label: "Galleri · etikett", group: "Galleri" },
  "gallery.title": { label: "Galleri-tittel", group: "Galleri" },
  "gallery.description": {
    label: "Galleri-beskrivelse",
    group: "Galleri",
    multiline: true,
  },
  "cta.title": { label: "Banner: tittel", group: "Banner" },
  "cta.description": {
    label: "Banner: tekst",
    group: "Banner",
    multiline: true,
  },
  "contact.eyebrow": { label: "Kontakt · etikett", group: "Kontakt" },
  "contact.title": { label: "Kontakt-tittel", group: "Kontakt" },
  "contact.description": {
    label: "Kontakt-beskrivelse",
    group: "Kontakt",
    multiline: true,
  },
  "contact.phone": { label: "Telefon", group: "Kontakt" },
  "contact.email": { label: "E-post", group: "Kontakt" },
  "contact.address": { label: "Adresse", group: "Kontakt" },
  "booking.eyebrow": {
    label: "Bestillings-side · etikett",
    group: "Bestillings-side",
  },
  "booking.title": {
    label: "Bestillings-side: tittel",
    group: "Bestillings-side",
  },
  "booking.subtitle": {
    label: "Bestillings-side: undertekst",
    group: "Bestillings-side",
    multiline: true,
  },
};

const GROUPS = [
  "Forsiden",
  "Om Molat",
  "Tjenester",
  "Galleri",
  "Banner",
  "Kontakt",
  "Bestillings-side",
];

export function ContentEditor({ initial }: { initial: Record<ContentKey, string> }) {
  const [values, setValues] = useState<Record<ContentKey, string>>(initial);
  const [pending, startTransition] = useTransition();

  function update(k: ContentKey, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function reset(k: ContentKey) {
    update(k, DEFAULT_CONTENT[k]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveContent(values);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke lagre");
        return;
      }
      toast.success("Tekst lagret");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-8">
      {GROUPS.map((g) => (
        <fieldset
          key={g}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <legend className="px-2 text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {g}
          </legend>
          <div className="grid gap-4 mt-2">
            {CONTENT_KEYS.filter((k) => FIELD_META[k].group === g).map((k) => {
              const meta = FIELD_META[k];
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor={k}>{meta.label}</Label>
                    {values[k] !== DEFAULT_CONTENT[k] ? (
                      <button
                        type="button"
                        onClick={() => reset(k)}
                        className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] inline-flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Tilbakestill
                      </button>
                    ) : null}
                  </div>
                  {meta.multiline ? (
                    <Textarea
                      id={k}
                      value={values[k]}
                      onChange={(e) => update(k, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={k}
                      value={values[k]}
                      onChange={(e) => update(k, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Lagrer…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lagre endringer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
