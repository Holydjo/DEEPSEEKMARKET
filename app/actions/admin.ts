"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ratingAfterHide, ratingAfterPublish } from "@/lib/reviews";

function revalidateProvider(providerId: string, slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${providerId}`);
  revalidatePath("/admin/providers");
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath(`/providers/${slug}`);
}

const actionSchema = z.object({
  providerId: z.string().min(1),
  note: z.string().trim().max(1200).optional(),
});

export async function approveProviderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/applications?error=invalid");

  const provider = await db.provider.findUnique({ where: { id: parsed.data.providerId } });
  if (!provider || (provider.status !== "PENDING" && provider.status !== "REJECTED")) {
    redirect("/admin/applications?error=state");
  }

  await db.$transaction([
    db.provider.update({
      where: { id: provider.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
        reviewNote: parsed.data.note || null,
        submittedAt: provider.submittedAt ?? new Date(),
      },
    }),
    db.adminAction.create({
      data: {
        adminUserId: admin.id,
        providerId: provider.id,
        action: "APPROVE",
        note: parsed.data.note || "Profile reviewed and approved.",
      },
    }),
  ]);

  revalidateProvider(provider.id, provider.slug);
  redirect(`/admin/applications/${provider.id}?done=approved`);
}

export async function rejectProviderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/applications?error=invalid");

  const note = parsed.data.note?.trim() ?? "";
  if (note.length < 5) {
    redirect(`/admin/applications/${parsed.data.providerId}?error=note`);
  }

  const provider = await db.provider.findUnique({ where: { id: parsed.data.providerId } });
  if (!provider || provider.status !== "PENDING") {
    redirect("/admin/applications?error=state");
  }

  await db.$transaction([
    db.provider.update({
      where: { id: provider.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
        reviewNote: note,
      },
    }),
    db.adminAction.create({
      data: {
        adminUserId: admin.id,
        providerId: provider.id,
        action: "REJECT",
        note,
      },
    }),
  ]);

  revalidateProvider(provider.id, provider.slug);
  redirect(`/admin/applications/${provider.id}?done=rejected`);
}

export async function moderateReviewAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      reviewId: z.string().min(1),
      status: z.enum(["PUBLISHED", "HIDDEN"]),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect("/admin/reviews?error=invalid");

  const review = await db.review.findUnique({
    where: { id: parsed.data.reviewId },
    include: {
      provider: {
        select: { id: true, slug: true, ratingAvg: true, ratingCount: true },
      },
    },
  });
  if (!review) redirect("/admin/reviews?error=notfound");
  if (review.status === parsed.data.status) redirect("/admin/reviews?done=same");

  const next =
    parsed.data.status === "HIDDEN"
      ? ratingAfterHide(review.provider.ratingAvg, review.provider.ratingCount, review.rating)
      : ratingAfterPublish(review.provider.ratingAvg, review.provider.ratingCount, review.rating);

  await db.$transaction([
    db.review.update({
      where: { id: review.id },
      data: { status: parsed.data.status },
    }),
    db.provider.update({
      where: { id: review.providerId },
      data: {
        ratingAvg: next.ratingAvg,
        ratingCount: next.ratingCount,
      },
    }),
    db.adminAction.create({
      data: {
        adminUserId: admin.id,
        providerId: review.providerId,
        action: parsed.data.status === "HIDDEN" ? "HIDE_REVIEW" : "PUBLISH_REVIEW",
        note: `Review ${review.id}`,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/providers");
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath(`/providers/${review.provider.slug}`);

  redirect(`/admin/reviews?done=${parsed.data.status === "HIDDEN" ? "hidden" : "published"}`);
}

export async function suspendProviderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/providers?error=invalid");

  const provider = await db.provider.findUnique({ where: { id: parsed.data.providerId } });
  if (!provider || provider.status !== "APPROVED") {
    redirect("/admin/providers?error=state");
  }

  await db.$transaction([
    db.provider.update({
      where: { id: provider.id },
      data: {
        status: "SUSPENDED",
        reviewNote: parsed.data.note || "Profile suspended pending review.",
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
      },
    }),
    db.adminAction.create({
      data: {
        adminUserId: admin.id,
        providerId: provider.id,
        action: "SUSPEND",
        note: parsed.data.note || null,
      },
    }),
  ]);

  revalidateProvider(provider.id, provider.slug);
  redirect(`/admin/providers?done=suspended`);
}

export async function reinstateProviderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/providers?error=invalid");

  const provider = await db.provider.findUnique({ where: { id: parsed.data.providerId } });
  if (!provider || provider.status !== "SUSPENDED") {
    redirect("/admin/providers?error=state");
  }

  await db.$transaction([
    db.provider.update({
      where: { id: provider.id },
      data: {
        status: "APPROVED",
        reviewNote: null,
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
      },
    }),
    db.adminAction.create({
      data: {
        adminUserId: admin.id,
        providerId: provider.id,
        action: "REINSTATE",
        note: parsed.data.note || "Profile reinstated.",
      },
    }),
  ]);

  revalidateProvider(provider.id, provider.slug);
  redirect(`/admin/providers?done=reinstated`);
}
