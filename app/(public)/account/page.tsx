import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Star,
  UserRound,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatRelative, initials } from "@/lib/format";
import { getTranslator } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/i18n/categories";
import { bookingStatusLabel, windowLabel } from "@/lib/i18n/labels";
import { logoutAction } from "@/app/actions/auth";
import { StarRow } from "@/components/rating";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("account.meta.title"), robots: { index: false } };
}

function statusTone(status: string): string {
  if (status === "ACCEPTED") return "pill-pine";
  if (status === "DECLINED" || status === "CANCELLED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "COMPLETED") return "bg-ink text-paper border-ink";
  return "pill-marigold";
}

export default async function AccountPage() {
  const [{ locale, t }, user] = await Promise.all([getTranslator(), getCurrentUser()]);
  if (!user) redirect("/login?next=/account");
  if (user.role === "ADMIN") redirect("/admin");

  const [requests, reviews, savedCount] = await Promise.all([
    db.bookingRequest.findMany({
      where: {
        OR: [{ customerUserId: user.id }, { email: user.email }],
      },
      include: {
        provider: { include: { photos: { take: 1 }, category: true } },
        service: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.review.findMany({
      where: { authorUserId: user.id, status: "PUBLISHED" },
      include: { provider: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.savedProvider.count({ where: { userId: user.id } }),
  ]);

  const pending = requests.filter((request) => request.status === "PENDING").length;
  const accepted = requests.filter((request) => request.status === "ACCEPTED").length;

  const stats: Array<[string, number, string]> = [
    [t("account.stats.requests"), requests.length, t("account.stats.requestsNote")],
    [t("account.stats.waiting"), pending, t("account.stats.waitingNote")],
    [t("account.stats.accepted"), accepted, t("account.stats.acceptedNote")],
  ];

  return (
    <div className="container-hd py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("account.eyebrow")}</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.8rem)]">
            {t("account.greeting", { name: user.name.split(" ")[0] })}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("account.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/saved" className="btn btn-outline btn-sm">
            <Heart className="h-3.5 w-3.5" aria-hidden /> {t("account.savedLink")}{" "}
            {savedCount > 0 && <span className="text-muted">({savedCount})</span>}
          </Link>
          <Link href="/search" className="btn btn-primary btn-sm">
            {t("account.findService")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {user.provider && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pine/20 bg-pine-soft p-4">
          <div className="flex items-center gap-2 text-pine">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            <p className="text-xs font-semibold">{t("account.providerProfile")}</p>
          </div>
          <Link href="/provider/dashboard" className="btn btn-dark btn-sm">
            {t("account.openDashboard")}
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {stats.map(([label, value, note]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl">{value}</p>
            <p className="text-[10px] text-muted">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div id="requests" className="scroll-mt-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">{t("account.requests.eyebrow")}</p>
              <h2 className="display mt-2 text-2xl">{t("account.requests.title")}</h2>
            </div>
          </div>

          {requests.length > 0 ? (
            <div className="mt-4 grid gap-2.5">
              {requests.map((request) => (
                <div key={request.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
                  <Link
                    href={`/providers/${request.provider.slug}`}
                    className="relative h-[86px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-surface-2"
                  >
                    {request.provider.photos[0] ? (
                      <Image
                        src={request.provider.photos[0].url}
                        alt={request.provider.displayName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[9px] text-muted">
                        {categoryLabel(
                          locale,
                          request.provider.category.slug,
                          request.provider.category.name,
                        )}
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link href={`/providers/${request.provider.slug}`} className="text-[12px] font-semibold hover:underline">
                        {request.provider.displayName}
                      </Link>
                      <span className={`pill !text-[8px] ${statusTone(request.status)}`}>
                        {bookingStatusLabel(locale, request.status)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {request.service?.name ?? t("account.serviceConfirm")}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" aria-hidden />
                        {formatDate(request.preferredDate, locale)} ·{" "}
                        {windowLabel(locale, request.preferredWindow)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {request.provider.neighbourhood}
                      </span>
                    </p>
                    {request.providerNote && (
                      <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-pine">
                        {t("account.providerNote", { note: request.providerNote })}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1">
                      <span className="font-mono text-[8.5px] text-muted">{request.reference}</span>
                      <Link href={`/requests/${request.reference}`} className="text-[9px] font-medium underline decoration-line underline-offset-2">
                        {t("account.viewRequest")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-muted" aria-hidden />
              <p className="mt-3 text-sm font-semibold">{t("account.noRequests")}</p>
              <p className="mx-auto mt-1 max-w-sm text-[11px] text-muted">
                {t("account.noRequestsBody")}
              </p>
              <Link href="/search" className="btn btn-primary btn-sm mt-4">
                {t("account.browse")}
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                {initials(user.name)}
              </span>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[10px] text-muted">{t("account.customer")}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 border-t border-line pt-3 text-[11px]">
              <p className="flex items-center gap-2 text-muted"><UserRound className="h-3.5 w-3.5" aria-hidden /> {user.email}</p>
              {user.phone && (
                <p className="text-muted">{t("account.phone", { phone: user.phone })}</p>
              )}
            </div>
            <form action={logoutAction} className="mt-4">
              <button className="btn btn-outline btn-sm w-full">
                <LogOut className="h-3.5 w-3.5" aria-hidden /> {t("account.logout")}
              </button>
            </form>
          </div>

          <Link href="/saved" className="card block p-5 transition-colors hover:border-ink">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">{t("account.saved.title")}</h2>
              <Heart className="h-4 w-4 text-clay" aria-hidden />
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              {savedCount > 0
                ? savedCount === 1
                  ? t("account.saved.countOne", { count: savedCount })
                  : t("account.saved.countMany", { count: savedCount })
                : t("account.saved.empty")}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-ink">
              {t("account.saved.view")} <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
          </Link>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">{t("account.reviews.title")}</h2>
              <Star className="h-4 w-4 text-muted" aria-hidden />
            </div>
            {reviews.length > 0 ? (
              <div className="mt-3 grid gap-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-line pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/providers/${review.provider.slug}`} className="text-[11px] font-semibold hover:underline">
                        {review.provider.displayName}
                      </Link>
                      <StarRow value={review.rating} locale={locale} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[9.5px] leading-relaxed text-muted">{review.body}</p>
                    <p className="mt-1 text-[8px] text-muted">
                      {formatRelative(review.createdAt, locale)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[10px] leading-relaxed text-muted">
                {t("account.reviews.empty")}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-surface-2 p-4 text-[9.5px] leading-relaxed text-muted">
            <strong className="text-ink">{t("account.privacyTitle")}</strong>{" "}
            {t("account.privacyBody")}
          </div>
        </aside>
      </div>
    </div>
  );
}
