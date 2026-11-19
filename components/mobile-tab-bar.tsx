"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, CalendarCheck, UserRound } from "lucide-react";

const tabs = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/account#requests", label: "Requests", icon: CalendarCheck },
  { href: "/account", label: "Account", icon: UserRound },
];

export function MobileTabBar({ isAuthed }: { isAuthed: boolean }) {
  const pathname = usePathname();

  // Detail pages use a sticky request bar instead of the tab bar.
  if (pathname.startsWith("/providers/")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const href = !isAuthed && tab.label === "Requests" ? "/login?next=/account" : tab.href;
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href.split("#")[0] || "/account");
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
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
