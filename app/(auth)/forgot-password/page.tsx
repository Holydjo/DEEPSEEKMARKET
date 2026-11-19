import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { requestPasswordResetAction } from "@/app/actions/password-reset";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("auth.resetRequestTitle"), robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const { locale, t } = await getTranslator();

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="eyebrow">{t("auth.resetRequestTitle")}</p>
      <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.4rem)]">
        {t("auth.resetRequestTitle")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("auth.resetRequestIntro")}
      </p>

      <div className="card mt-7 p-5 md:p-7">
        <ActionForm action={requestPasswordResetAction} className="grid gap-4" locale={locale}>
          <div>
            <label htmlFor="email" className="label">{t("auth.emailAddress")}</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <SubmitButton className="btn btn-primary btn-block" pendingLabel={t("common.loading")}>
            {t("auth.resetRequestSubmit")}
          </SubmitButton>
        </ActionForm>
        <p className="mt-4 text-center text-xs text-muted">
          <Link href="/login" className="font-semibold text-ink underline decoration-line underline-offset-4">
            <ArrowLeft className="mr-1 inline h-3 w-3" aria-hidden />
            {t("auth.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
