import "server-only";

import { db } from "./db";
import { isLocale, type Locale } from "./i18n/config";
import { translate, type MessageKey } from "./i18n/dictionary";

export type MessageVars = Record<string, string | number>;

export function siteUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export function windowLabel(locale: Locale, window: string): string {
  const key = `window.${window}` as MessageKey;
  return translate(locale, key);
}

function resolveLocale(locale?: string | null): Locale {
  return isLocale(locale) ? locale : "en";
}

/**
 * Record a queued email. No SMTP provider is configured in the demo, so the
 * message is visible in /admin/emails and can be sent by a worker later.
 */
export async function queueEmail(input: {
  to: string;
  subject: string;
  body: string;
  template: string;
  locale: Locale;
  href?: string;
}): Promise<void> {
  const link = input.href
    ? `\n\n${translate(input.locale, "email.cta", { url: siteUrl(input.href) })}`
    : "";
  const body = `${input.body}${link}\n\n${translate(input.locale, "email.signature")}`;

  await db.emailMessage.create({
    data: {
      to: input.to,
      subject: input.subject,
      body,
      template: input.template,
      status: "QUEUED",
    },
  });
}

export async function notifyUser(input: {
  userId: string;
  locale?: string | null;
  type: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  vars?: MessageVars;
  href?: string;
  email?: string;
}): Promise<void> {
  const locale = resolveLocale(input.locale);
  const title = translate(locale, input.titleKey, input.vars);
  const body = translate(locale, input.bodyKey, input.vars);

  await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title,
      body,
      href: input.href,
    },
  });

  if (input.email) {
    await queueEmail({
      to: input.email,
      subject: title,
      body,
      template: input.type,
      locale,
      href: input.href,
    });
  }
}

export async function notifyAdmins(input: {
  type: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
  vars?: MessageVars;
  href?: string;
  email?: boolean;
}): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, locale: true },
  });

  await Promise.all(
    admins.map((admin) =>
      notifyUser({
        userId: admin.id,
        locale: admin.locale,
        type: input.type,
        titleKey: input.titleKey,
        bodyKey: input.bodyKey,
        vars: input.vars,
        href: input.href,
        email: input.email ? admin.email : undefined,
      }),
    ),
  );
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, readAt: null } });
}
