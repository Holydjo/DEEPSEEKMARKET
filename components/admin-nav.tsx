"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, LayoutDashboard, MessageSquareText, Store } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Applications", icon: ClipboardCheck },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/providers", label: "All providers", icon: Store },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-4 gap-1 lg:grid-cols-1" aria-label="Admin">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] lg:justify-start lg:gap-2.5 lg:px-3 lg:py-2.5 lg:text-[11.5px] ${
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-surface-2"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
