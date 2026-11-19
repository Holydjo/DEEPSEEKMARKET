"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PREFERRED_WINDOWS } from "@/lib/constants";
import { reference } from "@/lib/slug";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { ratingAfterPublish } from "@/lib/reviews";
import type { ActionState } from "@/lib/types";

const bookingSchema = z.object({
  providerId: z.string().min(1),
  serviceId: z.string().optional(),
  preferredDate: z.string().min(8, "Choose a preferred date."),
  preferredWindow: z.enum(PREFERRED_WINDOWS),
  name: z.string().trim().min(2, "Tell the provider your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a phone number the provider can reach you on."),
  message: z.string().trim().max(1200).optional(),
});

export async function createBookingRequest(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your request and try again." };
  }

  const ip = await getClientIp();
  const limit = rateLimit(`booking:${ip}`, 8, 10 * 60_000);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
    return { error: `Too many requests from this connection. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const provider = await db.provider.findFirst({
    where: { id: parsed.data.providerId, status: "APPROVED" },
    include: { services: { where: { isActive: true } } },
  });
  if (!provider) {
    return { error: "This provider is not accepting requests right now." };
  }

  let serviceId: string | undefined;
  if (parsed.data.serviceId) {
    const service = provider.services.find((item) => item.id === parsed.data.serviceId);
    if (!service) return { error: "Choose one of the provider’s current services." };
    serviceId = service.id;
  }

  const preferredDate = new Date(`${parsed.data.preferredDate}T12:00:00.000Z`);
  if (Number.isNaN(preferredDate.getTime())) {
    return { error: "Choose a valid preferred date." };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (preferredDate < today) {
    return { error: "Choose a date in the future." };
  }

  const user = await getCurrentUser();

  const request = await db.bookingRequest.create({
    data: {
      reference: reference(),
      providerId: provider.id,
      serviceId,
      customerUserId: user?.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferredDate,
      preferredWindow: parsed.data.preferredWindow,
      message: parsed.data.message || null,
      status: "PENDING",
    },
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/dashboard/requests");
  redirect(`/requests/${request.reference}?new=1`);
}

const reviewSchema = z.object({
  providerId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Add a little detail so the review is useful.").max(1200),
});

export async function createReview(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Log in to leave a review." };
  }

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your review and try again." };
  }

  const ip = await getClientIp();
  const limit = rateLimit(`review:${user.id}:${ip}`, 5, 10 * 60_000);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
    return { error: `Too many reviews from this connection. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const provider = await db.provider.findFirst({
    where: { id: parsed.data.providerId, status: "APPROVED" },
  });
  if (!provider) return { error: "This provider cannot be reviewed right now." };

  const existing = await db.review.findUnique({
    where: {
      providerId_authorUserId: {
        providerId: provider.id,
        authorUserId: user.id,
      },
    },
  });
  if (existing) return { error: "You’ve already reviewed this provider." };

  const completed = await db.bookingRequest.findFirst({
    where: {
      providerId: provider.id,
      customerUserId: user.id,
      status: "COMPLETED",
      review: null,
    },
    orderBy: { createdAt: "desc" },
  });

  const nextRating = ratingAfterPublish(
    provider.ratingAvg,
    provider.ratingCount,
    parsed.data.rating,
  );

  await db.$transaction([
    db.review.create({
      data: {
        providerId: provider.id,
        authorUserId: user.id,
        bookingRequestId: completed?.id,
        rating: parsed.data.rating,
        body: parsed.data.body,
        isVerified: Boolean(completed),
      },
    }),
    db.provider.update({
      where: { id: provider.id },
      data: { ratingAvg: nextRating.ratingAvg, ratingCount: nextRating.ratingCount },
    }),
  ]);

  revalidatePath(`/providers/${parsed.data.slug}`);
  redirect(`/providers/${parsed.data.slug}?review=success`);
}
