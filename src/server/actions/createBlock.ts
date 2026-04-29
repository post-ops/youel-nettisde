"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockInput } from "@/lib/validators";
import { fromZonedTime } from "date-fns-tz";
import { TIMEZONE } from "@/lib/config";

export async function createBlock(input: {
  startsAt: string;
  endsAt: string;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" } as const;

  const parsed = blockInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig" } as const;
  }

  const startsAt =
    typeof parsed.data.startsAt === "string"
      ? new Date(parsed.data.startsAt)
      : parsed.data.startsAt;
  const endsAt =
    typeof parsed.data.endsAt === "string"
      ? new Date(parsed.data.endsAt)
      : parsed.data.endsAt;

  if (endsAt <= startsAt) {
    return { ok: false, error: "Slutt-tidspunkt må være etter start" } as const;
  }

  await db.block.create({
    data: { startsAt, endsAt, reason: parsed.data.reason ?? null },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/blocks");
  return { ok: true } as const;
}

export async function blockWholeDay(localDate: string, reason?: string) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" } as const;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return { ok: false, error: "Ugyldig dato" } as const;
  }
  const startsAt = fromZonedTime(`${localDate}T00:00:00`, TIMEZONE);
  const endsAt = fromZonedTime(`${localDate}T23:59:59`, TIMEZONE);
  await db.block.create({
    data: { startsAt, endsAt, reason: reason ?? "Stengt" },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/blocks");
  return { ok: true } as const;
}

export async function deleteBlock(id: string) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" } as const;
  await db.block.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/blocks");
  return { ok: true } as const;
}

export async function adminCancelBooking(id: string) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" } as const;
  const { cancelBooking } = await import("./createBooking");
  const res = await cancelBooking(id);
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  return res;
}
