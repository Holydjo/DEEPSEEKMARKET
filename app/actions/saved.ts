"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export type SaveResult = {
  saved?: boolean;
  error?: "AUTH" | "UNAVAILABLE" | "UNKNOWN";
};

/**
 * Toggle a saved provider for the current user. Saved providers are private;
 * only the customer sees their own list at /saved.
 */
export async function toggleSavedProviderAction(
  providerId: string,
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH" };

  const provider = await db.provider.findFirst({
    where: { id: providerId, status: "APPROVED" },
    select: { id: true },
  });
  if (!provider) return { error: "UNAVAILABLE" };

  try {
    const existing = await db.savedProvider.findUnique({
      where: {
        userId_providerId: { userId: user.id, providerId: provider.id },
      },
    });

    if (existing) {
      await db.savedProvider.delete({ where: { id: existing.id } });
      revalidatePath("/saved");
      revalidatePath("/account");
      return { saved: false };
    }

    await db.savedProvider.create({
      data: { userId: user.id, providerId: provider.id },
    });
    revalidatePath("/saved");
    revalidatePath("/account");
    return { saved: true };
  } catch {
    return { error: "UNKNOWN" };
  }
}
