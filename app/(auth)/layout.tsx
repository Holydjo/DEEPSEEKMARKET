import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { getTranslator } from "@/lib/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, t } = await getTranslator();
  return (
    <div className="min-h-screen bg-paper">
      <header className="container-hd flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <LocaleSwitcher locale={locale} compact />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("auth.backMarketplace")}
          </Link>
        </div>
      </header>
      <main className="container-hd pb-16 pt-6 md:pt-10">{children}</main>
    </div>
  );
}
