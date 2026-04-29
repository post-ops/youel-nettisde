import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("mx-auto w-full max-w-6xl px-6 py-20 md:py-28", className)}
      {...props}
    />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl mb-12", className)}>
      {eyebrow ? (
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-3xl md:text-5xl text-balance leading-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[var(--color-muted)] text-pretty md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
