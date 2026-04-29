/**
 * Forretnings-konfig for Molat Frisør.
 * Endre åpningstider, pris eller slot-størrelse her — alt annet leses herfra.
 */

export const TIMEZONE = process.env.TIMEZONE ?? "Europe/Oslo";
export const SLOT_MINUTES = Number(process.env.SLOT_MINUTES ?? 30);
export const LEAD_TIME_MINUTES = Number(process.env.LEAD_TIME_MINUTES ?? 60);

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const DAY_KEYS: readonly DayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export type OpeningHours = { open: string; close: string } | null;

/**
 * Åpningstider per ukedag (lokal Europe/Oslo-tid, 24h "HH:mm").
 * `null` betyr stengt hele dagen.
 */
export const OPENING_HOURS: Record<DayKey, OpeningHours> = {
  mon: { open: "10:30", close: "19:00" },
  tue: { open: "10:30", close: "19:00" },
  wed: { open: "10:30", close: "19:00" },
  thu: { open: "10:30", close: "19:00" },
  fri: { open: "10:30", close: "19:00" },
  sat: { open: "10:30", close: "19:00" },
  sun: null,
};

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceNok: number;
};

/**
 * Tjenestene salongen tilbyr. Hver booking knyttes til én av disse.
 */
export const SERVICES: readonly Service[] = [
  {
    id: "voksen",
    name: "Voksenklipp",
    description: "Klassisk eller moderne klipp for voksne.",
    durationMinutes: 30,
    priceNok: 400,
  },
  {
    id: "ungdom",
    name: "Ungdomsklipp",
    description: "For ungdom (13–17 år).",
    durationMinutes: 30,
    priceNok: 350,
  },
  {
    id: "barn",
    name: "Barneklipp",
    description: "For barn under 13 år.",
    durationMinutes: 30,
    priceNok: 300,
  },
  {
    id: "klipp-skjegg",
    name: "Herreklipp m/ skjegg",
    description: "Klipp og skjeggtrim — komplett stil.",
    durationMinutes: 30,
    priceNok: 550,
  },
] as const;

export const DEFAULT_SERVICE = SERVICES[0];

export function findService(id: string | null | undefined): Service {
  return SERVICES.find((s) => s.id === id) ?? DEFAULT_SERVICE;
}

/** Laveste pris i tjenestelisten — for "fra X kr"-visning. */
export const LOWEST_PRICE = Math.min(...SERVICES.map((s) => s.priceNok));

export const BUSINESS = {
  name: "Molat Frisør",
  tagline: "Klassisk håndverk for moderne menn.",
  email: process.env.OWNER_EMAIL ?? "",
  phone: "+47 972 81 933",
  address: "Adresse oppdateres",
};

/** Standard-tekster som kan overstyres av admin via SiteContent. */
export const DEFAULT_CONTENT = {
  "hero.title": "Molat Frisør",
  "hero.tagline": "Klassisk håndverk for moderne menn.",
  "hero.subtitle": "Velg en ledig tid på sekunder — vi tar oss av resten.",
  "about.eyebrow": "Om Molat",
  "about.title": "Skreddersydd klipp.",
  "about.titleAccent": "Hver gang.",
  "about.description":
    "Hos Molat handler det om mer enn en klipp. Hver kunde får tid, kompetanse og et resultat som sitter — fra klassisk klipp til moderne stylinger. Vi tar én kunde av gangen så du slipper å vente.",
  "service.eyebrow": "Tjenester",
  "service.title": "Velg det som passer deg.",
  "service.description":
    "Faste priser, ingen overraskelser. Alle klipp tar 30 minutter.",
  "gallery.eyebrow": "Salongen",
  "gallery.title": "Detaljer som teller.",
  "gallery.description":
    "Et rom skapt for ro og presisjon. Klassisk inventar, utvalgte produkter, ekte håndverk.",
  "cta.title": "Klar for ny stil?",
  "cta.description": "Det tar 30 sekunder å bestille. Velg en ledig tid nå.",
  "contact.eyebrow": "Kontakt",
  "contact.title": "Vi sees i salongen.",
  "contact.description":
    "Stikk innom, ring oss eller bestill direkte på nett.",
  "contact.phone": BUSINESS.phone,
  "contact.email": BUSINESS.email,
  "contact.address": BUSINESS.address,
  "booking.eyebrow": "Bestill på nett",
  "booking.title": "Velg en tid som passer.",
  "booking.subtitle": "Velg tjeneste, dato og tid — bekreft i én flyt.",
} as const;

export type ContentKey = keyof typeof DEFAULT_CONTENT;
export const CONTENT_KEYS = Object.keys(DEFAULT_CONTENT) as ContentKey[];

/** Definerte bildeslots admin kan bytte. */
export const IMAGE_SLOTS = [
  { key: "gallery-1", label: "Galleri #1", default: "/gallery/1.jpg" },
  { key: "gallery-2", label: "Galleri #2", default: "/gallery/2.jpg" },
  { key: "gallery-3", label: "Galleri #3", default: "/gallery/3.jpg" },
  { key: "gallery-4", label: "Galleri #4", default: "/gallery/4.jpg" },
] as const;
export type ImageSlot = (typeof IMAGE_SLOTS)[number]["key"];
