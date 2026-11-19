"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, getCurrentUser, safeNextPath } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { uniqueSlug } from "@/lib/slug";
import { MONTREAL } from "@/lib/location";
import type { ActionState } from "@/lib/types";

const emailField = z.string().trim().toLowerCase().email("Enter a valid email address.");
const passwordField = z.string().min(8, "Use at least 8 characters.");

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      email: emailField,
      password: z.string().min(1, "Enter your password."),
      next: z.string().optional(),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  const locale = await getLocale();
  await db.user.update({ where: { id: user.id }, data: { locale } }).catch(() => undefined);
  await createSession(user.id);

  const explicitNext = parsed.data.next?.trim();
  if (explicitNext) redirect(safeNextPath(explicitNext));

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "PROVIDER") redirect("/provider/dashboard");
  redirect("/account");
}

export async function signupAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Tell us your name."),
      email: emailField,
      password: passwordField,
      next: z.string().optional(),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in instead." };
  }

  const locale = await getLocale();
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
      locale,
    },
  });

  await createSession(user.id);
  redirect(safeNextPath(parsed.data.next) || "/account");
}

const providerJoinSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name."),
  email: emailField,
  password: passwordField,
  phone: z.string().trim().min(7, "Add a phone number customers can reach you on."),
  categoryId: z.string().trim().min(1, "Choose your main category."),
});

function draftProviderData(input: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  categoryId: string;
}) {
  const plateau = MONTREAL.neighbourhoods[0];
  return {
    userId: input.userId,
    slug: uniqueSlug(input.name),
    type: "INDEPENDENT",
    status: "DRAFT",
    displayName: input.name,
    tagline: null,
    about: "",
    categoryId: input.categoryId,
    addressLine: "",
    city: MONTREAL.name,
    neighbourhood: plateau.name,
    lat: plateau.lat,
    lng: plateau.lng,
    phone: input.phone,
    email: input.email,
    languages: "English, French",
    servesAtHome: false,
    servesAtSalon: false,
    servesAtShop: false,
    travelsToClient: false,
  };
}

export async function providerJoinAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = providerJoinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists. Log in to continue your application." };
  }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "Choose a valid category." };

  const passwordHash = await hashPassword(parsed.data.password);
  const locale = await getLocale();

  const user = await db.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        phone: parsed.data.phone,
        role: "PROVIDER",
        locale,
      },
    });

    await tx.provider.create({
      data: draftProviderData({
        userId: createdUser.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        categoryId: category.id,
      }),
    });

    return createdUser;
  });

  await createSession(user.id);
  redirect("/provider/onboarding?step=business");
}

export async function createProviderDraftAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in first to start a provider application." };
  if (user.provider) redirect("/provider/onboarding?step=business");

  const parsed = z
    .object({ categoryId: z.string().min(1, "Choose your main category.") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Choose a category." };

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "Choose a valid category." };

  await db.$transaction(async (tx) => {
    await tx.provider.create({
      data: draftProviderData({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        categoryId: category.id,
      }),
    });
    await tx.user.update({ where: { id: user.id }, data: { role: "PROVIDER" } });
  });

  redirect("/provider/onboarding?step=business");
}
