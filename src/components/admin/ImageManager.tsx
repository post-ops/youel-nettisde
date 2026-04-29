"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Loader2, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetImage, setImage } from "@/server/actions/content";
import type { ImageSlot } from "@/lib/config";

type Slot = {
  key: ImageSlot;
  label: string;
  url: string;
  isDefault: boolean;
};

export function ImageManager({ slots }: { slots: Slot[] }) {
  const [busy, setBusy] = useState<ImageSlot | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleUpload(slot: ImageSlot, file: File) {
    setBusy(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? "Opplasting feilet");
        return;
      }
      const res = await setImage(slot, data.url as string);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke lagre");
        return;
      }
      toast.success("Bilde oppdatert");
    } finally {
      setBusy(null);
    }
  }

  function handleReset(slot: ImageSlot) {
    startTransition(async () => {
      const res = await resetImage(slot);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke tilbakestille");
        return;
      }
      toast.success("Tilbakestilt til standard-bilde");
    });
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {slots.map((s) => (
        <SlotCard
          key={s.key}
          slot={s}
          onUpload={handleUpload}
          onReset={handleReset}
          uploading={busy === s.key}
          pending={pending}
        />
      ))}
    </div>
  );
}

function SlotCard({
  slot,
  onUpload,
  onReset,
  uploading,
  pending,
}: {
  slot: Slot;
  onUpload: (slot: ImageSlot, f: File) => void;
  onReset: (slot: ImageSlot) => void;
  uploading: boolean;
  pending: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(slot.key, f);
        }}
        className={`relative aspect-[3/4] bg-[var(--color-surface-2)] ${
          dragOver ? "ring-2 ring-[var(--color-accent)]" : ""
        }`}
      >
        <Image
          src={slot.url}
          alt={slot.label}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
          unoptimized={slot.url.startsWith("/uploads/")}
        />
        {uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">{slot.label}</div>
          <div className="text-xs text-[var(--color-muted)]">
            {slot.isDefault ? "Standard-bilde" : "Egendefinert"}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!slot.isDefault ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onReset(slot.key)}
              disabled={pending || uploading}
              aria-label="Tilbakestill"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={pick}
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            Last opp
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(slot.key, f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
