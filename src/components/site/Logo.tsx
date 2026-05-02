import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: { mark: { w: 32, h: 42 }, cls: "h-10 w-auto" },
  md: { mark: { w: 44, h: 58 }, cls: "h-14 w-auto" },
  lg: { mark: { w: 64, h: 84 }, cls: "h-20 w-auto" },
};

export function Logo({ className, size = "md" }: Props) {
  const s = SIZE[size];
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Mark className={s.cls} width={s.mark.w} height={s.mark.h} />
    </span>
  );
}

export function Mark({
  className,
  width = 64,
  height = 84,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Molat Frisør"
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none", className)}
    />
  );
}
