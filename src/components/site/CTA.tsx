"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { EditableText } from "@/components/edit/EditableText";

type Props = {
  title: string;
  description: string;
};

export function CTA({ title, description }: Props) {
  return (
    <Section className="py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-surface-2)] p-10 md:p-16 text-center relative overflow-hidden"
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle at 30% 0%, rgba(201,169,115,0.22), transparent 55%)",
              "radial-gradient(circle at 70% 0%, rgba(201,169,115,0.22), transparent 55%)",
              "radial-gradient(circle at 30% 0%, rgba(201,169,115,0.22), transparent 55%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <EditableText
          contentKey="cta.title"
          initial={title}
          as="h2"
          className="font-serif text-3xl md:text-5xl text-balance leading-tight max-w-xl mx-auto block"
        />
        <EditableText
          contentKey="cta.description"
          initial={description}
          as="p"
          multiline
          className="mt-4 text-[var(--color-muted)] max-w-md mx-auto text-pretty block"
        />
        <Button asChild size="lg" className="mt-8 group">
          <Link href="/booking">
            Bestill time
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </motion.div>
    </Section>
  );
}
