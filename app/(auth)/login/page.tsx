import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/app/actions/auth";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("auth.meta.login") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : user.role === "PROVIDER" ? "/provider/dashboard" : "/account");
  }
  const { next, reset } = await searchParams;
  const { locale, t } = await getTranslator();

  const demoAccounts = [
    {
      role: t("auth.demo.customer"),
      email: "amina@example.com",
      password: "Customer123!",
      note: t("auth.demo.note.customer"),
    },
    {
      role: t("auth.demo.provider"),
      email: "nadia@example.com",
      password: "Provider123!",
      note: t("auth.demo.note.provider"),
    },
    {
      role: t("auth.demo.pending"),
      email: "naya@example.com",
      password: "Provider123!",
      note: t("auth.demo.note.pending"),
    },
    {
      role: t("auth.demo.draft"),
      email: "rose@example.com",
      password: "Provider123!",
      note: t("auth.demo.note.draft"),
    },
    {
      role: t("auth.demo.admin"),
      email: "admin@holydo.market",
      password: "Admin123!",
      note: t("auth.demo.note.admin"),
    },
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
      <section className="mx-auto w-full max-w-lg">
        <p className="eyebrow">{t("auth.welcome")}</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)]">
          {t("auth.loginTitle")}
          <span className="text-clay">.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {t("auth.loginIntro")}
        </p>

        <div className="card mt-7 p-5 md:p-7">
          {reset === "success" && (
            <div role="status" className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-3.5 py-2.5 text-xs font-medium text-pine">
              {t("email.reset.success")}
            </div>
          )}
          <ActionForm action={loginAction} className="grid gap-4" locale={locale}>
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <label htmlFor="email" className="label">{t("auth.emailAddress")}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">{t("auth.password")}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="input"
              />
            </div>
            <SubmitButton className="btn btn-primary btn-block mt-1" pendingLabel={t("common.loading")}>
              {t("auth.loginSubmit")}
            </SubmitButton>
          </ActionForm>
          <p className="mt-3 text-center text-xs">
            <Link href="/forgot-password" className="font-medium text-muted underline decoration-line underline-offset-4 hover:text-ink">
              {t("auth.forgot")}
            </Link>
          </p>

          <p className="mt-5 text-center text-xs text-muted">
            {t("auth.newHere")}{" "}
            <Link href="/signup" className="font-semibold text-ink underline decoration-line underline-offset-4">
              {t("auth.createCustomer")}
            </Link>
          </p>
          <p className="mt-1 text-center text-xs text-muted">
            {t("auth.offerServices")}{" "}
            <Link href="/provider/join" className="font-semibold text-ink underline decoration-line underline-offset-4">
              {t("auth.applyProvider")}
            </Link>
          </p>
        </div>
      </section>

      <aside className="rounded-card border border-ink bg-pine p-6 text-paper shadow-[5px_5px_0_var(--color-ink)] md:p-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-marigold" aria-hidden />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/80">
            {t("auth.demo.eyebrow")}
          </p>
        </div>
        <h2 className="mt-3 text-2xl text-paper">{t("auth.demo.title")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-paper/65">
          {t("auth.demo.body")}
        </p>

        <div className="mt-5 grid gap-2.5">
          {demoAccounts.map((account) => (
            <div key={account.email} className="rounded-xl border border-paper/15 bg-paper/5 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-marigold">{account.role}</span>
                <span className="text-[9px] text-paper/75">{account.note}</span>
              </div>
              <div className="mt-1.5 font-mono text-[10.5px] leading-relaxed text-paper/90">
                {account.email}
                <br />
                {account.password}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[10px] leading-relaxed text-paper/75">
          <ArrowUpRight className="mr-1 inline h-3 w-3" aria-hidden />
          {t("auth.demo.seededStart")} <code>prisma/seed.ts</code>
          {t("auth.demo.seededEnd")}
        </p>
      </aside>
    </div>
  );
}
