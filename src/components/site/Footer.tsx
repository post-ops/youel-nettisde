import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { BUSINESS } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Logo size="md" />
          <div className="text-xs text-[var(--color-muted)] mt-1">
            {BUSINESS.tagline}
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-[var(--color-muted)]">
          <Link
            href="/booking"
            className="hover:text-[var(--color-foreground)] transition-colors"
          >
            Bestill time
          </Link>
          <a
            href="#kontakt"
            className="hover:text-[var(--color-foreground)] transition-colors"
          >
            Kontakt
          </a>
          <Link
            href="/admin/login"
            className="hover:text-[var(--color-foreground)] transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-[var(--color-muted)] flex justify-between">
          <span>© {new Date().getFullYear()} {BUSINESS.name}</span>
          <span>Bygget med omhu.</span>
        </div>
      </div>
    </footer>
  );
}
