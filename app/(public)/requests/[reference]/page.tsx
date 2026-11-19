import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, todayInToronto } from "@/lib/format";
import { initials } from "@/lib/format";
import { getTranslator } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/i18n/categories";
import { bookingStatusLabel, windowLabel } from "@/lib/i18n/labels";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import {
  cancelBookingRequestAction,
  rescheduleBookingRequestAction,
} from "@/app/actions/requests";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("request.meta.title"),
    robots: { index: false, follow: false },
  };
}

function statusTone(status: string): string {
  if (status === "ACCEPTED") return "pill-pine";
  if (status === "DECLINED" || status === "CANCELLED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "COMPLETED") return "bg-ink text-paper border-ink";
  return "pill-marigold";
}

export default async function RequestConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ new?: string; cancelled?: string; rescheduled?: string }>;
}) {
  const { reference } = await params;
  const { new: isNew, cancelled, rescheduled } = await searchParams;
  const { locale, t } = await getTranslator();

  const request = await db.bookingRequest.findUnique({
    where: { reference },
    include: {
      provider: { include: { photos: { take: 1 }, category: true } },
      service: true,
    },
  });

  if (!request) notFound();

  const steps: Array<[string, string, string]> = [
    ["1", t("request.step1.title"), t("request.step1.body")],
    ["2", t("request.step2.title"), t("request.step2.body")],
    ["3", t("request.step3.title"), t("request.step3.body")],
  ];

  return (
    <div className="container-hd max-w-4xl py-8 md:py-12">
      {isNew === "1" && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-pine/20 bg-pine-soft p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine text-paper">
            <Check className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-pine">{t("request.newTitle")}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-pine/80">
              {t("request.newBody")}
            </p>
          </div>
        </div>
      )}

      {cancelled === "1" && (
        <div role="status" className="mb-5 rounded-2xl border border-clay/25 bg-clay-soft p-4 text-[11px] font-medium text-clay">
          {t("booking.cancelled")}
        </div>
      )}
      {rescheduled === "1" && (
        <div role="status" className="mb-5 rounded-2xl border border-pine/20 bg-pine-soft p-4 text-[11px] font-medium text-pine">
          {t("booking.rescheduled")}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <p className="eyebrow">{t("request.eyebrow")}</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">
            {t("request.thanks", { name: request.name.split(" ")[0] })}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            {t("request.intro", { provider: request.provider.displayName })}
          </p>

          <div className="card mt-6 p-5">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                  {initials(request.provider.displayName)}
                </span>
                <div>
                  <Link href={`/providers/${request.provider.slug}`} className="text-sm font-semibold hover:underline">
                    {request.provider.displayName}
                  </Link>
                  <p className="text-[10px] text-muted">
                    {categoryLabel(
                      locale,
                      request.provider.category.slug,
                      request.provider.category.name,
                    )}{" "}
                    · {request.provider.neighbourhood}
                  </p>
                </div>
              </div>
              <span className={`pill !text-[9px] ${statusTone(request.status)}`}>
                {bookingStatusLabel(locale, request.status)}
              </span>
            </div>

            <div className="grid gap-3 py-4 text-[12px] sm:grid-cols-2">
              <div>
                <p className="label">{t("request.reference")}</p>
                <p className="font-mono text-[13px] font-semibold">{request.reference}</p>
              </div>
              <div>
                <p className="label">{t("request.service")}</p>
                <p className="font-medium">{request.service?.name ?? t("request.serviceConfirm")}</p>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    {t("request.preferredDate")}
                  </p>
                  <p className="font-medium">{formatDate(request.preferredDate, locale)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    {t("request.preferredWindow")}
                  </p>
                  <p className="font-medium">{windowLabel(locale, request.preferredWindow)}</p>
                </div>
              </div>
            </div>

            {request.message && (
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-muted">{t("request.note")}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{request.message}</p>
              </div>
            )}

            {request.providerNote && (
              <div className="mt-3 rounded-xl border border-pine/20 bg-pine-soft p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-pine/70">
                  {t("request.providerReply")}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-pine">{request.providerNote}</p>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {steps.map(([number, title, text]) => (
              <div key={number} className="rounded-xl border border-line bg-surface p-3.5">
                <span className="font-mono text-[9px] text-clay">0{number}</span>
                <p className="mt-1.5 text-[11.5px] font-semibold">{title}</p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/search" className="btn btn-primary btn-sm">
              {t("request.keepBrowsing")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link href="/account#requests" className="btn btn-outline btn-sm">
              {t("request.viewRequests")}
            </Link>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <h2 className="text-lg">{t("request.contactTitle")}</h2>
            <div className="mt-3 grid gap-2 text-[11px] text-ink-soft">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted" aria-hidden /> {request.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted" aria-hidden /> {request.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted" aria-hidden /> {request.provider.neighbourhood}, {request.provider.city}</p>
            </div>
            <p className="mt-3 border-t border-line pt-2 text-[9px] leading-relaxed text-muted">
              {t("request.sent", { date: formatDateTime(request.createdAt, locale) })}
            </p>
          </div>

          <div className="rounded-2xl border border-marigold/50 bg-marigold-soft/60 p-4 text-[9.5px] leading-relaxed text-ink/80">
            <strong className="text-ink">{t("request.noPaymentTitle")}</strong>{" "}
            {t("request.noPaymentBody")}
          </div>

          {(request.status === "PENDING" || request.status === "ACCEPTED") && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <h2 className="text-lg">{t("booking.manage")}</h2>

              <details className="mt-2 rounded-xl border border-line bg-paper p-3">
                <summary className="cursor-pointer list-none text-[10.5px] font-semibold text-clay [&::-webkit-details-marker]:hidden">
                  {t("booking.cancelTitle")}
                </summary>
                <p className="mt-1 text-[9px] leading-relaxed text-muted">{t("booking.cancelBody")}</p>
                <ActionForm action={cancelBookingRequestAction} className="mt-2" locale={locale}>
                  <input type="hidden" name="reference" value={request.reference} />
                  <SubmitButton
                    className="btn btn-outline btn-sm w-full text-clay"
                    pendingLabel={t("common.loading")}
                  >
                    {t("booking.cancelConfirm")}
                  </SubmitButton>
                </ActionForm>
              </details>

              <details className="mt-2 rounded-xl border border-line bg-paper p-3">
                <summary className="cursor-pointer list-none text-[10.5px] font-semibold [&::-webkit-details-marker]:hidden">
                  {t("booking.rescheduleTitle")}
                </summary>
                <p className="mt-1 text-[9px] leading-relaxed text-muted">{t("booking.rescheduleBody")}</p>
                <ActionForm action={rescheduleBookingRequestAction} className="mt-2 grid gap-2" locale={locale}>
                  <input type="hidden" name="reference" value={request.reference} />
                  <div>
                    <label htmlFor="reschedule-date" className="label">{t("booking.preferredDate")}</label>
                    <input
                      id="reschedule-date"
                      name="preferredDate"
                      type="date"
                      required
                      min={todayInToronto(1)}
                      defaultValue={todayInToronto(1)}
                      className="input !py-2 text-[11px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reschedule-window" className="label">{t("booking.preferredWindow")}</label>
                    <select
                      id="reschedule-window"
                      name="preferredWindow"
                      defaultValue={request.preferredWindow}
                      className="input !py-2 text-[11px]"
                    >
                      <option value="MORNING">{t("window.MORNING")}</option>
                      <option value="AFTERNOON">{t("window.AFTERNOON")}</option>
                      <option value="EVENING">{t("window.EVENING")}</option>
                    </select>
                  </div>
                  <SubmitButton className="btn btn-primary btn-sm w-full" pendingLabel={t("common.loading")}>
                    {t("booking.rescheduleSubmit")}
                  </SubmitButton>
                </ActionForm>
              </details>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-[10px] font-semibold">{t("request.helpTitle")}</p>
            <p className="mt-1 text-[9px] leading-relaxed text-muted">
              {t("request.helpBody")}
            </p>
            <a href="mailto:hello@holydo.market" className="mt-2 inline-block text-[9px] font-medium underline decoration-line underline-offset-2">
              {t("request.helpLink")}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
