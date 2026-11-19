"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireProvider } from "@/lib/auth";
import { getNeighbourhood, getCity } from "@/lib/location";
import type { ActionState } from "@/lib/types";

function withSaved(path: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}saved=1`;
}

function resolveReturnTo(formData: FormData, fallback: string): string {
  const raw = String(formData.get("returnTo") ?? "");
  return raw.startsWith("/provider/") && !raw.startsWith("//") ? raw : fallback;
}

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "1";
}

export async function saveBusinessStep(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();

  const parsed = z
    .object({
      type: z.enum(["INDEPENDENT", "BUSINESS"]),
      displayName: z.string().trim().min(2, "Add a public display name.").max(60),
      categoryId: z.string().min(1, "Choose a main category."),
      tagline: z.string().trim().max(90).optional(),
      about: z
        .string()
        .trim()
        .min(80, "Write at least 80 characters about you and your work.")
        .max(1200),
      city: z.string().min(1),
      hood: z.string().min(1, "Choose a neighbourhood."),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };
  }

  const servesAtHome = checkbox(formData, "servesAtHome");
  const servesAtSalon = checkbox(formData, "servesAtSalon");
  const servesAtShop = checkbox(formData, "servesAtShop");
  const travelsToClient = checkbox(formData, "travelsToClient");
  if (!servesAtHome && !servesAtSalon && !servesAtShop && !travelsToClient) {
    return { error: "Choose at least one place where you welcome clients." };
  }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "Choose a valid category." };

  const hood = getNeighbourhood(parsed.data.city, parsed.data.hood);
  if (!hood) return { error: "Choose a neighbourhood from the list." };

  await db.provider.update({
    where: { id: provider.id },
    data: {
      type: parsed.data.type,
      displayName: parsed.data.displayName,
      categoryId: category.id,
      tagline: parsed.data.tagline || null,
      about: parsed.data.about,
      city: getCity(parsed.data.city)?.name ?? "Montréal",
      neighbourhood: hood.name,
      lat: hood.lat,
      lng: hood.lng,
      servesAtHome,
      servesAtSalon,
      servesAtShop,
      travelsToClient,
    },
  });

  revalidatePath("/provider/onboarding");
  redirect("/provider/onboarding?step=services&saved=1");
}

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Give the service a name.").max(80),
  description: z.string().trim().max(400).optional(),
  price: z.coerce.number().min(1, "Set a price of at least $1.").max(20_000),
  priceType: z.enum(["FIXED", "FROM", "HOURLY"]),
  durationMin: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(5).max(1440).optional(),
  ),
});

export async function addServiceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  const returnTo = resolveReturnTo(formData, "/provider/onboarding?step=services");

  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the service details." };
  }

  const count = await db.service.count({ where: { providerId: provider.id } });
  await db.service.create({
    data: {
      providerId: provider.id,
      categoryId: provider.categoryId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      priceCents: Math.round(parsed.data.price * 100),
      priceType: parsed.data.priceType,
      durationMin: parsed.data.durationMin ?? null,
      sortOrder: count,
    },
  });

  revalidatePath("/provider/onboarding");
  revalidatePath("/provider/dashboard/services");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

export async function updateServiceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  const serviceId = String(formData.get("serviceId") ?? "");
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the service details." };
  }

  const service = await db.service.findFirst({
    where: { id: serviceId, providerId: provider.id },
  });
  if (!service) return { error: "That service could not be found." };

  await db.service.update({
    where: { id: service.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      priceCents: Math.round(parsed.data.price * 100),
      priceType: parsed.data.priceType,
      durationMin: parsed.data.durationMin ?? null,
      isActive: formData.get("isActive") === "1",
    },
  });

  revalidatePath("/provider/dashboard/services");
  revalidatePath(`/providers/${provider.slug}`);
  redirect("/provider/dashboard/services?saved=1");
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const { provider } = await requireProvider();
  const serviceId = String(formData.get("serviceId") ?? "");
  const returnTo = resolveReturnTo(formData, "/provider/onboarding?step=services");

  await db.service.deleteMany({ where: { id: serviceId, providerId: provider.id } });
  revalidatePath("/provider/onboarding");
  revalidatePath("/provider/dashboard/services");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadProviderPhotoAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  const returnTo = resolveReturnTo(formData, "/provider/onboarding?step=photos");

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (!ALLOWED_TYPES[file.type]) {
    return { error: "Use a JPG, PNG or WebP image." };
  }
  if (file.size > 6 * 1024 * 1024) {
    return { error: "Photos must be smaller than 6 MB." };
  }

  const count = await db.providerPhoto.count({ where: { providerId: provider.id } });
  if (count >= 8) {
    return { error: "You can upload up to 8 photos. Remove one before adding another." };
  }

  const extension = ALLOWED_TYPES[file.type];
  const filename = `provider-${provider.id}-${randomUUID()}.${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/${filename}`;
  await db.providerPhoto.create({
    data: {
      providerId: provider.id,
      url,
      alt: String(formData.get("alt") ?? "") || `${provider.displayName} — work photo`,
      sortOrder: count,
    },
  });
  if (!provider.coverUrl) {
    await db.provider.update({ where: { id: provider.id }, data: { coverUrl: url } });
  }

  revalidatePath("/provider/onboarding");
  revalidatePath("/provider/dashboard/profile");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

export async function deleteProviderPhotoAction(formData: FormData): Promise<void> {
  const { provider } = await requireProvider();
  const photoId = String(formData.get("photoId") ?? "");
  const returnTo = resolveReturnTo(formData, "/provider/onboarding?step=photos");

  const photo = await db.providerPhoto.findFirst({
    where: { id: photoId, providerId: provider.id },
  });
  if (photo) {
    await db.providerPhoto.delete({ where: { id: photo.id } });
    if (photo.url.startsWith("/uploads/")) {
      await unlink(join(process.cwd(), "public", photo.url)).catch(() => undefined);
    }
    if (provider.coverUrl === photo.url) {
      const next = await db.providerPhoto.findFirst({
        where: { providerId: provider.id },
        orderBy: { sortOrder: "asc" },
      });
      await db.provider.update({
        where: { id: provider.id },
        data: { coverUrl: next?.url ?? null },
      });
    }
  }

  revalidatePath("/provider/onboarding");
  revalidatePath("/provider/dashboard/profile");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

export async function saveLocationStep(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  const returnTo = resolveReturnTo(formData, "/provider/onboarding?step=hours");

  const parsed = z
    .object({
      addressLine: z.string().trim().min(5, "Add the private street address for verification.").max(160),
      city: z.string().min(1),
      hood: z.string().min(1, "Choose a neighbourhood."),
      travelRadiusKm: z.coerce.number().int().min(1).max(50),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your location details." };
  }

  const hood = getNeighbourhood(parsed.data.city, parsed.data.hood);
  if (!hood) return { error: "Choose a neighbourhood from the list." };

  const areas = formData
    .getAll("areas")
    .map(String)
    .filter(Boolean)
    .slice(0, 12);
  const uniqueAreas = areas.length ? [...new Set(areas)] : [hood.name];

  await db.$transaction([
    db.provider.update({
      where: { id: provider.id },
      data: {
        addressLine: parsed.data.addressLine,
        city: getCity(parsed.data.city)?.name ?? "Montréal",
        neighbourhood: hood.name,
        lat: hood.lat,
        lng: hood.lng,
        travelRadiusKm: parsed.data.travelRadiusKm,
      },
    }),
    db.serviceArea.deleteMany({ where: { providerId: provider.id } }),
    db.serviceArea.createMany({
      data: uniqueAreas.map((label) => ({ providerId: provider.id, label, city: "Montréal" })),
    }),
  ]);

  revalidatePath("/provider/onboarding");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

export async function saveHoursStep(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  const returnTo = resolveReturnTo(formData, "/provider/onboarding?step=review");

  const rows: Array<{
    providerId: string;
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }> = [];
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  let openDays = 0;

  for (let day = 0; day < 7; day += 1) {
    const closed = formData.get(`closed-${day}`) === "1";
    if (closed) {
      rows.push({ providerId: provider.id, dayOfWeek: day, opensAt: "09:00", closesAt: "17:00", isClosed: true });
      continue;
    }
    const opensAt = String(formData.get(`open-${day}`) ?? "");
    const closesAt = String(formData.get(`close-${day}`) ?? "");
    if (!timePattern.test(opensAt) || !timePattern.test(closesAt)) {
      return { error: "Each open day needs a valid opening and closing time." };
    }
    if (closesAt <= opensAt) {
      return { error: "Closing time must be later than opening time." };
    }
    openDays += 1;
    rows.push({ providerId: provider.id, dayOfWeek: day, opensAt, closesAt, isClosed: false });
  }

  if (openDays === 0) {
    return { error: "Add at least one open day." };
  }

  await db.$transaction([
    db.openingHour.deleteMany({ where: { providerId: provider.id } }),
    db.openingHour.createMany({ data: rows }),
  ]);

  revalidatePath("/provider/onboarding");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

export async function submitProviderApplication(
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  if (provider.status !== "DRAFT" && provider.status !== "REJECTED") {
    return { error: "This application has already been submitted." };
  }

  const [serviceCount, photoCount, openDays, areaCount] = await Promise.all([
    db.service.count({ where: { providerId: provider.id, isActive: true } }),
    db.providerPhoto.count({ where: { providerId: provider.id } }),
    db.openingHour.count({ where: { providerId: provider.id, isClosed: false } }),
    db.serviceArea.count({ where: { providerId: provider.id } }),
  ]);

  const hasSettings =
    provider.servesAtHome || provider.servesAtSalon || provider.servesAtShop || provider.travelsToClient;

  const missing: string[] = [];
  if (provider.about.trim().length < 80) missing.push("a longer about section");
  if (!hasSettings) missing.push("at least one service setting");
  if (!provider.addressLine) missing.push("a private street address");
  if (serviceCount < 1) missing.push("at least one service");
  if (photoCount < 1) missing.push("at least one photo");
  if (openDays < 1) missing.push("at least one open day");
  if (areaCount < 1) missing.push("at least one service area");

  if (missing.length) {
    return { error: `Before submitting, add ${missing.join(", ")}.` };
  }

  await db.provider.update({
    where: { id: provider.id },
    data: {
      status: "PENDING",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedByUserId: null,
      reviewNote: null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/provider/dashboard");
  redirect("/provider/dashboard?submitted=1");
}

export async function updateProviderProfileAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { provider } = await requireProvider();
  const returnTo = resolveReturnTo(formData, "/provider/dashboard/profile");

  const parsed = z
    .object({
      type: z.enum(["INDEPENDENT", "BUSINESS"]),
      displayName: z.string().trim().min(2, "Add a display name.").max(60),
      categoryId: z.string().min(1),
      tagline: z.string().trim().max(90).optional(),
      about: z.string().trim().min(80, "Keep the about section at least 80 characters.").max(1200),
      phone: z.string().trim().min(7, "Add a reachable phone number."),
      email: z.string().trim().email("Add a valid email address."),
      website: z.string().trim().max(200).optional(),
      instagram: z.string().trim().max(80).optional(),
      languages: z.string().trim().min(2, "Add at least one language.").max(80),
      responseTimeHours: z.preprocess(
        (value) => (value === "" || value === null || value === undefined ? undefined : value),
        z.coerce.number().int().min(1).max(72).optional(),
      ),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };
  }

  const servesAtHome = checkbox(formData, "servesAtHome");
  const servesAtSalon = checkbox(formData, "servesAtSalon");
  const servesAtShop = checkbox(formData, "servesAtShop");
  const travelsToClient = checkbox(formData, "travelsToClient");
  if (!servesAtHome && !servesAtSalon && !servesAtShop && !travelsToClient) {
    return { error: "Choose at least one place where you welcome clients." };
  }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "Choose a valid category." };

  await db.provider.update({
    where: { id: provider.id },
    data: {
      type: parsed.data.type,
      displayName: parsed.data.displayName,
      categoryId: category.id,
      tagline: parsed.data.tagline || null,
      about: parsed.data.about,
      phone: parsed.data.phone,
      email: parsed.data.email.toLowerCase(),
      website: parsed.data.website || null,
      instagram: parsed.data.instagram || null,
      languages: parsed.data.languages,
      responseTimeHours: parsed.data.responseTimeHours ?? null,
      servesAtHome,
      servesAtSalon,
      servesAtShop,
      travelsToClient,
    },
  });

  revalidatePath("/provider/dashboard/profile");
  revalidatePath(`/providers/${provider.slug}`);
  redirect(withSaved(returnTo));
}

export async function updateRequestStatusAction(formData: FormData): Promise<void> {
  const { provider } = await requireProvider();
  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("providerNote") ?? "").trim();

  if (!["ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"].includes(status)) {
    redirect("/provider/dashboard/requests?error=status");
  }

  const request = await db.bookingRequest.findFirst({
    where: { id: requestId, providerId: provider.id },
  });
  if (!request) redirect("/provider/dashboard/requests?error=notfound");

  await db.bookingRequest.update({
    where: { id: request.id },
    data: {
      status,
      respondedAt: new Date(),
      providerNote: note || null,
    },
  });

  revalidatePath("/provider/dashboard");
  revalidatePath("/provider/dashboard/requests");
  revalidatePath("/account");
  revalidatePath(`/requests/${request.reference}`);
  redirect("/provider/dashboard/requests?updated=1");
}
