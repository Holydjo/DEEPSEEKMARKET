import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Star,
  Store,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative, initials } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  APPROVE: "approved",
  REJECT: "requested changes to",
  SUSPEND: "suspended",
  REINSTATE: "reinstated",
};

export default async function AdminOverviewPage() {
  const [pendingProviders, pendingCount, approvedCount, suspendedCount, requestCount, reviewCount, customerCount, recentActions] =
    await Promise.all([
      db.provider.findMany({
        where: { status: "PENDING" },
        include: { category: true, photos: { take: 1 }, user: { select: { email: true } } },
        orderBy: { submittedAt: "asc" },
        take: 5,
      }),
      db.provider.count({ where: { status: "PENDING" } }),
      db.provider.count({ where: { status: "APPROVED" } }),
      db.provider.count({ where: { status: "SUSPENDED" } }),
      db.bookingRequest.count(),
      db.review.count({ where: { status: "PUBLISHED" } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.adminAction.findMany({
        include: { provider: { select: { displayName: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Trust &amp; safety</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">The review desk.</h1>
          <p className="mt-1 text-[11px] text-muted">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? "application needs" : "applications need"} a decision.`
              : "No pending applications. The queue is clear."}
          </p>
        </div>
        <Link href="/admin/applications" className="btn btn-primary btn-sm">
          Open queue <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Pending review", value: pendingCount, icon: ClipboardCheck, href: "/admin/applications", tone: "text-clay" },
          { label: "Approved providers", value: approvedCount, icon: BadgeCheck, href: "/admin/providers?status=APPROVED", tone: "text-pine" },
          { label: "Appointment requests", value: requestCount, icon: CalendarCheck, href: "/admin/providers", tone: "text-ink" },
          { label: "Published reviews", value: reviewCount, icon: Star, href: "/admin/providers", tone: "text-ink" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-3.5 transition-colors hover:border-ink">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted">{stat.label}</span>
              <stat.icon className={`h-3.5 w-3.5 ${stat.tone}`} aria-hidden />
            </div>
            <p className="mt-1.5 font-display text-3xl leading-none">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="card p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Oldest first</p>
              <h2 className="mt-1 text-xl">Waiting for a decision</h2>
            </div>
            <Link href="/admin/applications" className="text-[10px] font-medium underline decoration-line underline-offset-4">
              All applications →
            </Link>
          </div>

          {pendingProviders.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {pendingProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/admin/applications/${provider.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-paper p-2.5 transition-colors hover:border-ink"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {provider.photos[0] ? (
                      <Image src={provider.photos[0].url} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[8px] text-muted">No photo</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-semibold">{provider.displayName}</p>
                    <p className="text-[9px] text-muted">
                      {provider.category.name} · {provider.neighbourhood} · {provider.type === "BUSINESS" ? "Business" : "Independent"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="pill pill-marigold !text-[8px]">In review</span>
                    <p className="mt-1 inline-flex items-center gap-1 text-[8px] text-muted">
                      <Clock className="h-2.5 w-2.5" aria-hidden />
                      {provider.submittedAt ? formatRelative(provider.submittedAt) : "recently"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-6 text-center">
              <BadgeCheck className="mx-auto h-5 w-5 text-pine" aria-hidden />
              <p className="mt-2 text-[11px] font-semibold">Queue clear</p>
              <p className="mt-1 text-[9.5px] text-muted">New applications will appear here.</p>
            </div>
          )}
        </section>

        <section className="card p-4 md:p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted" aria-hidden />
            <h2 className="text-lg">Marketplace health</h2>
          </div>
          <div className="mt-3 grid gap-2 text-[10px]">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-muted">Approved providers</span>
              <b>{approvedCount}</b>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-muted">Suspended</span>
              <b>{suspendedCount}</b>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-muted">Customers</span>
              <b>{customerCount}</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Reviews published</span>
              <b>{reviewCount}</b>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-surface-2 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold">
              <Store className="h-3.5 w-3.5" aria-hidden /> Reminder
            </p>
            <p className="mt-1 text-[9px] leading-relaxed text-muted">
              Approval makes a profile public immediately. Re-check photos, prices and location
              before saying yes.
            </p>
          </div>
          <Link href="/admin/providers" className="mt-3 inline-flex items-center gap-1 text-[9.5px] font-medium underline decoration-line underline-offset-2">
            Browse all providers →
          </Link>
        </section>
      </div>

      <section className="card mt-4 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Recent decisions</h2>
          <span className="text-[9px] text-muted">Audit trail</span>
        </div>
        {recentActions.length > 0 ? (
          <div className="mt-3 divide-y divide-line">
            {recentActions.map((action) => (
              <div key={action.id} className="flex flex-wrap items-center gap-2 py-2.5 text-[10px] first:pt-0 last:pb-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[7px] font-bold">
                  {initials(action.provider.displayName)}
                </span>
                <p className="text-ink-soft">
                  <span className="font-semibold text-ink">Trust team</span> {ACTION_LABEL[action.action] ?? action.action}{" "}
                  <span className="font-semibold text-ink">{action.provider.displayName}</span>
                </p>
                <span className="ml-auto text-[8.5px] text-muted">{formatRelative(action.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-muted">No decisions recorded yet.</p>
        )}
      </section>
    </div>
  );
}
