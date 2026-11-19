import "server-only";

import { randomBytes } from "node:crypto";
import { db } from "./db";
import { hashResetToken } from "./reset-token";

export { hashResetToken };

const RESET_TTL_MS = 60 * 60 * 1000;

/** Returns the raw token once; only its hash is stored. */
export async function createPasswordResetToken(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await db.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });
  await db.passwordResetToken.create({
    data: { userId, tokenHash: hashResetToken(token), expiresAt },
  });

  return { token, expiresAt };
}

export async function findValidResetToken(token: string) {
  if (!token || token.length < 20) return null;
  return db.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { user: { select: { id: true, name: true, email: true, locale: true } } },
  });
}
