"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  LayoutDashboard,
  ListChecks,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import { translate, type MessageKey } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

const items: Array<{
  href: string;
  key: MessageKey;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: boolean;
}> = [
  { href: "/provider/dashboard", key: "pnav.overview", icon: LayoutDashboard, exact: true },
  { href: "/provider/dashboard/profile", key: "pnav.profile", icon: UserRound },
  { href: "/provider/dashboard/services", key: "pnav.services", icon: ListChecks },
  { href: "/provider/dashboard/requests", key: "pnav.requests", icon: CalendarCheck, badge: true },
  { href: "/provider/dashboard/reviews", key: "pnav.reviews", icon: Star },
];

export function ProviderNav({
  pendingCount,
  locale,
  variant = "desktop",
}: {
  pendingCount: number;
  locale: Locale;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={
        variant === "desktop"
          ? "grid gap-1"
          : "grid grid-cols-5 gap-1"
      }
      aria-label={translate(locale, "nav.providerDashboard")}
    >
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              variant === "desktop"
                ? `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11.5px] transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink-soft hover:bg-surface-2"
                  }`
                : `flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[9px] ${
                    active ? "bg-ink text-paper" : "text-muted"
                  }`
            }
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {translate(locale, item.key)}
            {item.badge && pendingCount > 0 && (
              <span
                className={`ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-bold ${
                  active ? "bg-marigold text-ink" : "bg-clay text-white"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
      {variant === "desktop" && (
        <Link
          href="/"
          className="mt-2 flex items-center gap-2.5 rounded-lg border-t border-line px-3 py-2.5 text-[11px] text-muted hover:text-ink"
        >
          <Store className="h-3.5 w-3.5" aria-hidden /> {translate(locale, "nav.marketplace")}
        </Link>
      )}
    </nav>
  );
}
