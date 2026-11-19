import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  Check,
  ClipboardCheck,
  MessageSquareText,
  Star,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { formatRelative } from "@/lib/format";
import { markAllNotificationsReadAction } from "@/app/actions/notifications";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications", robots: { index: false } };

function iconFor(type: string) {
  if (type.startsWith("BOOKING")) return CalendarCheck;
  if (type.startsWith("PROVIDER")) return ClipboardCheck;
  if (type === "REVIEW_RECEIVED") return Star;
  if (type === "PROVIDER_APPLICATION") return MessageSquareText;
  return Bell;
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const [{ locale, t }, notifications] = await Promise.all([
    getTranslator(),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  ]);

  const unread = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="container-hd max-w-3xl py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("notifications.title")}</p>
          <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3.2rem)]">
            {t("notifications.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("notifications.subtitle")}</p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="btn btn-outline btn-sm">
              <Check className="h-3.5 w-3.5" aria-hidden /> {t("notifications.markAll")}
            </button>
          </form>
        )}
      </div>

      {unread > 0 && (
        <p className="mt-4 inline-flex rounded-full border border-marigold/50 bg-marigold-soft px-2.5 py-1 text-[9.5px] font-medium text-ink">
          {t("notifications.unread", { count: unread })}
        </p>
      )}

      {notifications.length > 0 ? (
        <div className="mt-5 grid gap-2">
          {notifications.map((notification) => {
            const Icon = iconFor(notification.type);
            return (
              <article
                key={notification.id}
                className={`flex gap-3 rounded-2xl border p-4 ${
                  notification.readAt
                    ? "border-line bg-surface"
                    : "border-marigold/50 bg-marigold-soft/30"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold">{notification.title}</p>
                    <span className="text-[8.5px] text-muted">
                      {formatRelative(notification.createdAt, locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    {notification.body}
                  </p>
                  {notification.href && (
                    <Link
                      href={notification.href}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold underline decoration-line underline-offset-2"
                    >
                      {t("notifications.view")} →
                    </Link>
                  )}
                </div>
                {!notification.readAt && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-clay" aria-label={t("notifications.unreadLabel")} />
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <Bell className="mx-auto h-6 w-6 text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold">{t("notifications.empty")}</p>
          <p className="mx-auto mt-1 max-w-sm text-[10.5px] text-muted">
            {t("notifications.emptyBody")}
          </p>
        </div>
      )}
    </div>
  );
}
