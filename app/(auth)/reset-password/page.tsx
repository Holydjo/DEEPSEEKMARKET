import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import { findValidResetToken } from "@/lib/password-reset";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { resetPasswordAction } from "@/app/actions/password-reset";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("auth.resetTitle"), robots: { index: false } };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { locale, t } = await getTranslator();
  const reset = token ? await findValidResetToken(token) : null;
  const valid =
    reset && !reset.usedAt && reset.expiresAt.getTime() > Date.now();

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="eyebrow">{t("auth.resetTitle")}</p>
      <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.4rem)]">
        {t("auth.resetTitle")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t("auth.resetIntro")}
      </p>

      <div className="card mt-7 p-5 md:p-7">
        {valid ? (
          <ActionForm action={resetPasswordAction} className="grid gap-4" locale={locale}>
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="password" className="label">{t("auth.newPassword")}</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="label">{t("auth.confirmPassword")}</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="input"
              />
            </div>
            <SubmitButton className="btn btn-primary btn-block" pendingLabel={t("common.loading")}>
              {t("auth.resetSubmit")}
            </SubmitButton>
          </ActionForm>
        ) : (
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-soft text-clay">
              <KeyRound className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold">{t("auth.resetInvalid")}</p>
            <Link href="/forgot-password" className="btn btn-primary btn-sm mt-4">
              {t("auth.resetRequestSubmit")}
            </Link>
          </div>
        )}

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
