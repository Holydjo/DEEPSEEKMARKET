import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { formatRelative, initials } from "@/lib/format";
import { StarRow } from "@/components/rating";

export const dynamic = "force-dynamic";

export default async function ProviderReviewsPage() {
  const [{ provider }, { locale, t }] = await Promise.all([
    requireProvider(),
    getTranslator(),
  ]);

  const reviews = await db.review.findMany({
    where: { providerId: provider.id },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const published = reviews.filter((review) => review.status === "PUBLISHED");
  const verified = published.filter((review) => review.isVerified).length;
  const average =
    published.length > 0
      ? published.reduce((sum, review) => sum + review.rating, 0) / published.length
      : 0;
  const formatRating = (value: number) =>
    value.toFixed(1).replace(".", locale === "fr" ? "," : ".");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("pdash.reviewsEyebrow")}</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">{t("provider.reviews.title")}</h1>
          <p className="mt-1 text-[11px] text-muted">
            {published.length === 1
              ? t("pdash.reviewsSummaryOne", { count: published.length, verified })
              : t("pdash.reviewsSummaryMany", { count: published.length, verified })}
          </p>
        </div>
        <span className="pill pill-pine !text-[9px]">
          <BadgeCheck className="h-3 w-3" aria-hidden /> {t("pdash.reviewsVerifiedNote")}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="card p-5 text-center">
          <p className="display text-5xl">{average ? formatRating(average) : "—"}</p>
          <div className="mt-2 flex justify-center"><StarRow value={average} locale={locale} /></div>
          <p className="mt-1 text-[10px] text-muted">{t("pdash.reviewsLifetime", { count: provider.ratingCount })}</p>
          <div className="mt-4 grid gap-2 border-t border-line pt-3 text-left text-[10px]">
            <div className="flex items-center justify-between"><span className="text-muted">{t("pdash.reviewsPublishedHere")}</span><b>{published.length}</b></div>
            <div className="flex items-center justify-between"><span className="text-muted">{t("pdash.reviewsVerifiedBookings")}</span><b>{verified}</b></div>
            <div className="flex items-center justify-between"><span className="text-muted">{t("pdash.reviewsAverageShown")}</span><b>{formatRating(provider.ratingAvg)}</b></div>
          </div>
          <p className="mt-3 text-[8.5px] leading-relaxed text-muted">
            {t("pdash.reviewsPolicy")}
          </p>
        </aside>

        <div>
          {published.length > 0 ? (
            <div className="grid gap-2.5">
              {published.map((review) => (
                <article key={review.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-[9px] font-bold">
                        {initials(review.author.name)}
                      </span>
                      <div>
                        <p className="text-[11.5px] font-semibold">{review.author.name}</p>
                        <p className="text-[8.5px] text-muted">{formatRelative(review.createdAt, locale)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRow value={review.rating} locale={locale} />
                      {review.isVerified && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[7.5px] font-semibold text-pine">
                          <BadgeCheck className="h-2.5 w-2.5" aria-hidden /> {t("provider.reviews.bookedVia")}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-ink-soft">{review.body}</p>
                  {review.status !== "PUBLISHED" && (
                    <p className="mt-2 pill border-clay/30 bg-clay-soft !text-[8px] text-clay">{t("pdash.reviewsHidden")}</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="card flex min-h-52 flex-col items-center justify-center p-8 text-center">
              <Star className="h-6 w-6 text-muted" aria-hidden />
              <p className="mt-3 text-sm font-semibold">{t("pdash.reviewsEmptyTitle")}</p>
              <p className="mt-1 max-w-sm text-[10.5px] leading-relaxed text-muted">
                {t("pdash.reviewsEmptyBody")}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] text-muted">
            <span>{t("pdash.reviewsFooter")}</span>
            <Link href="/provider/dashboard/services" className="font-medium text-ink">{t("pdash.reviewsManage")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
