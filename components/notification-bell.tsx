import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { unreadNotificationCount } from "@/lib/notifications";

export async function NotificationBell({ className = "" }: { className?: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ t }, count] = await Promise.all([
    getTranslator(),
    unreadNotificationCount(user.id),
  ]);

  return (
    <Link
      href="/notifications"
      aria-label={t("notifications.title")}
      title={t("notifications.title")}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-muted hover:border-ink hover:text-ink ${className}`}
    >
      <Bell className="h-3.5 w-3.5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[8px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
