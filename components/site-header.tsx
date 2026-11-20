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
import { getTranslator } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionary";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "./logo";
import { LocaleSwitcher } from "./locale-switcher";
import { NotificationBell } from "./notification-bell";

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

function LocationMenu({
  compact = false,
  t,
}: {
  compact?: boolean;
  t: Translate;
}) {
  return (
    <details className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-line bg-surface font-medium transition-colors hover:border-ink [&::-webkit-details-marker]:hidden ${
          compact ? "px-2.5 py-1.5 text-[10.5px]" : "px-3 py-2 text-[11.5px]"
        }`}
        aria-label={t("location.choose")}
      >
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        <span>{t("location.montreal")}</span>
        <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-ink bg-surface p-2 shadow-[4px_4px_0_var(--color-ink)]">
        <p className="px-2 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
          {t("location.browse")}
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
            {t("location.all")}
          </Link>
        </div>
      </div>
    </details>
  );
}

export async function SiteHeader() {
  const [{ locale, t }, user] = await Promise.all([getTranslator(), getCurrentUser()]);
  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "PROVIDER"
        ? "/provider/dashboard"
        : "/account";

  return (
    <>
      <section aria-label={t("topbar.region")} className="hidden border-b border-ink bg-ink text-paper md:block">
        <div className="container-hd flex h-8 items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-marigold" />
            {t("topbar.live")} · {t("topbar.reviewed")}
          </span>
          <div className="flex items-center gap-3">
            <Link href="/for-providers" className="underline underline-offset-2 hover:text-marigold">
              {t("topbar.list")}
            </Link>
            <LocaleSwitcher locale={locale} compact />
          </div>
        </div>
      </section>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="container-hd flex h-[62px] items-center gap-5">
          <Logo />

          <nav className="ml-2 hidden items-center gap-6 text-[12.5px] text-ink-soft lg:flex">
            <Link href="/search" className="hover:text-ink">
              {t("nav.discover")}
            </Link>
            <Link href="/#categories" className="hover:text-ink">
              {t("nav.categories")}
            </Link>
            <Link href="/how-it-works" className="hover:text-ink">
              {t("nav.howItWorks")}
            </Link>
            <Link href="/for-providers" className="hover:text-ink">
              {t("nav.forProviders")}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <LocationMenu t={t} />
            </div>
            <div className="sm:hidden">
              <LocationMenu compact t={t} />
            </div>

            {user ? (
              <>
                <NotificationBell />
                <Link
                  href="/saved"
                  aria-label={t("nav.savedProviders")}
                  title={t("nav.savedProviders")}
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted hover:border-ink hover:text-clay sm:flex"
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
                    ? t("nav.admin")
                    : user.role === "PROVIDER"
                      ? t("nav.dashboard")
                      : t("nav.account")}
                </Link>
                {user.role === "CUSTOMER" && (
                  <Link href="/provider/join" className="btn btn-primary btn-sm hidden md:inline-flex">
                    {t("nav.listService")}
                  </Link>
                )}
                <form action={logoutAction} className="hidden md:block">
                  <button className="btn btn-ghost btn-sm">
                    <LogOut className="h-3.5 w-3.5" aria-hidden /> {t("nav.logout")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden px-2 text-[12px] font-medium hover:underline sm:block">
                  {t("nav.login")}
                </Link>
                <Link href="/provider/join" className="btn btn-primary btn-sm hidden md:inline-flex">
                  {t("nav.listService")}
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <details className="group relative md:hidden">
              <summary
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface [&::-webkit-details-marker]:hidden"
                aria-label={t("nav.menu")}
              >
                <Menu className="h-4 w-4" aria-hidden />
                <span className="sr-only">{t("nav.menu")}</span>
              </summary>
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-ink bg-surface p-3 shadow-[4px_4px_0_var(--color-ink)]">
                <div className="grid gap-1">
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/search">
                    {t("nav.discoverServices")}
                  </Link>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/#categories">
                    {t("nav.categories")}
                  </Link>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/how-it-works">
                    {t("nav.howItWorks")}
                  </Link>
                  <Link className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2" href="/for-providers">
                    {t("nav.forProviders")}
                  </Link>
                </div>
                <div className="my-2 h-px bg-line" />
                <div className="grid gap-1">
                  <Link
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                    href={user ? dashboardHref : "/login"}
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                    {user ? t("nav.yourAccount") : t("nav.login")}
                  </Link>
                  {user && (
                    <Link
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                      href={user.role === "PROVIDER" ? "/provider/dashboard" : user.role === "ADMIN" ? "/admin" : "/account"}
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden />
                      {user.role === "PROVIDER"
                        ? t("nav.providerDashboard")
                        : user.role === "ADMIN"
                          ? t("nav.admin")
                          : t("nav.yourRequests")}
                    </Link>
                  )}
                </div>
                <div className="mt-3">
                  <LocaleSwitcher locale={locale} />
                </div>
                {!user && (
                  <Link href="/provider/join" className="btn btn-primary btn-block mt-3">
                    {t("nav.listService")}
                  </Link>
                )}
                {user && (
                  <form action={logoutAction} className="mt-2">
                    <button className="btn btn-outline btn-block btn-sm">
                      <LogOut className="h-3.5 w-3.5" aria-hidden /> {t("nav.logout")}
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
