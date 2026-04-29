"use server";

import { addMinutes } from "date-fns";
import { db } from "@/lib/db";
import { bookingInput } from "@/lib/validators";
import { isSlotAvailable } from "@/lib/slots";
import { findService, SLOT_MINUTES } from "@/lib/config";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/google-calendar";
import {
  sendCustomerConfirmation,
  sendOwnerNotification,
} from "@/lib/email";

export type CreateBookingState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function createBooking(
  raw: unknown,
): Promise<CreateBookingState> {
  const parsed = bookingInput.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Ugyldig input",
    };
  }
  const data = parsed.data;
  const service = findService(data.serviceId);
  const startsAt =
    typeof data.startsAt === "string" ? new Date(data.startsAt) : data.startsAt;
  const endsAt = addMinutes(startsAt, SLOT_MINUTES);

  if (!(await isSlotAvailable(startsAt))) {
    return { ok: false, error: "Tidspunktet er dessverre ikke ledig lenger" };
  }

  // Opprett booking inni en transaksjon med en ekstra konflikt-sjekk for å
  // håndtere race conditions (to brukere som booker samme slot samtidig).
  const booking = await db.$transaction(async (tx) => {
    const conflict = await tx.booking.findFirst({
      where: {
        status: "CONFIRMED",
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });
    if (conflict) throw new Error("SLOT_TAKEN");
    return tx.booking.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        serviceId: service.id,
        servicePrice: service.priceNok,
        startsAt,
        endsAt,
        notes: data.notes ?? null,
      },
    });
  }).catch((err: Error) => {
    if (err.message === "SLOT_TAKEN") return null;
    throw err;
  });

  if (!booking) {
    return { ok: false, error: "Tidspunktet er dessverre ikke ledig lenger" };
  }

  // Google Calendar — feiler vi her, rull bookingen tilbake.
  let googleEventId: string | null = null;
  try {
    googleEventId = await createCalendarEvent({
      summary: `${service.name} – ${data.customerName}`,
      description: `${service.name} (${service.priceNok} kr)\n${data.customerPhone}\n${data.customerEmail}${
        data.notes ? `\n\nNotat: ${data.notes}` : ""
      }`,
      startsAt,
      endsAt,
    });
    if (googleEventId) {
      await db.booking.update({
        where: { id: booking.id },
        data: { googleEventId },
      });
    }
  } catch (err) {
    console.error("[createBooking] Google Calendar feilet:", err);
    await db.booking.delete({ where: { id: booking.id } });
    return {
      ok: false,
      error: "Kunne ikke synkronisere kalender. Prøv igjen om litt.",
    };
  }

  // E-post — gjør det "best effort" så vi ikke ruller tilbake på e-post-feil.
  const emailData = {
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    startsAt,
    endsAt,
    serviceName: service.name,
    servicePrice: service.priceNok,
  };
  try {
    await Promise.all([
      sendOwnerNotification(emailData),
      sendCustomerConfirmation(emailData),
    ]);
  } catch (err) {
    console.error("[createBooking] E-post feilet (booking består):", err);
  }

  return { ok: true, bookingId: booking.id };
}

export async function cancelBooking(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, error: "Bestillingen finnes ikke" };
  if (booking.status === "CANCELLED") return { ok: true };

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  if (booking.googleEventId) {
    await deleteCalendarEvent(booking.googleEventId);
  }

  // Send avbestillingsmail (best effort)
  try {
    const { sendCancellationEmail } = await import("@/lib/email");
    const service = findService(booking.serviceId);
    await sendCancellationEmail({
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      serviceName: service.name,
      servicePrice: booking.servicePrice,
    });
  } catch (err) {
    console.error("[cancelBooking] e-post feilet:", err);
  }

  return { ok: true };
}
