import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/app/actions/auth";

const demoAccounts = [
  {
    role: "Customer",
    email: "amina@example.com",
    password: "Customer123!",
    note: "Requests and reviews",
  },
  {
    role: "Provider",
    email: "nadia@example.com",
    password: "Provider123!",
    note: "Approved profile & inbox",
  },
  {
    role: "Pending provider",
    email: "naya@example.com",
    password: "Provider123!",
    note: "See the review state",
  },
  {
    role: "Draft provider",
    email: "rose@example.com",
    password: "Provider123!",
    note: "Try the 7-step application",
  },
  {
    role: "Admin",
    email: "admin@holydo.market",
    password: "Admin123!",
    note: "Approval queue",
  },
];

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : user.role === "PROVIDER" ? "/provider/dashboard" : "/account");
  }
  const { next } = await searchParams;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
      <section className="mx-auto w-full max-w-lg">
        <p className="eyebrow">Welcome back</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)]">
          Good to see you
          <span className="text-clay">.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Log in to manage appointment requests, update your provider profile, or
          leave a review.
        </p>

        <div className="card mt-7 p-5 md:p-7">
          <ActionForm action={loginAction} className="grid gap-4">
            {next && <input type="hidden" name="next" value={next} />}
            <div>
              <label htmlFor="email" className="label">Email address</label>
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
              <label htmlFor="password" className="label">Password</label>
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
            <SubmitButton className="btn btn-primary btn-block mt-1" pendingLabel="Logging in…">
              Log in
            </SubmitButton>
          </ActionForm>

          <p className="mt-5 text-center text-xs text-muted">
            New to HOLYDO?{" "}
            <Link href="/signup" className="font-semibold text-ink underline decoration-line underline-offset-4">
              Create a customer account
            </Link>
          </p>
          <p className="mt-1 text-center text-xs text-muted">
            Offer services?{" "}
            <Link href="/provider/join" className="font-semibold text-ink underline decoration-line underline-offset-4">
              Apply as a provider
            </Link>
          </p>
        </div>
      </section>

      <aside className="rounded-card border border-ink bg-pine p-6 text-paper shadow-[5px_5px_0_var(--color-ink)] md:p-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-marigold" aria-hidden />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/60">
            Demo accounts
          </p>
        </div>
        <h2 className="mt-3 text-2xl text-paper">Try every side of the marketplace.</h2>
        <p className="mt-2 text-xs leading-relaxed text-paper/65">
          This is a seeded v1 environment. Use one of these accounts to explore the
          customer, provider or admin experience.
        </p>

        <div className="mt-5 grid gap-2.5">
          {demoAccounts.map((account) => (
            <div key={account.email} className="rounded-xl border border-paper/15 bg-paper/5 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold text-marigold">{account.role}</span>
                <span className="text-[9px] text-paper/50">{account.note}</span>
              </div>
              <div className="mt-1.5 font-mono text-[10.5px] leading-relaxed text-paper/90">
                {account.email}
                <br />
                {account.password}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[10px] leading-relaxed text-paper/50">
          <ArrowUpRight className="mr-1 inline h-3 w-3" aria-hidden />
          Demo credentials are seeded in <code>prisma/seed.ts</code>. Change them before any
          public deployment.
        </p>
      </aside>
    </div>
  );
}
