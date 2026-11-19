import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin-nav";
import { NotificationBell } from "@/components/notification-bell";
import { initials } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="container-hd flex h-16 items-center gap-3">
          <Logo compact />
          <span className="rounded-full border border-ink bg-ink px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-paper">
            Admin
          </span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <span className="hidden text-[10px] text-muted sm:block">{admin.email}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[8px] font-bold text-paper">
              {initials(admin.name)}
            </span>
            <form action={logoutAction}>
              <button className="flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-[10px] text-muted hover:border-ink hover:text-ink">
                <LogOut className="h-3 w-3" aria-hidden /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-hd pb-2 pt-2 lg:hidden">
        <AdminNav />
      </div>

      <div className="container-hd grid gap-6 py-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="rounded-xl border border-line bg-surface p-2.5">
              <AdminNav />
            </div>
            <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Trust team
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-muted">
                Approval decisions are recorded with your account and a timestamp.
              </p>
            </div>
            <Link href="/" className="mt-3 block px-1 text-[9px] text-muted underline decoration-line underline-offset-2">
              Back to marketplace
            </Link>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
