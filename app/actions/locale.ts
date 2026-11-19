"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const user = await getCurrentUser();
  if (user) {
    await db.user
      .update({ where: { id: user.id }, data: { locale } })
      .catch(() => undefined);
  }

  revalidatePath("/", "layout");
}
