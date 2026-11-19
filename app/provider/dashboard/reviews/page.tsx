import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRelative, initials } from "@/lib/format";
import { StarRow } from "@/components/rating";

export const dynamic = "force-dynamic";

export default async function ProviderReviewsPage() {
  const { provider } = await requireProvider();

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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Reputation</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">What clients say.</h1>
          <p className="mt-1 text-[11px] text-muted">
            {published.length} published {published.length === 1 ? "review" : "reviews"} · {verified} verified
          </p>
        </div>
        <span className="pill pill-pine !text-[9px]">
          <BadgeCheck className="h-3 w-3" aria-hidden /> Verified reviews only count with a booking
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="card p-5 text-center">
          <p className="display text-5xl">{average ? average.toFixed(1) : "—"}</p>
          <div className="mt-2 flex justify-center"><StarRow value={average} /></div>
          <p className="mt-1 text-[10px] text-muted">{provider.ratingCount} lifetime reviews</p>
          <div className="mt-4 grid gap-2 border-t border-line pt-3 text-left text-[10px]">
            <div className="flex items-center justify-between"><span className="text-muted">Published here</span><b>{published.length}</b></div>
            <div className="flex items-center justify-between"><span className="text-muted">Verified bookings</span><b>{verified}</b></div>
            <div className="flex items-center justify-between"><span className="text-muted">Average shown</span><b>{provider.ratingAvg.toFixed(1)}</b></div>
          </div>
          <p className="mt-3 text-[8.5px] leading-relaxed text-muted">
            Reviews can’t be deleted by providers. If a review breaks the guidelines, contact
            hello@holydo.market and our team will review it.
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
                        <p className="text-[8.5px] text-muted">{formatRelative(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRow value={review.rating} />
                      {review.isVerified && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[7.5px] font-semibold text-pine">
                          <BadgeCheck className="h-2.5 w-2.5" aria-hidden /> Booked via HOLYDO
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-ink-soft">{review.body}</p>
                  {review.status !== "PUBLISHED" && (
                    <p className="mt-2 pill border-clay/30 bg-clay-soft !text-[8px] text-clay">Hidden from public view</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="card flex min-h-52 flex-col items-center justify-center p-8 text-center">
              <Star className="h-6 w-6 text-muted" aria-hidden />
              <p className="mt-3 text-sm font-semibold">No reviews yet</p>
              <p className="mt-1 max-w-sm text-[10.5px] leading-relaxed text-muted">
                After a customer completes a request, they can leave a review. Verified reviews
                carry a “Booked via HOLYDO” note on your public profile.
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] text-muted">
            <span>Keep your services and hours current — it sets expectations.</span>
            <Link href="/provider/dashboard/services" className="font-medium text-ink">Manage services →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
