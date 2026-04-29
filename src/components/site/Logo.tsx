import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: { mark: "h-8 w-8", text: "text-base" },
  md: { mark: "h-10 w-10", text: "text-lg md:text-xl" },
  lg: { mark: "h-14 w-14", text: "text-2xl md:text-3xl" },
};

/**
 * Ren SVG-logo for Molat Frisør. Bruker accent-fargen og serif-fonten.
 * Erstatter det fotografiske logo-bildet.
 */
export function Logo({ className, showText = true, size = "md" }: Props) {
  const s = SIZE[size];
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Mark className={s.mark} />
      {showText ? (
        <span className={cn("font-serif tracking-tight leading-none", s.text)}>
          <span>Molat</span>
          <span className="text-[var(--color-accent)]">.</span>
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
      className={cn("text-[var(--color-accent)]", className)}
      aria-hidden
    >
      {/* Sirkel-bakgrunn */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
      {/* Saks — to ringer + to blader */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="22" cy="42" r="5" />
        <circle cx="42" cy="42" r="5" />
        <line x1="26" y1="38" x2="46" y2="18" />
        <line x1="38" y1="38" x2="18" y2="18" />
      </g>
      {/* M-monogram bak saksen */}
      <text
        x="32"
        y="28"
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontSize="20"
        fontWeight="600"
        fill="currentColor"
        opacity="0.9"
      >
        M
      </text>
    </svg>
  );
}
