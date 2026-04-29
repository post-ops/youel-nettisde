import "server-only";
import { db } from "./db";
import {
  CONTENT_KEYS,
  DEFAULT_CONTENT,
  IMAGE_SLOTS,
  type ContentKey,
  type ImageSlot,
} from "./config";

/**
 * Hent alle redigerbare tekster — fyller på med standard-verdiene
 * fra config så komponenter alltid får en string.
 */
export async function getAllContent(): Promise<Record<ContentKey, string>> {
  const rows = await db.siteContent.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const result = {} as Record<ContentKey, string>;
  for (const k of CONTENT_KEYS) {
    result[k] = map[k] ?? DEFAULT_CONTENT[k];
  }
  return result;
}

export async function getContent(key: ContentKey): Promise<string> {
  const row = await db.siteContent.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_CONTENT[key];
}

/** Hent alle bilde-slot-URLer (fallback til defaults i public/). */
export async function getAllImages(): Promise<Record<ImageSlot, string>> {
  const rows = await db.siteImage.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.slot, r.url]));
  const result = {} as Record<ImageSlot, string>;
  for (const s of IMAGE_SLOTS) {
    result[s.key] = map[s.key] ?? s.default;
  }
  return result;
}

export async function getImage(slot: ImageSlot): Promise<string> {
  const row = await db.siteImage.findUnique({ where: { slot } });
  const fallback = IMAGE_SLOTS.find((s) => s.key === slot)?.default ?? "";
  return row?.url ?? fallback;
}
