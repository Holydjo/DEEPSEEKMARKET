import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { translate, type MessageKey } from "./dictionary";

/**
 * Resolve the current locale:
 * 1. explicit cookie set by the language switcher,
 * 2. the browser's Accept-Language preference,
 * 3. English.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const accept = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  if (/(^|,|\s)fr(-|,|;|\s|$)/.test(accept)) return "fr";

  return DEFAULT_LOCALE;
});

export function localeForUser(
  user: { locale?: string | null } | null | undefined,
  fallback: Locale,
): Locale {
  return isLocale(user?.locale) ? user.locale : fallback;
}

export async function getTranslator(): Promise<{
  locale: Locale;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}> {
  const locale = await getLocale();
  return {
    locale,
    t: (key, vars) => translate(locale, key, vars),
  };
}
