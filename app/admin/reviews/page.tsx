import Link from "next/link";
import { BadgeCheck, Eye, EyeOff, MessageSquareText, Star } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative, initials } from "@/lib/format";
import { StarRow } from "@/components/rating";
import { moderateReviewAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const FILTERS = ["PUBLISHED", "HIDDEN", "ALL"] as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; done?: string; error?: string }>;
}) {
  const { status, done, error } = await searchParams;
  const active = FILTERS.includes((status ?? "PUBLISHED") as (typeof FILTERS)[number])
    ? (status ?? "PUBLISHED")
    : "PUBLISHED";

  const [reviews, grouped] = await Promise.all([
    db.review.findMany({
      where: active === "ALL" ? {} : { status: active },
      include: {
        provider: { select: { displayName: true, slug: true } },
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Trust &amp; safety · reviews</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">Review moderation.</h1>
          <p className="mt-1 text-[11px] text-muted">
            Hidden reviews disappear from the public profile and the provider&apos;s rating is recalculated.
          </p>
        </div>
        <span className="pill">
          <MessageSquareText className="h-3 w-3" aria-hidden /> {total} reviews
        </span>
      </div>

      {done && done !== "same" && (
        <div className="mt-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-2.5 text-[10px] font-medium text-pine">
          {done === "hidden" ? "Review hidden from the public profile." : "Review published again."}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-clay/25 bg-clay-soft px-4 py-2.5 text-[10px] text-clay">
          That review could not be updated. Refresh and try again.
        </div>
      )}

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-line pb-2">
        {FILTERS.map((filter) => {
          const count = filter === "ALL" ? total : counts.get(filter) ?? 0;
          return (
            <Link
              key={filter}
              href={filter === "PUBLISHED" ? "/admin/reviews" : `/admin/reviews?status=${filter}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[9.5px] ${
                active === filter ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-soft hover:border-ink"
              }`}
            >
              {filter === "ALL" ? "All" : filter === "PUBLISHED" ? "Published" : "Hidden"}
              <span className={`ml-1.5 ${active === filter ? "text-paper/60" : "text-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      {reviews.length > 0 ? (
        <div className="mt-4 grid gap-2.5">
          {reviews.map((review) => (
            <article key={review.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-[9px] font-bold">
                    {initials(review.author.name)}
                  </span>
                  <div>
                    <p className="text-[11.5px] font-semibold">{review.author.name}</p>
                    <p className="text-[8.5px] text-muted">
                      {review.author.email} · {formatRelative(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <StarRow value={review.rating} />
                  <span className={`pill !text-[8px] ${review.status === "PUBLISHED" ? "pill-pine" : "border-clay/30 bg-clay-soft text-clay"}`}>
                    {review.status === "PUBLISHED" ? "Published" : "Hidden"}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-soft">{review.body}</p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <div className="flex flex-wrap items-center gap-2 text-[9.5px] text-muted">
                  <Link href={`/providers/${review.provider.slug}`} className="font-medium text-ink hover:underline">
                    {review.provider.displayName}
                  </Link>
                  {review.isVerified && (
                    <span className="inline-flex items-center gap-1 text-pine">
                      <BadgeCheck className="h-2.5 w-2.5" aria-hidden /> Verified booking
                    </span>
                  )}
                  <span className="font-mono text-[8px]">{review.id.slice(-6).toUpperCase()}</span>
                </div>

                <form action={moderateReviewAction}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input type="hidden" name="status" value={review.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED"} />
                  <button
                    className={`btn btn-sm !px-2.5 !py-1.5 text-[8.5px] ${
                      review.status === "PUBLISHED" ? "btn-outline text-clay" : "btn-primary"
                    }`}
                  >
                    {review.status === "PUBLISHED" ? (
                      <><EyeOff className="h-3 w-3" aria-hidden /> Hide</>
                    ) : (
                      <><Eye className="h-3 w-3" aria-hidden /> Publish</>
                    )}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <Star className="mx-auto h-6 w-6 text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold">No reviews in this state</p>
          <p className="mt-1 text-[10px] text-muted">Published customer reviews will appear here for moderation.</p>
        </div>
      )}
    </div>
  );
}
