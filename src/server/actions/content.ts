"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONTENT_KEYS, IMAGE_SLOTS, type ContentKey, type ImageSlot } from "@/lib/config";

export async function saveContent(
  updates: Partial<Record<ContentKey, string>>,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const ops = Object.entries(updates)
    .filter(([k]) => CONTENT_KEYS.includes(k as ContentKey))
    .map(([key, value]) =>
      db.siteContent.upsert({
        where: { key },
        update: { value: value ?? "" },
        create: { key, value: value ?? "" },
      }),
    );

  await db.$transaction(ops);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setImage(
  slot: ImageSlot,
  url: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const valid = IMAGE_SLOTS.some((s) => s.key === slot);
  if (!valid) return { ok: false, error: "Ugyldig bilde-slot" };

  await db.siteImage.upsert({
    where: { slot },
    update: { url },
    create: { slot, url },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function resetImage(
  slot: ImageSlot,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };
  await db.siteImage.deleteMany({ where: { slot } });
  revalidatePath("/", "layout");
  return { ok: true };
}
