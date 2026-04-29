"use client";

import { motion } from "motion/react";
import { Scissors } from "lucide-react";

const ITEMS = [
  "Presisjon",
  "Klassisk håndverk",
  "Faste priser",
  "Bestill på nett",
  "Punktlig",
  "Skreddersydd klipp",
  "Avslappet stemning",
  "Detaljer som teller",
];

export function Marquee() {
  // Dobbel listen for sømløs sløyfe
  const repeated = [...ITEMS, ...ITEMS];

  return (
    <section
      aria-hidden
      className="relative border-y border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex items-center gap-12 py-5 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 32,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {repeated.map((label, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            <span className="font-serif text-2xl md:text-3xl text-[var(--color-foreground)]/80 tracking-tight">
              {label}
            </span>
            <Scissors className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
