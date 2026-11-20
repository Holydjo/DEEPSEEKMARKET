"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deliverEmail, deliverPendingEmails } from "@/lib/email";

export async function retryEmailAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("emailId") ?? "");
  if (id) await deliverEmail(id);
  revalidatePath("/admin/emails");
}

export async function retryQueuedEmailsAction(): Promise<void> {
  await requireAdmin();
  await deliverPendingEmails();
  revalidatePath("/admin/emails");
}
