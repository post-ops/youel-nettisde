import "server-only";
import { Resend } from "resend";
import { formatTz } from "./datetime";
import { BUSINESS } from "./config";

let cachedResend: Resend | null = null;
function getResend(): Resend | null {
  if (cachedResend) return cachedResend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cachedResend = new Resend(key);
  return cachedResend;
}

const FROM = process.env.FROM_EMAIL ?? "Molat Frisør <onboarding@resend.dev>";

type BookingEmailData = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startsAt: Date;
  endsAt: Date;
  serviceName: string;
  servicePrice: number;
};

export async function sendOwnerNotification(b: BookingEmailData): Promise<void> {
  const resend = getResend();
  const owner = process.env.OWNER_EMAIL;
  if (!resend || !owner) {
    console.warn("[email] Mangler RESEND_API_KEY eller OWNER_EMAIL — hopper over varsel");
    return;
  }

  const dato = formatTz(b.startsAt, "EEEE d. MMMM yyyy");
  const tid = `${formatTz(b.startsAt, "HH:mm")}–${formatTz(b.endsAt, "HH:mm")}`;

  await resend.emails.send({
    from: FROM,
    to: owner,
    subject: `Ny booking — ${b.customerName} ${dato} ${formatTz(b.startsAt, "HH:mm")}`,
    html: ownerHtml(b, dato, tid),
  });
}

export async function sendCustomerConfirmation(b: BookingEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const dato = formatTz(b.startsAt, "EEEE d. MMMM yyyy");
  const tid = `${formatTz(b.startsAt, "HH:mm")}–${formatTz(b.endsAt, "HH:mm")}`;

  await resend.emails.send({
    from: FROM,
    to: b.customerEmail,
    subject: `Bekreftelse — time hos ${BUSINESS.name} ${dato}`,
    html: customerHtml(b, dato, tid),
  });
}

export async function sendCancellationEmail(b: BookingEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const dato = formatTz(b.startsAt, "EEEE d. MMMM yyyy");
  const tid = formatTz(b.startsAt, "HH:mm");

  await resend.emails.send({
    from: FROM,
    to: b.customerEmail,
    subject: `Avbestilt — time hos ${BUSINESS.name} ${dato}`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:auto;padding:32px;color:#1a1d2e">
        <h2 style="margin:0 0 16px;font-family:'Playfair Display',serif">${BUSINESS.name}</h2>
        <p>Hei ${b.customerName},</p>
        <p>Din time <strong>${dato} kl. ${tid}</strong> (${b.serviceName}) er avbestilt. Vi setter pris på at du ga oss beskjed.</p>
        <p>Velkommen tilbake — du kan booke ny time når som helst.</p>
        <p style="margin-top:24px;color:#6b6b6b;font-size:13px">${BUSINESS.tagline}</p>
      </div>
    `,
  });
}

function ownerHtml(b: BookingEmailData, dato: string, tid: string) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:auto;padding:32px;color:#1a1d2e">
      <h2 style="margin:0 0 16px;font-family:'Playfair Display',serif">Ny booking</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b6b6b">Kunde</td><td style="padding:8px 0;font-weight:600">${b.customerName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b">Telefon</td><td style="padding:8px 0">${b.customerPhone}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b">E-post</td><td style="padding:8px 0">${b.customerEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b">Tjeneste</td><td style="padding:8px 0;font-weight:600">${b.serviceName} (${b.servicePrice} kr)</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b">Dato</td><td style="padding:8px 0;font-weight:600">${dato}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b">Tid</td><td style="padding:8px 0;font-weight:600">${tid}</td></tr>
      </table>
      <p style="margin-top:24px;color:#6b6b6b;font-size:13px">Synkronisert til Google Kalender automatisk.</p>
    </div>
  `;
}

function customerHtml(b: BookingEmailData, dato: string, tid: string) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:auto;padding:32px;color:#1a1d2e">
      <h2 style="margin:0 0 8px;font-family:'Playfair Display',serif">Takk for bookingen!</h2>
      <p style="margin:0 0 24px;color:#6b6b6b">${BUSINESS.tagline}</p>
      <p>Hei ${b.customerName},</p>
      <p>Vi gleder oss til å se deg <strong>${dato}</strong> kl. <strong>${tid}</strong>.</p>
      <div style="background:#f5efe3;border-radius:12px;padding:16px;margin:20px 0">
        <div style="font-size:13px;color:#6b6b6b;margin-bottom:4px">Din time</div>
        <div style="font-size:18px;font-weight:600">${b.serviceName}</div>
        <div style="font-size:14px;color:#6b6b6b">${dato} · ${tid} · ${b.servicePrice} kr</div>
      </div>
      <p>Trenger du å avbestille? Ring oss på ${BUSINESS.phone}.</p>
      <p style="margin-top:24px;color:#6b6b6b;font-size:13px">— ${BUSINESS.name}</p>
    </div>
  `;
}
