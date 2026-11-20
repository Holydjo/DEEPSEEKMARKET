import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/** Cookie-based language switch that works without client JavaScript. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const url = new URL(request.url);
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const proto = forwardedProto ?? url.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.host;
  const origin = `${proto}://${host}`;

  if (!isLocale(locale)) {
    return NextResponse.redirect(new URL("/", origin));
  }

  let next = "/";
  const requested = url.searchParams.get("next");
  if (requested?.startsWith("/") && !requested.startsWith("//")) {
    next = requested;
  } else {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const from = new URL(referer);
        if (from.origin === origin) next = `${from.pathname}${from.search}`;
      } catch {
        // Ignore malformed referers and fall back to home.
      }
    }
  }

  const secure = proto === "https";

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure,
  });

  const user = await getCurrentUser();
  if (user) {
    await db.user
      .update({ where: { id: user.id }, data: { locale } })
      .catch(() => undefined);
  }

  return NextResponse.redirect(new URL(next, origin));
}
