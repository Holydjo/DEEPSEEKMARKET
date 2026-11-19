import "server-only";

import { db } from "./db";

/** Provider IDs the user has saved. Returns an empty set for guests. */
export async function getSavedProviderIds(
  userId: string | null | undefined,
): Promise<Set<string>> {
  if (!userId) return new Set();

  const rows = await db.savedProvider.findMany({
    where: { userId },
    select: { providerId: true },
  });

  return new Set(rows.map((row) => row.providerId));
}
