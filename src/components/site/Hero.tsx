"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOWEST_PRICE, SLOT_MINUTES } from "@/lib/config";
import { formatNok } from "@/lib/utils";
import { EditableText } from "@/components/edit/EditableText";

type Props = {
  title: string;
  tagline: string;
  subtitle: string;
};

export function Hero({ title, tagline, subtitle }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-[var(--color-background)]"
    >
      {/* Pure CSS-bakgrunn — ingen foto */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-[#0c0d12] to-[#0c0d12]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(245,239,227,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(201,169,115,1) 0 1px, transparent 1px 12px)",
          }}
        />
      </div>

      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(201,169,115,0.18), transparent 55%)",
            "radial-gradient(circle at 80% 60%, rgba(201,169,115,0.18), transparent 55%)",
            "radial-gradient(circle at 30% 70%, rgba(201,169,115,0.18), transparent 55%)",
            "radial-gradient(circle at 20% 30%, rgba(201,169,115,0.18), transparent 55%)",
          ],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        aria-hidden
        className="absolute right-[-4rem] top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none"
        animate={{ rotate: [0, 8, 0, -8, 0], y: [0, -12, 0, 12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        <Scissors className="h-[28rem] w-[28rem] text-[var(--color-accent)]" strokeWidth={0.6} />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity }}
        className="mx-auto w-full max-w-6xl px-6 pt-32 pb-20 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-8">
            <Scissors className="h-3.5 w-3.5" />
            Herrefrisør · Bestill på nett
          </div>

          <EditableText
            contentKey="hero.title"
            initial={title}
            as="h1"
            className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance block"
          />

          <EditableText
            contentKey="hero.tagline"
            initial={tagline}
            as="p"
            className="mt-4 text-base md:text-lg text-[var(--color-accent)] font-medium tracking-wide block"
          />

          <EditableText
            contentKey="hero.subtitle"
            initial={subtitle}
            as="p"
            multiline
            className="mt-4 text-lg md:text-xl text-[var(--color-muted)] text-pretty max-w-xl block"
          />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="group">
              <Link href="/booking">
                Bestill time
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#tjeneste">Se priser</a>
            </Button>
          </div>

          <div className="mt-14 flex items-center gap-6 text-sm text-[var(--color-muted)]">
            <Stat top={`${SLOT_MINUTES} min`} bottom="per klipp" />
            <Divider />
            <Stat top={`fra ${formatNok(LOWEST_PRICE)}`} bottom="4 tjenester" />
            <Divider />
            <Stat top="Man – Lør" bottom="10:30 – 19:00" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Stat({ top, bottom }: { top: string; bottom: string }) {
  return (
    <div>
      <div className="text-[var(--color-foreground)] font-medium">{top}</div>
      <div>{bottom}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-[var(--color-border)]" />;
}
