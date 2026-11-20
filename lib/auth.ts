import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Provider } from "@prisma/client";
import { db } from "./db";
import { isSecureRequest } from "./request-protocol";

const SESSION_COOKIE = "holydo_session";
const SESSION_DAYS = 30;
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  const store = await cookies();
  const secure = await isSecureRequest();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  locale: string;
  provider: { id: string; slug: string; status: string; displayName: string } | null;
};

/**
 * Reads the session cookie and returns the user. Cached per request so a page
 * can call it from several server components without extra queries.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          locale: true,
          provider: {
            select: { id: true, slug: true, status: true, displayName: true },
          },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  return session.user;
});

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function requireUser(nextPath = "/account"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

export async function requireProvider(): Promise<{
  user: SessionUser;
  provider: Provider;
}> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/provider/dashboard");
  if (!user.provider) redirect("/provider/join");

  const provider = await db.provider.findUnique({ where: { userId: user.id } });
  if (!provider) redirect("/provider/join");

  return { user, provider };
}
