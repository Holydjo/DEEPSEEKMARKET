import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import { Logo } from "./logo";

export async function SiteFooter() {
  const { t } = await getTranslator();

  return (
    <footer className="border-t border-ink bg-surface pb-24 pt-12 md:pb-8">
      <div className="container-hd">
        <div className="grid gap-9 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[260px] text-[12px] leading-relaxed text-muted">
              {t("footer.tagline")}
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
              <MapPin className="h-3 w-3" aria-hidden /> {t("footer.location")}
            </p>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              {t("footer.discover")}
            </p>
            <div className="mt-3 grid gap-2 text-[12px]">
              <Link href="/search" className="hover:underline">{t("footer.allServices")}</Link>
              <Link href="/search?category=braids" className="hover:underline">{t("footer.braids")}</Link>
              <Link href="/search?category=cleaning" className="hover:underline">{t("footer.cleaning")}</Link>
              <Link href="/search?category=repairs" className="hover:underline">{t("footer.repairs")}</Link>
              <Link href="/how-it-works" className="hover:underline">{t("footer.howItWorks")}</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              {t("footer.providers")}
            </p>
            <div className="mt-3 grid gap-2 text-[12px]">
              <Link href="/for-providers" className="hover:underline">{t("footer.why")}</Link>
              <Link href="/provider/join" className="hover:underline">{t("footer.create")}</Link>
              <Link href="/login" className="hover:underline">{t("footer.providerLogin")}</Link>
              <Link href="/how-it-works#approval" className="hover:underline">{t("footer.approval")}</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              {t("footer.company")}
            </p>
            <div className="mt-3 grid gap-2 text-[12px]">
              <Link href="/how-it-works" className="hover:underline">{t("footer.trust")}</Link>
              <Link href="/for-providers" className="hover:underline">{t("footer.about")}</Link>
              <a href="mailto:hello@holydo.market" className="inline-flex items-center gap-1.5 hover:underline">
                <Mail className="h-3 w-3" aria-hidden /> {t("footer.contact")}
              </a>
              <span className="text-muted">{t("footer.privacy")}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono uppercase tracking-[0.08em]">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Instagram className="h-3 w-3" aria-hidden /> @holydomarket
            </span>
            <span>{t("footer.language")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
