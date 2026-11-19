import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/logo";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { createProviderDraftAction, providerJoinAction } from "@/app/actions/auth";

export const metadata = {
  title: "Become a provider",
  description: "Create a free, human-reviewed provider profile on HOLYDO MARKET.",
};

export const dynamic = "force-dynamic";

export default async function ProviderJoinPage() {
  const user = await getCurrentUser();

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

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="container-hd flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted sm:inline">
              Provider application
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Marketplace
            </Link>
            <span className="text-line">·</span>
            <Link href="/login" className="font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </header>

      <div className="container-hd grid gap-10 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-14">
        <main>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] text-paper">1</span>
            Step 1 of 7 · Account
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
            Make your work easy to find.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Create a free provider account. You’ll build your profile over seven short
            steps, then a person on our team reviews it before it goes public.
          </p>

          <div className="card mt-7 p-5 md:p-7">
            {user ? (
              <ActionForm action={createProviderDraftAction} className="grid gap-4">
                <div className="rounded-xl border border-pine/20 bg-pine-soft px-3.5 py-3 text-[11px] text-pine">
                  You’re signed in as <strong>{user.name}</strong> ({user.email}). Choose your
                  main category to start a provider profile on this account.
                </div>
                <div>
                  <label htmlFor="categoryId" className="label">What do you do? <span className="text-clay">*</span></label>
                  <select id="categoryId" name="categoryId" required className="input" defaultValue="">
                    <option value="" disabled>Choose your main category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-muted">You can add services in other categories later.</p>
                </div>
                <SubmitButton className="btn btn-primary btn-block" pendingLabel="Creating your draft…">
                  Start my provider application
                </SubmitButton>
              </ActionForm>
            ) : (
              <ActionForm action={providerJoinAction} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">Your name <span className="text-clay">*</span></label>
                    <input id="name" name="name" required autoComplete="name" placeholder="Nadia Bélanger" className="input" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">Phone <span className="text-clay">*</span></label>
                    <input id="phone" name="phone" required autoComplete="tel" inputMode="tel" placeholder="+1 514 555 0142" className="input" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="label">Email <span className="text-clay">*</span></label>
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" />
                </div>
                <div>
                  <label htmlFor="password" className="label">Password <span className="text-clay">*</span></label>
                  <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className="input" />
                </div>
                <div>
                  <label htmlFor="categoryId" className="label">What do you do? <span className="text-clay">*</span></label>
                  <select id="categoryId" name="categoryId" required className="input" defaultValue="">
                    <option value="" disabled>Choose your main category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-muted">This helps us set up your profile. You can add services in other categories later.</p>
                </div>
                <div className="rounded-xl bg-surface-2 px-3.5 py-3 text-[10px] leading-relaxed text-muted">
                  By continuing you agree to the provider terms and confirm that the
                  information you provide can be checked by our review team.
                </div>
                <SubmitButton className="btn btn-primary btn-block" pendingLabel="Creating your account…">
                  Create account &amp; continue
                </SubmitButton>
                <p className="text-center text-[10px] text-muted">
                  Already have an account?{" "}
                  <Link href="/login?next=/provider/join" className="font-semibold text-ink underline decoration-line underline-offset-4">
                    Log in
                  </Link>
                </p>
              </ActionForm>
            )}
          </div>

          <p className="mt-4 text-[10px] text-muted">
            Free during launch · no commission on appointment requests · no card required
          </p>
        </main>

        <aside className="space-y-3">
          <div className="rounded-card border border-ink bg-surface p-5 shadow-[4px_4px_0_var(--color-ink)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">What happens next</p>
            </div>
            <div className="mt-4 grid gap-2.5">
              {[
                ["Build your profile", "Services, prices, photos, hours, location and travel area."],
                ["Submit for review", "A person checks the details, usually within 48 hours."],
                ["Go live", "Your profile appears in search and gets its own shareable URL."],
                ["Manage requests", "Accept, decline or suggest another time from your dashboard."],
              ].map(([title, text], index) => (
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
              <Clock className="h-3 w-3" aria-hidden /> About 12 minutes to complete
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Approval is a feature
            </p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Your profile stays private until approved. If something is missing, you’ll
              get a clear note and can resubmit.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Just exploring?
            </p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Use the demo pending provider account from the{" "}
              <Link href="/login" className="underline decoration-line underline-offset-2">login page</Link>{" "}
              to see the review state without creating a profile.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 text-[9px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Check className="h-3 w-3" aria-hidden /> What we check
            </p>
            Identity and contact, services and prices, at least one original photo, opening
            hours, and the declared service area.
          </div>
        </aside>
      </div>
    </div>
  );
}
