"use client";

import { motion, AnimatePresence } from "motion/react";
import { Eye, Pencil, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEditMode } from "./EditModeProvider";

export function EditModeBar() {
  const { enabled, isAdmin, toggle } = useEditMode();
  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md shadow-2xl px-2 py-1.5">
          <button
            onClick={toggle}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              enabled
                ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                : "text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)]"
            }`}
          >
            {enabled ? (
              <>
                <Eye className="h-4 w-4" />
                Avslutt redigering
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Rediger nettsiden
              </>
            )}
          </button>
          <div className="h-6 w-px bg-[var(--color-border)]" />
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin
          </Link>
        </div>
        {enabled ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-2 text-xs text-[var(--color-muted)]"
          >
            Klikk på tekst eller hold over bilder for å endre
          </motion.div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
