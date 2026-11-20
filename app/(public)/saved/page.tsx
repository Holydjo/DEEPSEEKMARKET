import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { providerCardInclude } from "@/lib/search";
import { MONTREAL, haversineKm } from "@/lib/location";
import { isOpenNow } from "@/lib/format";
import { getTranslator } from "@/lib/i18n/server";
import { ProviderCard } from "@/components/provider-card";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("saved.meta.title"),
    robots: { index: false, follow: false },
  };
}

export default async function SavedProvidersPage() {
  const [{ locale, t }, user] = await Promise.all([getTranslator(), getCurrentUser()]);
  if (!user) redirect("/login?next=/saved");

  const saved = await db.savedProvider.findMany({
    where: { userId: user.id, provider: { status: "APPROVED" } },
    include: { provider: { include: providerCardInclude } },
    orderBy: { createdAt: "desc" },
  });

  const origin = MONTREAL.neighbourhoods[0];

  return (
    <div className="container-hd py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("saved.eyebrow")}</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.8rem)]">
            {t("saved.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {saved.length > 0
              ? saved.length === 1
                ? t("saved.subtitle.one", { count: saved.length })
                : t("saved.subtitle.many", { count: saved.length })
              : t("saved.subtitle.empty")}
          </p>
        </div>
        <Link href="/search" className="btn btn-primary btn-sm">
          <Search className="h-3.5 w-3.5" aria-hidden /> {t("saved.findMore")}
        </Link>
      </div>

      {saved.length > 0 ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <h2 className="sr-only">{t("saved.eyebrow")}</h2>
          {saved.map(({ provider }) => {
            const minPrice = provider.services.length
              ? Math.min(...provider.services.map((service) => service.priceCents))
              : null;
            const distance = haversineKm(origin, { lat: provider.lat, lng: provider.lng });
            return (
              <ProviderCard
                key={provider.id}
                provider={provider}
                distanceKm={distance}
                minPriceCents={minPrice}
                openNow={isOpenNow(provider.hours)}
                saved
                isAuthed
                locale={locale}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-soft text-clay">
            <Heart className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl">{t("saved.emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
            {t("saved.emptyBody")}
          </p>
          <Link href="/search" className="btn btn-primary btn-sm mt-5">
            {t("saved.browse")}
          </Link>
        </div>
      )}

      <p className="mt-6 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] leading-relaxed text-muted">
        <strong className="text-ink">{t("saved.noteTitle")}</strong> {t("saved.noteBody")}
      </p>
    </div>
  );
}
