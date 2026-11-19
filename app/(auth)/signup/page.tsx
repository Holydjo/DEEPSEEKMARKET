import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { signupAction } from "@/app/actions/auth";

export const metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");
  const { next } = await searchParams;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
      <section className="mx-auto w-full max-w-lg">
        <p className="eyebrow">Customer account</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)]">
          Save your favourites
          <span className="text-clay">.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Create a free account to track appointment requests, keep your review history,
          and contact providers faster next time.
        </p>

        <div className="card mt-7 p-5 md:p-7">
          <ActionForm action={signupAction} className="grid gap-4">
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input id="name" name="name" autoComplete="name" required placeholder="Amina Kone" className="input" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className="input" />
              <p className="mt-1 text-[10px] text-muted">Use at least 8 characters.</p>
            </div>
            <SubmitButton className="btn btn-primary btn-block mt-1" pendingLabel="Creating account…">
              Create account
            </SubmitButton>
          </ActionForm>
          <p className="mt-4 text-center text-[10px] leading-relaxed text-muted">
            By creating an account you agree to the marketplace terms and privacy policy.
            This is a demo environment.
          </p>
          <p className="mt-3 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink underline decoration-line underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </section>

      <aside className="rounded-card border border-line bg-surface p-6 md:p-8">
        <p className="eyebrow">What you get</p>
        <ul className="mt-5 grid gap-4 text-sm">
          {[
            ["One place for requests", "See every appointment request and the provider’s response, with a reference you can share."],
            ["Reviews that count", "Leave a review after your appointment. Reviews linked to a completed request are marked as verified."],
            ["No booking fees", "HOLYDO does not take a cut of your appointment. You agree on the details directly with the provider."],
          ].map(([title, text]) => (
            <li key={title} className="border-t border-line pt-4 first:border-0 first:pt-0">
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-xl bg-surface-2 p-4">
          <p className="text-xs font-semibold">Offering a service?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Provider accounts are created through the application flow, not here.
          </p>
          <Link href="/provider/join" className="btn btn-outline btn-sm mt-3">
            Apply as a provider →
          </Link>
        </div>
      </aside>
    </div>
  );
}
