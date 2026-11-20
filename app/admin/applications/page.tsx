import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardCheck, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { PROVIDER_STATUS_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FILTERS = ["PENDING", "ALL", "REJECTED", "APPROVED", "SUSPENDED"] as const;

function statusTone(status: string): string {
  if (status === "APPROVED") return "pill-pine";
  if (status === "PENDING") return "pill-marigold";
  if (status === "REJECTED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "SUSPENDED") return "pill-dark";
  return "";
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const { status, error } = await searchParams;
  const active = FILTERS.includes((status ?? "PENDING") as (typeof FILTERS)[number])
    ? (status ?? "PENDING")
    : "PENDING";

  const [applications, grouped] = await Promise.all([
    db.provider.findMany({
      where: {
        ...(active === "ALL" ? { status: { not: "DRAFT" } } : { status: active }),
      },
      include: {
        category: true,
        photos: { take: 1 },
        user: { select: { email: true } },
        _count: { select: { services: true, photos: true, requests: true } },
      },
      orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
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
          <p className="eyebrow">Admin · applications</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">Provider applications.</h1>
          <p className="mt-1 text-[11px] text-muted">
            A human review before anything becomes public. {counts.get("PENDING") ?? 0} waiting.
          </p>
        </div>
        <span className="pill"><ClipboardCheck className="h-3 w-3" aria-hidden /> {total} total</span>
      </div>

      {error === "state" && (
        <div className="mt-4 rounded-xl border border-clay/25 bg-clay-soft px-4 py-2.5 text-[10px] text-clay">
          That application is no longer in a state where this action applies.
        </div>
      )}

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-line pb-2">
        {FILTERS.map((filter) => {
          const count = filter === "ALL" ? total : counts.get(filter) ?? 0;
          return (
            <Link
              key={filter}
              href={filter === "PENDING" ? "/admin/applications" : `/admin/applications?status=${filter}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[9.5px] ${
                active === filter ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-soft hover:border-ink"
              }`}
            >
              {filter === "ALL" ? "All" : PROVIDER_STATUS_LABEL[filter as keyof typeof PROVIDER_STATUS_LABEL] ?? filter}
              <span className={`ml-1.5 ${active === filter ? "text-paper/80" : "text-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      {applications.length > 0 ? (
        <div className="mt-4 grid gap-2.5">
          {applications.map((provider) => (
            <Link
              key={provider.id}
              href={`/admin/applications/${provider.id}`}
              className="card flex flex-wrap items-center gap-3 p-3 transition-colors hover:border-ink"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {provider.photos[0] ? (
                  <Image src={provider.photos[0].url} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[8px] text-muted">No photo</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12px] font-semibold">{provider.displayName}</p>
                  <span className={`pill !text-[8px] ${statusTone(provider.status)}`}>
                    {PROVIDER_STATUS_LABEL[provider.status as keyof typeof PROVIDER_STATUS_LABEL] ?? provider.status}
                  </span>
                </div>
                <p className="mt-0.5 text-[9.5px] text-muted">
                  {provider.category.name} · {provider.neighbourhood} · {provider.type === "BUSINESS" ? "Business" : "Independent"} ·{" "}
                  {provider._count.services} {provider._count.services === 1 ? "service" : "services"} ·{" "}
                  {provider._count.photos} {provider._count.photos === 1 ? "photo" : "photos"}
                </p>
                <p className="mt-1 text-[8.5px] text-muted">{provider.user.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[8.5px] text-muted">
                  {provider.submittedAt ? `Submitted ${formatRelative(provider.submittedAt)}` : "Not submitted"}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-medium">
                  Review <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <Clock className="mx-auto h-6 w-6 text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold">Nothing in this state</p>
          <p className="mt-1 text-[10px] text-muted">New applications will appear here for review.</p>
        </div>
      )}
    </div>
  );
}
