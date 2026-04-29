"use client";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Section } from "@/components/ui/section";
import { OPENING_HOURS } from "@/lib/config";
import { EditableText } from "@/components/edit/EditableText";

const DAYS_LABEL: Record<string, string> = {
  mon: "Mandag",
  tue: "Tirsdag",
  wed: "Onsdag",
  thu: "Torsdag",
  fri: "Fredag",
  sat: "Lørdag",
  sun: "Søndag",
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  phone: string;
  email: string;
  address: string;
};

export function Contact({
  eyebrow,
  title,
  description,
  phone,
  email,
  address,
}: Props) {
  const ordered: (keyof typeof OPENING_HOURS)[] = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ];
  return (
    <Section id="kontakt">
      <div className="max-w-2xl mb-12">
        <EditableText
          contentKey="contact.eyebrow"
          initial={eyebrow}
          as="div"
          className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 inline-block"
        />
        <EditableText
          contentKey="contact.title"
          initial={title}
          as="h2"
          className="text-3xl md:text-5xl text-balance leading-tight block"
        />
        <EditableText
          contentKey="contact.description"
          initial={description}
          as="p"
          multiline
          className="mt-4 text-[var(--color-muted)] text-pretty md:text-lg block"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7"
        >
          <h3 className="text-2xl mb-6 flex items-center gap-3">
            <Clock className="h-5 w-5 text-[var(--color-accent)]" />
            Åpningstider
          </h3>
          <ul className="space-y-3">
            {ordered.map((d) => {
              const h = OPENING_HOURS[d];
              return (
                <li
                  key={d}
                  className="flex items-center justify-between border-b border-[var(--color-border)] last:border-b-0 pb-2 last:pb-0"
                >
                  <span className="text-[var(--color-foreground)]/90">
                    {DAYS_LABEL[d]}
                  </span>
                  <span className="text-[var(--color-muted)] tabular-nums">
                    {h ? `${h.open} – ${h.close}` : "Stengt"}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7"
        >
          <h3 className="text-2xl mb-6">Finn oss</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[var(--color-accent)] mt-0.5" />
              <EditableText
                contentKey="contact.address"
                initial={address}
                as="div"
                className="text-[var(--color-foreground)]/90 flex-1"
              />
            </li>
            <li className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-[var(--color-accent)] mt-0.5" />
              <EditableText
                contentKey="contact.phone"
                initial={phone}
                as="div"
                className="text-[var(--color-foreground)]/90 flex-1"
              />
            </li>
            <li className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[var(--color-accent)] mt-0.5" />
              <EditableText
                contentKey="contact.email"
                initial={email}
                as="div"
                className="text-[var(--color-foreground)]/90 flex-1"
              />
            </li>
          </ul>
        </motion.div>
      </div>
    </Section>
  );
}
