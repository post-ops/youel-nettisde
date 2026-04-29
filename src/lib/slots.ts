import { addMinutes, addDays } from "date-fns";
import { fromZonedTime, toZonedTime, format as formatTz } from "date-fns-tz";
import {
  DAY_KEYS,
  LEAD_TIME_MINUTES,
  OPENING_HOURS,
  SLOT_MINUTES,
  TIMEZONE,
} from "./config";
import { db } from "./db";

export type Slot = {
  /** ISO UTC start-tidspunkt for slot. */
  startsAt: string;
  /** Lokal tid (Europe/Oslo) "HH:mm" — for visning. */
  time: string;
  available: boolean;
};

/**
 * Konverter en lokal "YYYY-MM-DD HH:mm" i konfigurert tidssone til UTC-Date.
 */
function zonedToUtc(localDate: string, hhmm: string): Date {
  // ISO-aktig "YYYY-MM-DDTHH:mm:ss" tolkes som tid i `TIMEZONE`.
  return fromZonedTime(`${localDate}T${hhmm}:00`, TIMEZONE);
}

function dayKeyForLocalDate(localDate: string): (typeof DAY_KEYS)[number] {
  // Lag et UTC-tidspunkt midt på dagen i Oslo for å unngå DST-kanter,
  // konverter tilbake til Oslo og les ukedag.
  const noon = zonedToUtc(localDate, "12:00");
  const inTz = toZonedTime(noon, TIMEZONE);
  return DAY_KEYS[inTz.getDay()];
}

function parseHhmm(hhmm: string): { hours: number; minutes: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { hours: h, minutes: m };
}

function diffMinutes(a: string, b: string): number {
  const ah = parseHhmm(a);
  const bh = parseHhmm(b);
  return (bh.hours - ah.hours) * 60 + (bh.minutes - ah.minutes);
}

/**
 * Generer 30-min slots for en gitt lokal kalenderdato (YYYY-MM-DD i Oslo).
 * Markerer slots som ikke-ledige hvis de overlapper med eksisterende booking,
 * blokk, eller faller innenfor LEAD_TIME fra "nå".
 */
export async function getAvailableSlots(
  localDate: string,
  opts: { now?: Date } = {},
): Promise<Slot[]> {
  const now = opts.now ?? new Date();
  const earliestAllowed = addMinutes(now, LEAD_TIME_MINUTES);

  const dayKey = dayKeyForLocalDate(localDate);
  const hours = OPENING_HOURS[dayKey];
  if (!hours) return [];

  const totalMinutes = diffMinutes(hours.open, hours.close);
  const slotCount = Math.floor(totalMinutes / SLOT_MINUTES);
  if (slotCount <= 0) return [];

  const dayStartUtc = zonedToUtc(localDate, hours.open);
  const dayEndUtc = zonedToUtc(localDate, hours.close);

  const [bookings, blocks] = await Promise.all([
    db.booking.findMany({
      where: {
        status: "CONFIRMED",
        startsAt: { lt: dayEndUtc },
        endsAt: { gt: dayStartUtc },
      },
      select: { startsAt: true, endsAt: true },
    }),
    db.block.findMany({
      where: {
        startsAt: { lt: dayEndUtc },
        endsAt: { gt: dayStartUtc },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const busy: Array<{ start: number; end: number }> = [
    ...bookings,
    ...blocks,
  ].map((r) => ({
    start: r.startsAt.getTime(),
    end: r.endsAt.getTime(),
  }));

  const slots: Slot[] = [];
  for (let i = 0; i < slotCount; i++) {
    const start = addMinutes(dayStartUtc, i * SLOT_MINUTES);
    const end = addMinutes(start, SLOT_MINUTES);
    const overlaps = busy.some(
      (b) => start.getTime() < b.end && end.getTime() > b.start,
    );
    const tooSoon = start.getTime() < earliestAllowed.getTime();

    slots.push({
      startsAt: start.toISOString(),
      time: formatTz(toZonedTime(start, TIMEZONE), "HH:mm", {
        timeZone: TIMEZONE,
      }),
      available: !overlaps && !tooSoon,
    });
  }

  return slots;
}

/**
 * For admin-kalender: returner sluttiden for et slot (start + SLOT_MINUTES).
 */
export function slotEnd(start: Date | string): Date {
  const s = typeof start === "string" ? new Date(start) : start;
  return addMinutes(s, SLOT_MINUTES);
}

/**
 * Sjekk om et eksakt start-tidspunkt fortsatt er ledig (atomar booking-validering).
 * Returnerer true hvis tidspunktet er innenfor åpningstid og ingen booking/blokk
 * overlapper.
 */
export async function isSlotAvailable(
  startsAtUtc: Date,
  opts: { now?: Date } = {},
): Promise<boolean> {
  const now = opts.now ?? new Date();
  const earliestAllowed = addMinutes(now, LEAD_TIME_MINUTES);
  if (startsAtUtc.getTime() < earliestAllowed.getTime()) return false;

  const inTz = toZonedTime(startsAtUtc, TIMEZONE);
  const dayKey = DAY_KEYS[inTz.getDay()];
  const hours = OPENING_HOURS[dayKey];
  if (!hours) return false;

  const localDate = formatTz(inTz, "yyyy-MM-dd", { timeZone: TIMEZONE });
  const dayStart = zonedToUtc(localDate, hours.open);
  const dayEnd = zonedToUtc(localDate, hours.close);
  const slotEndUtc = addMinutes(startsAtUtc, SLOT_MINUTES);

  if (
    startsAtUtc.getTime() < dayStart.getTime() ||
    slotEndUtc.getTime() > dayEnd.getTime()
  ) {
    return false;
  }

  const [bookingClash, blockClash] = await Promise.all([
    db.booking.findFirst({
      where: {
        status: "CONFIRMED",
        startsAt: { lt: slotEndUtc },
        endsAt: { gt: startsAtUtc },
      },
      select: { id: true },
    }),
    db.block.findFirst({
      where: {
        startsAt: { lt: slotEndUtc },
        endsAt: { gt: startsAtUtc },
      },
      select: { id: true },
    }),
  ]);

  return !bookingClash && !blockClash;
}

/**
 * Returner liste over de neste N dagene som potensielt kan ha ledige slots
 * (åpne dager). Datoer i Oslo-format YYYY-MM-DD.
 */
export function nextOpenDates(daysAhead = 30, today = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = addDays(today, i);
    const localDate = formatTz(toZonedTime(d, TIMEZONE), "yyyy-MM-dd", {
      timeZone: TIMEZONE,
    });
    if (OPENING_HOURS[dayKeyForLocalDate(localDate)]) {
      out.push(localDate);
    }
  }
  return out;
}
