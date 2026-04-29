"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/config";
import { formatNok } from "@/lib/utils";
import { EditableText } from "@/components/edit/EditableText";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function Service({ eyebrow, title, description }: Props) {
  return (
    <Section id="tjeneste">
      <div className="max-w-2xl mb-12">
        <EditableText
          contentKey="service.eyebrow"
          initial={eyebrow}
          as="div"
          className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 inline-block"
        />
        <EditableText
          contentKey="service.title"
          initial={title}
          as="h2"
          className="text-3xl md:text-5xl text-balance leading-tight block"
        />
        <EditableText
          contentKey="service.description"
          initial={description}
          as="p"
          multiline
          className="mt-4 text-[var(--color-muted)] text-pretty md:text-lg block"
        />
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-7 hover:border-[var(--color-accent)]/60 transition-colors overflow-hidden"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h3 className="font-serif text-2xl mb-1.5">{s.name}</h3>
                <p className="text-[var(--color-muted)] text-sm text-pretty">
                  {s.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  {s.durationMinutes} min
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-3xl md:text-4xl text-[var(--color-accent)] leading-none tabular-nums">
                  {formatNok(s.priceNok)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild size="lg" className="group">
          <Link href="/booking">
            Bestill time
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
