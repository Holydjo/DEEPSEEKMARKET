import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, ExternalLink, Eye, Star, Store, X } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { PROVIDER_STATUS_LABEL } from "@/lib/constants";
import { reinstateProviderAction, suspendProviderAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "APPROVED", "PENDING", "SUSPENDED", "REJECTED"] as const;

function statusTone(status: string): string {
  if (status === "APPROVED") return "pill-pine";
  if (status === "PENDING") return "pill-marigold";
  if (status === "REJECTED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "SUSPENDED") return "pill-dark";
  return "";
}

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; done?: string; error?: string }>;
}) {
  const { status, done, error } = await searchParams;
  const active = FILTERS.includes((status ?? "ALL") as (typeof FILTERS)[number])
    ? (status ?? "ALL")
    : "ALL";

  const [providers, grouped] = await Promise.all([
    db.provider.findMany({
      where: {
        status: { not: "DRAFT" },
        ...(active === "ALL" ? {} : { status: active }),
      },
      include: {
        category: true,
        photos: { take: 1 },
        user: { select: { email: true } },
        _count: { select: { services: true, requests: true, reviews: true } },
      },
      orderBy: [{ featured: "desc" }, { ratingAvg: "desc" }, { displayName: "asc" }],
    }),
    db.provider.groupBy({
      by: ["status"],
      where: { status: { not: "DRAFT" } },
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Admin · directory</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">All providers.</h1>
          <p className="mt-1 text-[11px] text-muted">
            Every non-draft profile, with its public state and controls.
          </p>
        </div>
        <span className="pill"><Store className="h-3 w-3" aria-hidden /> {total} profiles</span>
      </div>

      {done && (
        <div className="mt-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-2.5 text-[10px] font-medium text-pine">
          {done === "suspended" && "Profile suspended and removed from public search."}
          {done === "reinstated" && "Profile reinstated and public again."}
        </div>
      )}
      {error === "state" && (
        <div className="mt-4 rounded-xl border border-clay/25 bg-clay-soft px-4 py-2.5 text-[10px] text-clay">
          That action does not apply to the current status.
        </div>
      )}

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-line pb-2">
        {FILTERS.map((filter) => {
          const count = filter === "ALL" ? total : counts.get(filter) ?? 0;
          return (
            <Link
              key={filter}
              href={filter === "ALL" ? "/admin/providers" : `/admin/providers?status=${filter}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[9.5px] ${
                active === filter ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-soft hover:border-ink"
              }`}
            >
              {filter === "ALL" ? "All" : PROVIDER_STATUS_LABEL[filter as keyof typeof PROVIDER_STATUS_LABEL] ?? filter}
              <span className={`ml-1.5 ${active === filter ? "text-paper/60" : "text-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2.5">
        {providers.map((provider) => (
          <div key={provider.id} className="card p-3">
            <div className="flex flex-wrap items-start gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {provider.photos[0] ? (
                  <Image src={provider.photos[0].url} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[7px] text-muted">No photo</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12px] font-semibold">{provider.displayName}</p>
                  <span className={`pill !text-[8px] ${statusTone(provider.status)}`}>
                    {PROVIDER_STATUS_LABEL[provider.status as keyof typeof PROVIDER_STATUS_LABEL] ?? provider.status}
                  </span>
                  {provider.featured && <span className="pill pill-marigold !text-[7.5px]">Featured</span>}
                </div>
                <p className="mt-0.5 text-[9px] text-muted">
                  {provider.category.name} · {provider.neighbourhood} · {provider.type === "BUSINESS" ? "Business" : "Independent"}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5px] text-muted">
                  <span className="inline-flex items-center gap-1"><Star className="h-2.5 w-2.5" aria-hidden /> {provider.ratingCount ? provider.ratingAvg.toFixed(1) : "New"} ({provider.ratingCount})</span>
                  <span className="inline-flex items-center gap-1"><Eye className="h-2.5 w-2.5" aria-hidden /> {provider.viewCount} views</span>
                  <span>{provider._count.services} services</span>
                  <span>{provider._count.requests} requests</span>
                  <span className="inline-flex items-center gap-1"><BadgeCheck className="h-2.5 w-2.5" aria-hidden /> {provider._count.reviews} reviews</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {provider.status === "PENDING" || provider.status === "REJECTED" ? (
                  <Link href={`/admin/applications/${provider.id}`} className="btn btn-dark btn-sm">
                    Review <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                ) : (
                  <Link href={`/admin/applications/${provider.id}`} className="btn btn-outline btn-sm">
                    Details
                  </Link>
                )}
                {provider.status === "APPROVED" && (
                  <>
                    <Link href={`/providers/${provider.slug}`} className="btn btn-ghost btn-sm !px-2" title="Public profile">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    <form action={suspendProviderAction} className="flex items-center gap-1">
                      <input type="hidden" name="providerId" value={provider.id} />
                      <input
                        name="note"
                        required
                        minLength={5}
                        placeholder="Reason"
                        className="w-28 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[8.5px]"
                        aria-label={`Suspension reason for ${provider.displayName}`}
                      />
                      <button className="btn btn-outline btn-sm !px-2.5 text-[8.5px] text-clay">
                        <X className="h-3 w-3" aria-hidden /> Suspend
                      </button>
                    </form>
                  </>
                )}
                {provider.status === "SUSPENDED" && (
                  <form action={reinstateProviderAction} className="flex items-center gap-1">
                    <input type="hidden" name="providerId" value={provider.id} />
                    <input
                      name="note"
                      placeholder="Note"
                      className="w-24 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[8.5px]"
                      aria-label={`Reinstatement note for ${provider.displayName}`}
                    />
                    <button className="btn btn-primary btn-sm !px-2.5 text-[8.5px]">
                      <BadgeCheck className="h-3 w-3" aria-hidden /> Reinstate
                    </button>
                  </form>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 text-[8px] text-muted">
              <span>{provider.user.email}</span>
              <span>Updated {formatRelative(provider.updatedAt)}</span>
            </div>
          </div>
        ))}
        {providers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <p className="text-sm font-semibold">No providers in this state</p>
          </div>
        )}
      </div>
    </div>
  );
}
