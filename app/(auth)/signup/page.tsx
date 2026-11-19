import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { signupAction } from "@/app/actions/auth";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("auth.meta.signup") };
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");
  const { next } = await searchParams;
  const { locale, t } = await getTranslator();

  const perks: Array<[string, string]> = [
    [t("signup.perks.1.title"), t("signup.perks.1.text")],
    [t("signup.perks.2.title"), t("signup.perks.2.text")],
    [t("signup.perks.3.title"), t("signup.perks.3.text")],
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
      <section className="mx-auto w-full max-w-lg">
        <p className="eyebrow">{t("signup.eyebrow")}</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)]">
          {t("signup.title")}
          <span className="text-clay">.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {t("signup.intro")}
        </p>

        <div className="card mt-7 p-5 md:p-7">
          <ActionForm action={signupAction} className="grid gap-4" locale={locale}>
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <label htmlFor="name" className="label">{t("auth.fullName")}</label>
              <input id="name" name="name" autoComplete="name" required placeholder="Amina Kone" className="input" />
            </div>
            <div>
              <label htmlFor="email" className="label">{t("auth.emailAddress")}</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label htmlFor="password" className="label">{t("auth.password")}</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder={t("signup.passwordPlaceholder")} className="input" />
              <p className="mt-1 text-[10px] text-muted">{t("signup.passwordHint")}</p>
            </div>
            <SubmitButton className="btn btn-primary btn-block mt-1" pendingLabel={t("signup.submitting")}>
              {t("signup.submit")}
            </SubmitButton>
          </ActionForm>
          <p className="mt-4 text-center text-[10px] leading-relaxed text-muted">
            {t("signup.terms")}
          </p>
          <p className="mt-3 text-center text-xs text-muted">
            {t("signup.haveAccount")}{" "}
            <Link href="/login" className="font-semibold text-ink underline decoration-line underline-offset-4">
              {t("signup.login")}
            </Link>
          </p>
        </div>
      </section>

      <aside className="rounded-card border border-line bg-surface p-6 md:p-8">
        <p className="eyebrow">{t("signup.perks.eyebrow")}</p>
        <ul className="mt-5 grid gap-4 text-sm">
          {perks.map(([title, text]) => (
            <li key={title} className="border-t border-line pt-4 first:border-0 first:pt-0">
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-xl bg-surface-2 p-4">
          <p className="text-xs font-semibold">{t("signup.provider.title")}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {t("signup.provider.body")}
          </p>
          <Link href="/provider/join" className="btn btn-outline btn-sm mt-3">
            {t("signup.provider.cta")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
