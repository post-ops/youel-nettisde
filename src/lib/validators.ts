import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import { SERVICES } from "./config";

const phone = z
  .string()
  .min(1, "Telefon er påkrevd")
  .refine((v) => isValidPhoneNumber(v, "NO"), {
    message: "Ugyldig telefonnummer",
  })
  .transform((v) => parsePhoneNumberFromString(v, "NO")?.number ?? v);

const serviceIds = SERVICES.map((s) => s.id) as [string, ...string[]];

export const bookingInput = z.object({
  customerName: z.string().trim().min(2, "Navn må være minst 2 tegn").max(80),
  customerPhone: phone,
  customerEmail: z.string().trim().toLowerCase().email("Ugyldig e-post"),
  serviceId: z.enum(serviceIds, { message: "Ugyldig tjeneste" }),
  startsAt: z
    .string()
    .datetime({ message: "Ugyldig dato/tid" })
    .or(z.date()),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingInput>;

export const blockInput = z.object({
  startsAt: z.string().datetime().or(z.date()),
  endsAt: z.string().datetime().or(z.date()),
  reason: z.string().max(200).optional(),
});

export type BlockInput = z.infer<typeof blockInput>;

export const adminLoginInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
