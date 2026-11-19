"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, Heart, UserRound } from "lucide-react";
import { translate } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

const tabs = [
  { href: "/", label: "tab.explore", icon: Compass, auth: false },
  { href: "/search", label: "tab.search", icon: Search, auth: false },
  { href: "/saved", label: "tab.saved", icon: Heart, auth: true },
  { href: "/account", label: "tab.account", icon: UserRound, auth: true },
] as const;

export function MobileTabBar({ isAuthed, locale }: { isAuthed: boolean; locale: Locale }) {
  const pathname = usePathname();

  // Detail pages use a sticky request bar instead of the tab bar.
  if (pathname.startsWith("/providers/")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label={translate(locale, "nav.main")}
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const href = !isAuthed && tab.auth ? `/login?next=${encodeURIComponent(tab.href)}` : tab.href;
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-medium ${
                active ? "text-ink" : "text-muted"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? "stroke-[2.4]" : ""}`} aria-hidden />
              {translate(locale, tab.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
