import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MONTREAL } from "@/lib/location";
import { initials } from "@/lib/format";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "./logo";

function LocationMenu({ compact = false }: { compact?: boolean }) {
  return (
    <details className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-line bg-surface font-medium transition-colors hover:border-ink [&::-webkit-details-marker]:hidden ${
          compact ? "px-2.5 py-1.5 text-[10.5px]" : "px-3 py-2 text-[11.5px]"
        }`}
        aria-label="Choose a neighbourhood"
      >
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        <span>Montréal</span>
        <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-ink bg-surface p-2 shadow-[4px_4px_0_var(--color-ink)]">
        <p className="px-2 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
          Browse a neighbourhood
        </p>
        <div className="grid grid-cols-2 gap-1">
          {MONTREAL.neighbourhoods.slice(0, 10).map((hood) => (
            <Link
              key={hood.slug}
              href={`/search?city=montreal&hood=${hood.slug}`}
              className="rounded-lg px-2 py-1.5 text-[11px] hover:bg-surface-2"
            >
              {hood.name}
            </Link>
          ))}
        </div>
        <div className="mt-1 border-t border-line pt-1">
          <Link
            href="/search?city=montreal"
            className="block rounded-lg px-2 py-1.5 text-[11px] font-semibold hover:bg-surface-2"
          >
            All of Montréal →
          </Link>
        </div>
      </div>
    </details>
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "PROVIDER"
        ? "/provider/dashboard"
        : "/account";

  return (
    <>
      <div className="hidden border-b border-ink bg-ink text-paper md:block">
        <div className="container-hd flex h-8 items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-marigold" />
            Now live in Montréal · Every provider reviewed by a person
          </span>
          <Link href="/for-providers" className="underline underline-offset-2 hover:text-marigold">
            List your service →
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="container-hd flex h-[62px] items-center gap-5">
          <Logo />

          <nav className="ml-2 hidden items-center gap-6 text-[12.5px] text-ink-soft lg:flex">
            <Link href="/search" className="hover:text-ink">
              Discover
            </Link>
            <Link href="/#categories" className="hover:text-ink">
              Categories
            </Link>
            <Link href="/how-it-works" className="hover:text-ink">
              How it works
            </Link>
            <Link href="/for-providers" className="hover:text-ink">
              For providers
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <LocationMenu />
            </div>
            <div className="sm:hidden">
              <LocationMenu compact />
            </div>

            {user ? (
              <>
                <Link
                  href="/saved"
                  aria-label="Saved providers"
                  title="Saved providers"
                  className="hidden h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-muted hover:border-ink hover:text-clay sm:flex"
                >
                  <Heart className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href={dashboardHref}
                  className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-[11.5px] font-medium hover:border-ink sm:flex"
                >
                  {user.role === "ADMIN" ? (
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[8px] font-bold text-paper">
                      {initials(user.name)}
                    </span>
                  )}
                  {user.role === "ADMIN"
                    ? "Admin"
                    : user.role === "PROVIDER"
                      ? "Dashboard"
                      : "Account"}
                </Link>
                {user.role === "CUSTOMER" && (
                  <Link href="/provider/join" className="btn btn-primary btn-sm hidden md:inline-flex">
                    List your service
                  </Link>
                )}
                <form action={logoutAction} className="hidden md:block">
                  <button className="btn btn-ghost btn-sm" title="Log out">
                    <LogOut className="h-3.5 w-3.5" aria-hidden /> Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden px-2 text-[12px] font-medium hover:underline sm:block">
                  Log in
                </Link>
                <Link href="/provider/join" className="btn btn-primary btn-sm hidden md:inline-flex">
                  List your service
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <details className="group relative md:hidden">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface [&::-webkit-details-marker]:hidden">
                <Menu className="h-4 w-4" aria-hidden />
                <span className="sr-only">Open menu</span>
              </summary>
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-ink bg-surface p-3 shadow-[4px_4px_0_var(--color-ink)]">
                <div className="grid gap-1">
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/search">
                    Discover services
                  </Link>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/#categories">
                    Categories
                  </Link>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/how-it-works">
                    How it works
                  </Link>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/for-providers">
                    For providers
                  </Link>
                </div>
                <div className="my-2 h-px bg-line" />
                <div className="grid gap-1">
                  <Link
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                    href={user ? dashboardHref : "/login"}
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                    {user ? "Your account" : "Log in"}
                  </Link>
                  {user && (
                    <Link
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                      href={user.role === "PROVIDER" ? "/provider/dashboard" : user.role === "ADMIN" ? "/admin" : "/account"}
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden />
                      {user.role === "PROVIDER" ? "Provider dashboard" : user.role === "ADMIN" ? "Admin" : "Your requests"}
                    </Link>
                  )}
                </div>
                {!user && (
                  <Link href="/provider/join" className="btn btn-primary btn-block mt-3">
                    List your service
                  </Link>
                )}
                {user && (
                  <form action={logoutAction} className="mt-2">
                    <button className="btn btn-outline btn-block btn-sm">
                      <LogOut className="h-3.5 w-3.5" aria-hidden /> Log out
                    </button>
                  </form>
                )}
              </div>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
