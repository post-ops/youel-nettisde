"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import type { ImageSlot } from "@/lib/config";
import { resetImage, setImage } from "@/server/actions/content";
import { useEditMode } from "./EditModeProvider";

type Props = Omit<ImageProps, "src"> & {
  slot: ImageSlot;
  src: string;
  defaultSrc?: string;
};

export function EditableImage({ slot, src, defaultSrc, alt, ...rest }: Props) {
  const { enabled } = useEditMode();
  const [currentSrc, setCurrentSrc] = useState(src);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync med ny prop (f.eks. etter revalidatePath)
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Må være et bilde");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? "Opplasting feilet");
        return;
      }
      const res = await setImage(slot, data.url);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke lagre");
        return;
      }
      setCurrentSrc(`${data.url}?v=${Date.now()}`);
      toast.success("Bilde oppdatert");
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    if (!defaultSrc) return;
    startTransition(async () => {
      const res = await resetImage(slot);
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke tilbakestille");
        return;
      }
      setCurrentSrc(`${defaultSrc}?v=${Date.now()}`);
      toast.success("Tilbakestilt");
    });
  }

  function pickFile() {
    inputRef.current?.click();
  }

  const isCustom =
    !!defaultSrc && currentSrc.split("?")[0] !== defaultSrc.split("?")[0];

  return (
    <>
      <Image
        src={currentSrc}
        alt={alt}
        {...rest}
        unoptimized={currentSrc.startsWith("/uploads/")}
      />

      {enabled ? (
        <>
          {/* Skjult input — utenfor knappen så vi unngår nested interactives */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />

          {/* Hovedklikkemål: hele bildet */}
          <button
            type="button"
            onClick={pickFile}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.dataset.over = "1";
            }}
            onDragLeave={(e) => {
              delete e.currentTarget.dataset.over;
            }}
            onDrop={(e) => {
              e.preventDefault();
              delete e.currentTarget.dataset.over;
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            disabled={busy}
            aria-label={`Bytt bilde for ${alt}`}
            className="absolute inset-0 z-30 cursor-pointer ring-2 ring-dashed ring-[var(--color-accent)]/80 ring-inset transition-all hover:bg-black/55 data-[over=1]:bg-black/70 data-[over=1]:ring-[var(--color-accent)] flex flex-col items-center justify-center gap-3 disabled:cursor-wait outline-none focus-visible:ring-[var(--color-accent)] focus-visible:bg-black/40"
            style={{
              boxShadow: "inset 0 0 0 2px var(--color-accent)",
            }}
          >
            {/* Sentral pille — alltid synlig i edit-modus */}
            <span className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-xl pointer-events-none">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Laster opp…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Bytt bilde
                </>
              )}
            </span>
            <span className="text-xs text-white/95 bg-black/70 px-2.5 py-1 rounded font-medium pointer-events-none">
              Klikk eller dra-og-slipp
            </span>
          </button>

          {/* Tilbakestill-knapp — utenfor hoved-knappen for å unngå nested buttons */}
          {isCustom ? (
            <button
              type="button"
              onClick={handleReset}
              disabled={pending}
              className="absolute top-3 left-3 z-40 bg-[var(--color-surface)]/95 backdrop-blur text-[var(--color-foreground)] text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg hover:bg-[var(--color-surface-2)] disabled:opacity-50 border border-[var(--color-border)]"
              aria-label="Tilbakestill til standard-bilde"
            >
              <RotateCcw className="h-3 w-3" />
              Tilbakestill
            </button>
          ) : null}
        </>
      ) : null}
    </>
  );
}
