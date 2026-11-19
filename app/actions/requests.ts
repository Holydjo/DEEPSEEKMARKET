"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, localeForUser } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import {
  notifyUser,
  queueEmail,
  windowLabel,
} from "@/lib/notifications";
import { formatDateForLocale, todayInToronto } from "@/lib/format";
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
    include: {
      services: { where: { isActive: true } },
      user: { select: { id: true, email: true, locale: true } },
    },
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

  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const providerLocale = localeForUser(provider.user, locale);
  const serviceName =
    provider.services.find((item) => item.id === serviceId)?.name ?? "service";

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

  await notifyUser({
    userId: provider.user.id,
    locale: provider.user.locale,
    type: "BOOKING_CREATED",
    titleKey: "notifications.newRequest.title",
    bodyKey: "notifications.newRequest.body",
    vars: {
      customer: parsed.data.name,
      service: serviceName,
      date: formatDateForLocale(preferredDate, providerLocale),
      window: windowLabel(providerLocale, parsed.data.preferredWindow),
    },
    href: "/provider/dashboard/requests",
    email: provider.email,
  });

  const customerVars = {
    provider: provider.displayName,
    service: serviceName,
    date: formatDateForLocale(preferredDate, locale),
    window: windowLabel(locale, parsed.data.preferredWindow),
    reference: request.reference,
  };

  if (user) {
    await notifyUser({
      userId: user.id,
      locale: user.locale,
      type: "BOOKING_SENT",
      titleKey: "notifications.requestSent.title",
      bodyKey: "notifications.requestSent.body",
      vars: customerVars,
      href: `/requests/${request.reference}`,
      email: parsed.data.email,
    });
  } else {
    await queueEmail({
      to: parsed.data.email,
      subject: translate(locale, "notifications.requestSent.title"),
      body: translate(locale, "notifications.requestSent.body", customerVars),
      template: "BOOKING_RECEIVED_CUSTOMER",
      locale,
      href: `/requests/${request.reference}`,
    });
  }

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
    include: { user: { select: { id: true, email: true, locale: true } } },
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

  await notifyUser({
    userId: provider.user.id,
    locale: provider.user.locale,
    type: "REVIEW_RECEIVED",
    titleKey: "notifications.review.title",
    bodyKey: "notifications.review.body",
    vars: { customer: user.name, rating: parsed.data.rating },
    href: "/provider/dashboard/reviews",
    email: provider.email,
  });

  revalidatePath(`/providers/${parsed.data.slug}`);
  redirect(`/providers/${parsed.data.slug}?review=success`);
}

const lifecycleSchema = z.object({
  reference: z.string().trim().min(4),
});

export async function cancelBookingRequestAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const parsed = lifecycleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: translate(locale, "booking.notFound") };

  const ip = await getClientIp();
  const limit = rateLimit(`request-cancel:${parsed.data.reference}:${ip}`, 6, 15 * 60_000);
  if (!limit.allowed) return { error: translate(locale, "auth.tooMany") };

  const request = await db.bookingRequest.findUnique({
    where: { reference: parsed.data.reference },
    include: {
      service: { select: { name: true } },
      provider: {
        include: { user: { select: { id: true, email: true, locale: true } } },
      },
    },
  });

  if (!request) return { error: translate(locale, "booking.notFound") };
  if (!["PENDING", "ACCEPTED"].includes(request.status)) {
    return { error: translate(locale, "booking.cancelUnavailable") };
  }

  await db.bookingRequest.update({
    where: { id: request.id },
    data: { status: "CANCELLED", respondedAt: new Date() },
  });

  const providerLocale = localeForUser(request.provider.user, locale);
  await notifyUser({
    userId: request.provider.user.id,
    locale: request.provider.user.locale,
    type: "BOOKING_CANCELLED_BY_CUSTOMER",
    titleKey: "notifications.requestCancelled.title",
    bodyKey: "notifications.requestCancelled.body",
    vars: {
      customer: request.name,
      service: request.service?.name ?? "service",
      date: formatDateForLocale(request.preferredDate, providerLocale),
      window: windowLabel(providerLocale, request.preferredWindow),
    },
    href: "/provider/dashboard/requests",
    email: request.provider.email,
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/dashboard/requests");
  revalidatePath("/account");
  revalidatePath(`/requests/${request.reference}`);
  redirect(`/requests/${request.reference}?cancelled=1`);
}

const rescheduleSchema = z.object({
  reference: z.string().trim().min(4),
  preferredDate: z.string().min(8),
  preferredWindow: z.enum(PREFERRED_WINDOWS),
});

export async function rescheduleBookingRequestAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const parsed = rescheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: translate(locale, "booking.invalidDate") };

  const ip = await getClientIp();
  const limit = rateLimit(`request-reschedule:${parsed.data.reference}:${ip}`, 6, 15 * 60_000);
  if (!limit.allowed) return { error: translate(locale, "auth.tooMany") };

  const date = new Date(`${parsed.data.preferredDate}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || parsed.data.preferredDate < todayInToronto()) {
    return { error: translate(locale, "booking.invalidDate") };
  }

  const request = await db.bookingRequest.findUnique({
    where: { reference: parsed.data.reference },
    include: {
      service: { select: { name: true } },
      provider: {
        include: { user: { select: { id: true, email: true, locale: true } } },
      },
    },
  });

  if (!request) return { error: translate(locale, "booking.notFound") };
  if (!["PENDING", "ACCEPTED"].includes(request.status)) {
    return { error: translate(locale, "booking.rescheduleUnavailable") };
  }

  await db.bookingRequest.update({
    where: { id: request.id },
    data: {
      preferredDate: date,
      preferredWindow: parsed.data.preferredWindow,
      status: "PENDING",
      respondedAt: null,
      providerNote: null,
    },
  });

  const providerLocale = localeForUser(request.provider.user, locale);
  await notifyUser({
    userId: request.provider.user.id,
    locale: request.provider.user.locale,
    type: "BOOKING_RESCHEDULED",
    titleKey: "notifications.requestRescheduled.title",
    bodyKey: "notifications.requestRescheduled.body",
    vars: {
      customer: request.name,
      service: request.service?.name ?? "service",
      date: formatDateForLocale(date, providerLocale),
      window: windowLabel(providerLocale, parsed.data.preferredWindow),
    },
    href: "/provider/dashboard/requests",
    email: request.provider.email,
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/dashboard/requests");
  revalidatePath("/account");
  revalidatePath(`/requests/${request.reference}`);
  redirect(`/requests/${request.reference}?rescheduled=1`);
}
