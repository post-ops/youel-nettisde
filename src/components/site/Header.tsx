"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";

const NAV = [
  { href: "#tjeneste", label: "Priser" },
  { href: "#galleri", label: "Galleri" },
  { href: "#kontakt", label: "Kontakt" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 md:h-20 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--color-muted)]">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[var(--color-foreground)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button asChild size="sm" className="md:px-5">
          <Link href="/booking">Bestill time</Link>
        </Button>
      </div>
    </header>
  );
}
