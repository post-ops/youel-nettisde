"use client";

import {
  ElementType,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveContent } from "@/server/actions/content";
import type { ContentKey } from "@/lib/config";
import { useEditMode } from "./EditModeProvider";

type Props = {
  contentKey: ContentKey;
  initial: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
};

export function EditableText({
  contentKey,
  initial,
  as: Tag = "span",
  className,
  multiline = false,
  placeholder = "Klikk for å redigere",
}: Props) {
  const { enabled } = useEditMode();
  const [value, setValue] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Sync inn server-verdi om den endres (f.eks. revalidatePath)
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEdit() {
    setDraft(value);
    setEditing(true);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed === value) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await saveContent({ [contentKey]: trimmed });
      if (!res.ok) {
        toast.error(res.error ?? "Kunne ikke lagre");
        return;
      }
      setValue(trimmed);
      setEditing(false);
      toast.success("Lagret");
    });
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      save();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save();
    }
  }

  // Ikke i edit-modus → bare vis verdien
  if (!enabled) {
    return <Tag className={className}>{value}</Tag>;
  }

  // I edit-modus, men ikke åpen editor → klikkbar
  if (!editing) {
    return (
      <Tag
        className={cn(
          className,
          "relative cursor-pointer rounded transition-colors",
          "hover:bg-[var(--color-accent)]/10 outline outline-1 outline-dashed outline-[var(--color-accent)]/30 hover:outline-[var(--color-accent)]/70 outline-offset-4",
        )}
        onClick={startEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") startEdit();
        }}
      >
        {value || (
          <span className="opacity-50 italic">{placeholder}</span>
        )}
        <Pencil
          aria-hidden
          className="absolute -top-2 -right-2 h-4 w-4 text-[var(--color-accent)] bg-[var(--color-background)] rounded-full p-0.5 border border-[var(--color-accent)]/40"
        />
      </Tag>
    );
  }

  // Aktiv editor — overlay-popup ankret rundt teksten
  return (
    <Tag className={cn(className, "relative")}>
      <span className="opacity-0">{value || placeholder}</span>
      <div className="absolute inset-0 -m-2 z-30">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/60 bg-[var(--color-surface)] p-2 shadow-2xl flex flex-col gap-2">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={3}
              className="w-full resize-y rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] p-2 text-sm font-sans text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-accent)]"
              placeholder={placeholder}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              className="w-full rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-1.5 text-sm font-sans text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-accent)]"
              placeholder={placeholder}
            />
          )}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={cancel}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] inline-flex items-center gap-1 px-2 py-1"
            >
              <X className="h-3.5 w-3.5" />
              Avbryt
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="text-xs bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:brightness-110 inline-flex items-center gap-1 px-3 py-1 rounded-md disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Lagre
            </button>
          </div>
        </div>
      </div>
    </Tag>
  );
}
