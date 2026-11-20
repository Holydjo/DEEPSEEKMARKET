import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  Clock,
  Eye,
  ListChecks,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { bookingStatusLabel, windowLabel } from "@/lib/i18n/labels";
import { formatDate, formatDateTime, formatRelative, initials } from "@/lib/format";

export const dynamic = "force-dynamic";

function statusTone(status: string): string {
  if (status === "PENDING") return "pill-marigold";
  if (status === "ACCEPTED") return "pill-pine";
  if (status === "DECLINED" || status === "CANCELLED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "COMPLETED") return "pill-dark";
  return "border-line bg-surface-2 text-muted";
}

export default async function ProviderOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; saved?: string }>;
}) {
  const { submitted, saved } = await searchParams;
  const [{ provider: base, user }, { locale, t }] = await Promise.all([
    requireProvider(),
    getTranslator(),
  ]);

  const provider = await db.provider.findUnique({
    where: { id: base.id },
    include: {
      services: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      hours: true,
      areas: true,
      requests: {
        include: { service: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });
  if (!provider) return null;

  const [pendingCount, completedCount, reviewCount] = await Promise.all([
    db.bookingRequest.count({ where: { providerId: provider.id, status: "PENDING" } }),
    db.bookingRequest.count({ where: { providerId: provider.id, status: "COMPLETED" } }),
    db.review.count({ where: { providerId: provider.id, status: "PUBLISHED" } }),
  ]);

  const checklist = [
    { label: t("pdash.checklistProfile"), done: Boolean(provider.displayName && provider.about.length >= 80), href: "/provider/dashboard/profile" },
    { label: t("pdash.checklistServices"), done: provider.services.length > 0, href: "/provider/dashboard/services" },
    { label: t("pdash.checklistPhotos"), done: provider.photos.length > 0, href: "/provider/dashboard/profile#photos" },
    { label: t("pdash.checklistLocation"), done: Boolean(provider.addressLine && provider.areas.length), href: "/provider/dashboard/profile#location" },
    { label: t("pdash.checklistHours"), done: provider.hours.some((hour) => !hour.isClosed), href: "/provider/dashboard/profile#hours" },
  ];
  const completeCount = checklist.filter((item) => item.done).length;
  const hasPlaces =
    provider.servesAtHome || provider.servesAtSalon || provider.servesAtShop || provider.travelsToClient;

  const statusContent: Record<
    string,
    { tone: string; title: string; text: string; cta?: { href: string; label: string } }
  > = {
    DRAFT: {
      tone: "border-marigold/60 bg-marigold-soft/50",
      title: t("pdash.statusDraftTitle"),
      text: t("pdash.statusDraftText"),
      cta: { href: "/provider/onboarding?step=business", label: t("pdash.statusDraftCta") },
    },
    PENDING: {
      tone: "border-marigold/50 bg-marigold-soft/60",
      title: t("pdash.statusPendingTitle"),
      text: t("pdash.statusPendingText", {
        when: provider.submittedAt
          ? formatDateTime(provider.submittedAt, locale)
          : t("pdash.statusPendingRecently"),
      }),
    },
    APPROVED: {
      tone: "border-pine/20 bg-pine-soft",
      title: t("pdash.statusApprovedTitle"),
      text: t("pdash.statusApprovedText"),
      cta: { href: `/providers/${provider.slug}`, label: t("pdash.statusApprovedCta") },
    },
    REJECTED: {
      tone: "border-clay/30 bg-clay-soft",
      title: t("pdash.statusRejectedTitle"),
      text: provider.reviewNote || t("pdash.statusRejectedText"),
      cta: { href: "/provider/onboarding?step=business", label: t("pdash.statusRejectedCta") },
    },
    SUSPENDED: {
      tone: "border-ink bg-ink text-paper",
      title: t("pdash.statusSuspendedTitle"),
      text: t("pdash.statusSuspendedText"),
    },
  };
  const status = statusContent[provider.status] ?? statusContent.DRAFT;
  const formatRating = (value: number) =>
    value.toFixed(1).replace(".", locale === "fr" ? "," : ".");

  return (
    <div>
      {submitted === "1" && (
        <div className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          {t("pdash.bannerSubmitted")}
        </div>
      )}
      {saved === "1" && (
        <div className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          {t("pdash.bannerSaved")}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("nav.providerStudio")}</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.8rem)]">
            {t("pdash.greeting", { name: user.name.split(" ")[0] })}
          </h1>
          <p className="mt-1 text-[11px] text-muted">
            {provider.displayName} · {provider.neighbourhood}, {provider.city}
          </p>
        </div>
        <Link href="/provider/dashboard/requests" className="btn btn-primary btn-sm">
          {t("pnav.requests")} {pendingCount > 0 && <span className="rounded-full bg-ink px-1.5 py-0.5 text-[8px] text-paper">{pendingCount}</span>}
        </Link>
      </div>

      <div className={`mt-4 rounded-2xl border p-4 ${status.tone}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-semibold">
              {provider.status === "APPROVED" && <BadgeCheck className="h-3.5 w-3.5" aria-hidden />}
              {status.title}
            </p>
            <p className="mt-1 max-w-2xl text-[10.5px] leading-relaxed opacity-80">{status.text}</p>
          </div>
          {status.cta && (
            <Link href={status.cta.href} className="btn btn-dark btn-sm">
              {status.cta.label} <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: t("pdash.statsViews"), value: provider.viewCount, note: t("pdash.statsViewsNote"), icon: Eye },
          { label: t("pdash.statsRequests"), value: pendingCount, note: t("pdash.statsRequestsNote"), icon: CalendarCheck },
          { label: t("pdash.statsRating"), value: provider.ratingCount > 0 ? formatRating(provider.ratingAvg) : t("rating.new"), note: t("pdash.statsRatingNote", { count: reviewCount }), icon: Star },
          { label: t("pdash.statsServices"), value: provider.services.filter((service) => service.isActive).length, note: t("pdash.statsServicesNote", { count: completedCount }), icon: ListChecks },
        ].map((stat) => (
          <div key={stat.label} className="card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted">{stat.label}</span>
              <stat.icon className="h-3.5 w-3.5 text-muted" aria-hidden />
            </div>
            <p className="mt-1.5 font-display text-3xl leading-none">{stat.value}</p>
            <p className="mt-1 text-[9px] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">{t("pdash.latest")}</p>
              <h2 className="mt-1 text-xl">{t("pdash.recentRequests")}</h2>
            </div>
            <Link href="/provider/dashboard/requests" className="text-[10px] font-medium underline decoration-line underline-offset-4">
              {t("pdash.viewAll")}
            </Link>
          </div>

          {provider.requests.length > 0 ? (
            <div className="mt-3 divide-y divide-line">
              {provider.requests.map((request) => (
                <div key={request.id} className="flex flex-wrap items-center gap-2 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[8px] font-bold">
                    {initials(request.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold">{request.name} <span className="font-normal text-muted">· {request.service?.name ?? t("pdash.serviceFallback")}</span></p>
                    <p className="text-[9px] text-muted">
                      {formatDate(request.preferredDate, locale)} · {windowLabel(locale, request.preferredWindow)}
                    </p>
                  </div>
                  <span className={`pill !text-[8px] ${statusTone(request.status)}`}>
                    {bookingStatusLabel(locale, request.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-5 text-center">
              <CalendarCheck className="mx-auto h-5 w-5 text-muted" aria-hidden />
              <p className="mt-2 text-[11px] font-semibold">{t("pdash.requestsEmptyTitle")}</p>
              <p className="mt-1 text-[9.5px] text-muted">{t("pdash.requestsEmptyBody")}</p>
            </div>
          )}
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">{t("pdash.checklistEyebrow")}</p>
              <h2 className="mt-1 text-xl">{t("pdash.checklistTitle")}</h2>
            </div>
            <span className="text-[10px] font-semibold">{completeCount}/5</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(completeCount / 5) * 100}%` }} />
          </div>
          <div className="mt-3 grid gap-1.5">
            {checklist.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-[10.5px] hover:bg-surface-2">
                <span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.done ? "bg-pine text-paper" : "border border-line text-muted"}`}>
                  {item.done ? <Check className="h-2.5 w-2.5" aria-hidden /> : <span className="h-1 w-1 rounded-full bg-current" />}
                </span>
                <span className={item.done ? "text-ink" : "text-muted"}>{item.label}</span>
                {!item.done && <ArrowRight className="ml-auto h-3 w-3 text-muted" aria-hidden />}
              </Link>
            ))}
          </div>
          {!hasPlaces && (
            <p className="mt-2 rounded-lg bg-clay-soft px-2.5 py-2 text-[9px] text-clay">
              {t("pdash.checklistPlaceWarning")}
            </p>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        <Link href="/provider/dashboard/profile" className="card flex items-center gap-3 p-3.5 transition-colors hover:border-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marigold-soft"><MapPin className="h-3.5 w-3.5" aria-hidden /></span>
          <span className="text-[11px] font-semibold">{t("pdash.linkProfile")}</span>
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted" aria-hidden />
        </Link>
        <Link href="/provider/dashboard/services" className="card flex items-center gap-3 p-3.5 transition-colors hover:border-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marigold-soft"><ListChecks className="h-3.5 w-3.5" aria-hidden /></span>
          <span className="text-[11px] font-semibold">{t("pdash.linkServices")}</span>
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted" aria-hidden />
        </Link>
        <Link href="/provider/dashboard/reviews" className="card flex items-center gap-3 p-3.5 transition-colors hover:border-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marigold-soft"><Star className="h-3.5 w-3.5" aria-hidden /></span>
          <span className="text-[11px] font-semibold">{t("pdash.linkReviews")}</span>
          <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted" aria-hidden />
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" aria-hidden /> {t("pdash.noteViews")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" aria-hidden /> {t("pdash.noteUpdated", { when: formatRelative(provider.updatedAt, locale) })}
        </span>
      </div>
    </div>
  );
}
