"use client";
import { motion } from "motion/react";
import { Section } from "@/components/ui/section";
import { EditableText } from "@/components/edit/EditableText";

const ITEMS = [
  { t: "Punktlig", d: "Vi holder timeavtalen din. Ingen ventetid på salongen." },
  { t: "Detaljert", d: "Konsultasjon før klipp så vi treffer akkurat det du ønsker." },
  { t: "Komfortabel", d: "Avslappet atmosfære, gode produkter, ekte håndverk." },
];

type Props = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
};

export function About({ eyebrow, title, titleAccent, description }: Props) {
  return (
    <Section id="om" className="py-20 md:py-24">
      <div className="max-w-2xl mb-12">
        <EditableText
          contentKey="about.eyebrow"
          initial={eyebrow}
          as="div"
          className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 inline-block"
        />
        <h2 className="text-3xl md:text-5xl text-balance leading-tight">
          <EditableText
            contentKey="about.title"
            initial={title}
            as="span"
            className="block"
          />
          <EditableText
            contentKey="about.titleAccent"
            initial={titleAccent}
            as="span"
            className="text-[var(--color-accent)] block"
          />
        </h2>
        <EditableText
          contentKey="about.description"
          initial={description}
          as="p"
          multiline
          className="mt-4 text-[var(--color-muted)] text-pretty md:text-lg block"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.t}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 transition-colors hover:border-[var(--color-accent)]/40"
          >
            <div className="text-[var(--color-accent)] text-sm uppercase tracking-[0.2em] mb-2">
              {it.t}
            </div>
            <p className="text-[var(--color-foreground)]/90 text-pretty">
              {it.d}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
