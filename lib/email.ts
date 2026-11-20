import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { db } from "./db";

export type EmailTransportMode = "resend" | "smtp" | "none";

export function emailTransportMode(): EmailTransportMode {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "none";
}

export function emailFrom(): string {
  return (
    process.env.EMAIL_FROM ??
    process.env.SMTP_FROM ??
    "HOLYDO MARKET <hello@holydo.market>"
  );
}

let smtp: Transporter | null = null;

function smtpTransport(): Transporter {
  if (!smtp) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    smtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "1" || port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return smtp;
}

async function sendViaResend(email: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: [email.to],
      subject: email.subject,
      text: email.body,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(`Resend ${response.status}: ${details}`);
  }
}

async function sendViaSmtp(email: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  await smtpTransport().sendMail({
    from: emailFrom(),
    to: email.to,
    subject: email.subject,
    text: email.body,
  });
}

/**
 * Attempt delivery for a queued/failed outbox row. Never throws: a failed send
 * is recorded on the row so the booking/reset flow can continue and an admin
 * can retry it later.
 */
export async function deliverEmail(
  id: string,
): Promise<"SENT" | "FAILED" | "QUEUED" | "MISSING"> {
  const email = await db.emailMessage.findUnique({ where: { id } });
  if (!email) return "MISSING";
  if (email.status === "SENT") return "SENT";

  const mode = emailTransportMode();
  if (mode === "none") return "QUEUED";

  try {
    if (mode === "resend") {
      await sendViaResend(email);
    } else {
      await sendViaSmtp(email);
    }
    await db.emailMessage.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), error: null },
    });
    return "SENT";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.emailMessage.update({
      where: { id },
      data: { status: "FAILED", error: message.slice(0, 500) },
    });
    return "FAILED";
  }
}

export async function deliverPendingEmails(limit = 25): Promise<{
  sent: number;
  failed: number;
  queued: number;
}> {
  const emails = await db.emailMessage.findMany({
    where: { status: { in: ["QUEUED", "FAILED"] } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  const counts = { sent: 0, failed: 0, queued: 0 };
  for (const email of emails) {
    const result = await deliverEmail(email.id);
    if (result === "SENT") counts.sent += 1;
    else if (result === "FAILED") counts.failed += 1;
    else counts.queued += 1;
  }
  return counts;
}
