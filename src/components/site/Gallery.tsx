"use client";
import { motion } from "motion/react";
import { Section } from "@/components/ui/section";
import { EditableText } from "@/components/edit/EditableText";
import { EditableImage } from "@/components/edit/EditableImage";
import { IMAGE_SLOTS, type ImageSlot } from "@/lib/config";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  images: { slot: ImageSlot; src: string; alt: string; label: string }[];
};

export function Gallery({ eyebrow, title, description, images }: Props) {
  return (
    <Section id="galleri">
      <div className="max-w-2xl mb-12">
        <EditableText
          contentKey="gallery.eyebrow"
          initial={eyebrow}
          as="div"
          className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 inline-block"
        />
        <EditableText
          contentKey="gallery.title"
          initial={title}
          as="h2"
          className="text-3xl md:text-5xl text-balance leading-tight block"
        />
        <EditableText
          contentKey="gallery.description"
          initial={description}
          as="p"
          multiline
          className="mt-4 text-[var(--color-muted)] text-pretty md:text-lg block"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {images.map((it, i) => {
          const defaultSrc =
            IMAGE_SLOTS.find((s) => s.key === it.slot)?.default ?? it.src;
          return (
            <motion.div
              key={it.slot}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className="group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <EditableImage
                slot={it.slot}
                src={it.src}
                defaultSrc={defaultSrc}
                alt={it.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 z-[5] bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 z-[5] p-4 md:p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-1">
                  {it.label}
                </div>
                <div className="text-white text-sm md:text-base font-medium">
                  {it.alt}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
