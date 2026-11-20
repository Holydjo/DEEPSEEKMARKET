import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { createProviderDraftAction, providerJoinAction } from "@/app/actions/auth";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("pjoin.metaTitle"),
    description: t("pjoin.metaDescription"),
  };
}

export const dynamic = "force-dynamic";

export default async function ProviderJoinPage() {
  const user = await getCurrentUser();
  const { locale, t } = await getTranslator();

  if (user?.provider) {
    redirect(
      user.provider.status === "DRAFT" || user.provider.status === "REJECTED"
        ? "/provider/onboarding?step=business"
        : "/provider/dashboard",
    );
  }

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const nextSteps: Array<[string, string]> = [
    [t("pjoin.next1Title"), t("pjoin.next1Text")],
    [t("pjoin.next2Title"), t("pjoin.next2Text")],
    [t("pjoin.next3Title"), t("pjoin.next3Text")],
    [t("pjoin.next4Title"), t("pjoin.next4Text")],
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="container-hd flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted sm:inline">
              {t("pcommon.application")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <LocaleSwitcher locale={locale} compact />
            <Link href="/" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("nav.marketplace")}
            </Link>
            <span className="text-line">·</span>
            <Link href="/login" className="font-medium hover:underline">
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </header>

      <div className="container-hd grid gap-10 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-14">
        <main>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] text-paper">1</span>
            {t("pcommon.stepProgress", { step: 1, total: 7, label: t("ponb.stepAccount") })}
          </div>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${index === 0 ? "bg-ink" : "bg-line"}`}
              />
            ))}
          </div>

          <h1 className="display mt-7 text-[clamp(2.4rem,5vw,4rem)]">
            {t("pjoin.title")}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            {t("pjoin.intro")}
          </p>

          <div className="card mt-7 p-5 md:p-7">
            {user ? (
              <ActionForm action={createProviderDraftAction} className="grid gap-4" locale={locale}>
                <div className="rounded-xl border border-pine/20 bg-pine-soft px-3.5 py-3 text-[11px] text-pine">
                  {t("pjoin.signedInBefore")} <strong>{user.name}</strong>{" "}
                  {t("pjoin.signedInAfter", { email: user.email })}
                </div>
                <div>
                  <label htmlFor="categoryId" className="label">{t("pjoin.category")} <span className="text-clay">*</span></label>
                  <select id="categoryId" name="categoryId" required className="input" defaultValue="">
                    <option value="" disabled>{t("pjoin.categoryPlaceholder")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-muted">{t("pjoin.categoryHelp")}</p>
                </div>
                <SubmitButton className="btn btn-primary btn-block" pendingLabel={t("pjoin.creatingDraft")}>
                  {t("pjoin.start")}
                </SubmitButton>
              </ActionForm>
            ) : (
              <ActionForm action={providerJoinAction} className="grid gap-4" locale={locale}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">{t("pjoin.yourName")} <span className="text-clay">*</span></label>
                    <input id="name" name="name" required autoComplete="name" placeholder="Nadia Bélanger" className="input" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">{t("common.phone")} <span className="text-clay">*</span></label>
                    <input id="phone" name="phone" required autoComplete="tel" inputMode="tel" placeholder="+1 514 555 0142" className="input" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="label">{t("common.email")} <span className="text-clay">*</span></label>
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" />
                </div>
                <div>
                  <label htmlFor="password" className="label">{t("auth.password")} <span className="text-clay">*</span></label>
                  <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder={t("pjoin.passwordHint")} className="input" />
                </div>
                <div>
                  <label htmlFor="categoryId" className="label">{t("pjoin.category")} <span className="text-clay">*</span></label>
                  <select id="categoryId" name="categoryId" required className="input" defaultValue="">
                    <option value="" disabled>{t("pjoin.categoryPlaceholder")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-muted">{t("pjoin.categoryHelpLong")}</p>
                </div>
                <div className="rounded-xl bg-surface-2 px-3.5 py-3 text-[10px] leading-relaxed text-muted">
                  {t("pjoin.terms")}
                </div>
                <SubmitButton className="btn btn-primary btn-block" pendingLabel={t("pjoin.creatingAccount")}>
                  {t("pjoin.createAccount")}
                </SubmitButton>
                <p className="text-center text-[10px] text-muted">
                  {t("pjoin.haveAccount")}{" "}
                  <Link href="/login?next=/provider/join" className="font-semibold text-ink underline decoration-line underline-offset-4">
                    {t("nav.login")}
                  </Link>
                </p>
              </ActionForm>
            )}
          </div>

          <p className="mt-4 text-[10px] text-muted">
            {t("pjoin.footnote")}
          </p>
        </main>

        <aside className="space-y-3">
          <div className="rounded-card border border-ink bg-surface p-5 shadow-[4px_4px_0_var(--color-ink)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{t("pjoin.nextTitle")}</p>
            </div>
            <div className="mt-4 grid gap-2.5">
              {nextSteps.map(([title, text], index) => (
                <div key={title} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-[8px] font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold">{title}</p>
                    <p className="text-[9.5px] leading-relaxed text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[9.5px] text-muted">
              <Clock className="h-3 w-3" aria-hidden /> {t("pjoin.nextTime")}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {t("pjoin.approvalTitle")}
            </p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              {t("pjoin.approvalBody")}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("pjoin.demoTitle")}
            </p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              {t("pjoin.demoBefore")}{" "}
              <Link href="/login" className="underline decoration-line underline-offset-2">{t("pjoin.demoLink")}</Link>{" "}
              {t("pjoin.demoAfter")}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 text-[9px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Check className="h-3 w-3" aria-hidden /> {t("pcommon.whatWeCheck")}
            </p>
            {t("pjoin.checksBody")}
          </div>
        </aside>
      </div>
    </div>
  );
}
