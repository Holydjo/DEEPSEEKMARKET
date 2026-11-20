import "server-only";

import { headers } from "next/headers";

/**
 * Browsers send Origin on server-action POSTs. Use it to decide whether a
 * cookie can be Secure: a production build opened over plain HTTP on a LAN
 * address must still be able to store the locale/session cookie.
 */
export async function isSecureRequest(): Promise<boolean> {
  const store = await headers();
  const origin = store.get("origin");
  if (origin) return origin.startsWith("https://");

  const forwarded = store.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";

  return (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_INSECURE_COOKIES !== "1"
  );
}
