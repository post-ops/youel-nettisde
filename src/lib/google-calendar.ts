import "server-only";
import { google, type calendar_v3 } from "googleapis";
import { TIMEZONE } from "./config";

function getCalendarClient(): calendar_v3.Calendar | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) return null;

  // Private key kan komme escaped (\n) fra .env — normaliser.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

function getCalendarId(): string | null {
  return process.env.GOOGLE_CALENDAR_ID || null;
}

export type CreateEventInput = {
  summary: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
};

/**
 * Oppretter en hendelse i frisørens Google Kalender.
 * Returnerer `null` hvis Google-konfig mangler (graceful no-op i dev).
 */
export async function createCalendarEvent(
  input: CreateEventInput,
): Promise<string | null> {
  const cal = getCalendarClient();
  const calendarId = getCalendarId();
  if (!cal || !calendarId) {
    console.warn(
      "[google-calendar] Mangler config — hopper over kalender-sync",
    );
    return null;
  }

  const res = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startsAt.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: input.endsAt.toISOString(), timeZone: TIMEZONE },
    },
  });

  return res.data.id ?? null;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const cal = getCalendarClient();
  const calendarId = getCalendarId();
  if (!cal || !calendarId) return;

  try {
    await cal.events.delete({ calendarId, eventId });
  } catch (err) {
    console.error("[google-calendar] delete feilet:", err);
  }
}
