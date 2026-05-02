import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: { mark: "h-9 w-9", text: "text-base" },
  md: { mark: "h-11 w-11", text: "text-lg md:text-xl" },
  lg: { mark: "h-16 w-16", text: "text-2xl md:text-3xl" },
};

export function Logo({ className, showText = true, size = "md" }: Props) {
  const s = SIZE[size];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-[var(--color-foreground)]",
        className,
      )}
    >
      <Mark className={s.mark} />
      {showText ? (
        <span
          className={cn(
            "font-serif tracking-[0.22em] uppercase leading-none",
            s.text,
          )}
        >
          <span>Molat</span>
          <span className="text-[var(--color-accent)] mx-1.5">·</span>
          <span>Frisør</span>
        </span>
      ) : null}
    </span>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="29.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.6"
      />
      {/* Kam — bak */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      >
        <rect x="22.5" y="14.5" width="19" height="4" rx="0.8" />
        <line x1="25" y1="18.5" x2="25" y2="32" />
        <line x1="29" y1="18.5" x2="29" y2="32" />
        <line x1="32" y1="18.5" x2="32" y2="32" />
        <line x1="35" y1="18.5" x2="35" y2="32" />
        <line x1="39" y1="18.5" x2="39" y2="32" />
      </g>
      {/* Saks — foran */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="22" cy="44" r="4.2" />
        <circle cx="42" cy="44" r="4.2" />
        <line x1="25.2" y1="41" x2="45" y2="20" />
        <line x1="38.8" y1="41" x2="19" y2="20" />
        <circle cx="32" cy="35.5" r="1.1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
