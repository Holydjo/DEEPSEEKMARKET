import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslator();

  return (
    <div className="container-hd flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {t("notFound.code")}
      </span>
      <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4.5rem)]">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {t("notFound.body")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary btn-sm">
          <Compass className="h-3.5 w-3.5" aria-hidden /> {t("notFound.home")}
        </Link>
        <Link href="/search" className="btn btn-outline btn-sm">
          <Search className="h-3.5 w-3.5" aria-hidden /> {t("notFound.search")}
        </Link>
      </div>
    </div>
  );
}
