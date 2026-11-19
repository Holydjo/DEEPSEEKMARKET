import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { ProviderNav } from "@/components/provider-nav";
import { initials } from "@/lib/format";
import { PROVIDER_STATUS_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Provider dashboard", robots: { index: false } };

function statusTone(status: string): string {
  if (status === "APPROVED") return "pill-pine";
  if (status === "PENDING") return "pill-marigold";
  if (status === "REJECTED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "SUSPENDED") return "pill-dark";
  return "border-line bg-surface-2 text-muted";
}

export default async function ProviderDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, provider } = await requireProvider();
  const pendingCount = await db.bookingRequest.count({
    where: { providerId: provider.id, status: "PENDING" },
  });

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="container-hd flex h-16 items-center gap-3">
          <Logo compact />
          <span className="hidden rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted sm:inline">
            Provider studio
          </span>
          <span className={`pill !text-[8.5px] ${statusTone(provider.status)}`}>
            {PROVIDER_STATUS_LABEL[provider.status as keyof typeof PROVIDER_STATUS_LABEL] ?? provider.status}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {provider.status === "APPROVED" ? (
              <Link href={`/providers/${provider.slug}`} className="hidden text-[11px] font-medium underline decoration-line underline-offset-4 hover:decoration-ink sm:block">
                View public profile ↗
              </Link>
            ) : (
              <span className="hidden text-[10px] text-muted sm:block">Private until approved</span>
            )}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[8px] font-bold text-paper">
              {initials(user.name)}
            </span>
            <form action={logoutAction}>
              <button className="flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-[10px] text-muted hover:border-ink hover:text-ink">
                <LogOut className="h-3 w-3" aria-hidden />
                <span className="hidden md:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
        <div className="container-hd pb-2 lg:hidden">
          <ProviderNav pendingCount={pendingCount} variant="mobile" />
        </div>
      </header>

      <div className="container-hd grid gap-6 py-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="rounded-xl border border-line bg-surface p-2.5">
              <ProviderNav pendingCount={pendingCount} />
            </div>
            <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Human reviewed
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-muted">
                You can edit services and hours anytime. Major identity changes may be re-checked.
              </p>
            </div>
            <p className="mt-3 px-1 text-[8.5px] leading-relaxed text-muted">
              Signed in as {user.email}
            </p>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
