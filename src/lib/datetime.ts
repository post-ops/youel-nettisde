import { format as formatTzFns, toZonedTime } from "date-fns-tz";
import { nb } from "date-fns/locale";
import { TIMEZONE } from "./config";

/**
 * Formater en Date eller ISO-streng som lokal Oslo-tid med norsk lokalisering.
 */
export function formatTz(value: Date | string, pattern: string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return formatTzFns(toZonedTime(d, TIMEZONE), pattern, {
    timeZone: TIMEZONE,
    locale: nb,
  });
}

export function ymdInOslo(value: Date | string): string {
  return formatTz(value, "yyyy-MM-dd");
}

export function hhmmInOslo(value: Date | string): string {
  return formatTz(value, "HH:mm");
}
