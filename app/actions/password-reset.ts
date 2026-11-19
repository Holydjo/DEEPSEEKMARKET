"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  createPasswordResetToken,
  findValidResetToken,
  hashResetToken,
} from "@/lib/password-reset";
import { getLocale, localeForUser } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { queueEmail, siteUrl } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import type { ActionState } from "@/lib/types";

export async function requestPasswordResetAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email() })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: translate(locale, "auth.resetInvalid") };
  }

  const ip = await getClientIp();
  const limit = rateLimit(`password-reset:${ip}`, 4, 15 * 60_000);
  if (!limit.allowed) {
    return { error: translate(locale, "auth.tooMany") };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  if (user) {
    const userLocale = localeForUser(user, locale);
    const { token } = await createPasswordResetToken(user.id);
    const url = siteUrl(`/reset-password?token=${encodeURIComponent(token)}`);

    await queueEmail({
      to: user.email,
      subject: translate(userLocale, "email.reset.subject"),
      body: translate(userLocale, "email.reset.body", {
        name: user.name,
        url,
      }),
      template: "PASSWORD_RESET",
      locale: userLocale,
    });
  }

  // Never reveal whether the email exists.
  return { success: translate(locale, "auth.resetSent") };
}

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
  confirm: z.string().min(8),
});

export async function resetPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      error: translate(
        locale,
        parsed.error.issues.some((issue) => issue.path.includes("password"))
          ? "auth.passwordShort"
          : "auth.resetInvalid",
      ),
    };
  }

  if (parsed.data.password !== parsed.data.confirm) {
    return { error: translate(locale, "auth.passwordMismatch") };
  }

  const ip = await getClientIp();
  const limit = rateLimit(`password-reset-confirm:${ip}`, 8, 15 * 60_000);
  if (!limit.allowed) {
    return { error: translate(locale, "auth.tooMany") };
  }

  const reset = await findValidResetToken(parsed.data.token);
  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) {
    return { error: translate(locale, "auth.resetInvalid") };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.$transaction([
    db.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date(), tokenHash: hashResetToken(`${reset.id}-used`) },
    }),
    db.session.deleteMany({ where: { userId: reset.userId } }),
  ]);

  redirect("/login?reset=success");
}
