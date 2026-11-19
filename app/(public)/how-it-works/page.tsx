import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

export const metadata = {
  title: "How it works",
  description:
    "How HOLYDO MARKET connects Montréal customers with verified local providers — and how provider approval works.",
};

const faqs = [
  {
    q: "Is HOLYDO a booking platform?",
    a: "In v1, you send an appointment request with a preferred date and time window. The provider confirms the details directly. There are no payments through HOLYDO and no automatic calendar booking yet.",
  },
  {
    q: "What does “verified” actually mean?",
    a: "A HOLYDO reviewer has checked the provider’s identity and contact details, the services and prices on the profile, the photos, and the declared service area. It is a human review at a point in time, not a guarantee of every future interaction.",
  },
  {
    q: "How much does it cost?",
    a: "Customers pay nothing to search, request or review. Provider profiles are free during the launch period, and HOLYDO does not take a commission on appointment requests.",
  },
  {
    q: "Where is HOLYDO available?",
    a: "Version 1 is live in Montréal, with a seeded set of providers across Le Plateau, Rosemont, Villeray, Little Burgundy and nearby neighbourhoods. Other cities are planned.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-hd grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-20">
          <div>
            <p className="eyebrow">How it works</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.6vw,5rem)]">
              A local marketplace that acts like a neighbour, not a search engine.
            </h1>
            <p className="mt-5 max-w-[520px] text-sm leading-relaxed text-muted">
              HOLYDO is built around a simple idea: the best person for the job is often
              a few streets away, and you should be able to see who they are before you
              trust them with your time.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/search" className="btn btn-primary">
                Find a service <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/provider/join" className="btn btn-outline">
                List your service
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-ink shadow-[6px_6px_0_var(--color-ink)]">
            <Image
              src="/images/places/plateau.jpg"
              alt="A residential street in Le Plateau, Montréal"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              priority
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-ink bg-surface/95 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Le Plateau, Montréal
              </p>
              <p className="mt-0.5 text-[9px] text-muted">
                13 approved providers within walking distance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two sides */}
      <section className="container-hd section-pad">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-6 md:p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-marigold-soft">
              <Search className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="display mt-5 text-3xl">For customers</h2>
            <ol className="mt-4 grid gap-3">
              {[
                ["Search with a place in mind", "Choose a category, type what you need, and set a neighbourhood or use your location."],
                ["Compare real profiles", "See prices, photos, hours, travel area and verified reviews before you decide."],
                ["Send a request", "Pick a service, a date and a time window. No account wall required."],
                ["Hear back and confirm", "The provider replies with availability and the final price. You agree the details directly."],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-paper">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold">{title}</p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/search" className="btn btn-outline btn-sm mt-6">
              Browse providers
            </Link>
          </div>

          <div className="rounded-card border border-line bg-surface p-6 md:p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-marigold">
              <Store className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="display mt-5 text-3xl">For providers</h2>
            <ol className="mt-4 grid gap-3">
              {[
                ["Create a free account", "Tell us whether you are an independent provider or a business."],
                ["Build your storefront", "Add services, prices, photos, hours, service settings and travel area."],
                ["Submit for review", "A human checks your profile. Nothing is public until it is approved."],
                ["Run your business", "Manage requests, update availability and keep your profile accurate from your dashboard."],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-paper">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold">{title}</p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/provider/join" className="btn btn-primary btn-sm mt-6">
              Start your application
            </Link>
          </div>
        </div>
      </section>

      {/* Approval */}
      <section id="approval" className="scroll-mt-24 border-y border-ink bg-pine text-paper">
        <div className="container-hd grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="eyebrow !text-paper/55 before:!bg-paper/40">Human approval</p>
            <h2 className="display mt-3 max-w-[560px] text-[clamp(2.1rem,4vw,3.4rem)]">
              Trust is a process, not a badge.
            </h2>
            <p className="mt-4 max-w-[500px] text-sm leading-relaxed text-paper/70">
              Every provider application is read by a person. We check that the provider is
              who they say they are, that the services and prices are real, and that the photos
              show their actual work. Only then does the profile appear in search.
            </p>
            <div className="mt-6 grid gap-2.5">
              {[
                ["Identity & contact", "Name, phone and email are checked against the application."],
                ["Services & prices", "Each service needs a clear name, price and duration."],
                ["Photos", "At least one original photo; stock faces are not accepted."],
                ["Service area", "The neighbourhood and travel radius are confirmed, not invented."],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-xl border border-paper/15 bg-paper/5 p-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-paper/30">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-paper/60">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink bg-surface p-5 text-ink shadow-[6px_6px_0_rgba(0,0,0,.35)] md:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                Provider states
              </span>
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Draft", "Only the provider can see it. Can be saved and resumed at any time.", "bg-surface-2"],
                ["In review", "Submitted and waiting for a HOLYDO reviewer. Still private.", "bg-marigold-soft"],
                ["Approved", "Public in search and on its profile URL. Verified badge active.", "bg-pine-soft"],
                ["Changes requested", "A reviewer has left a note. The provider edits and resubmits.", "bg-clay-soft"],
                ["Suspended", "Hidden immediately. Existing requests stay visible to the provider.", "bg-surface-2"],
              ].map(([title, text, tone]) => (
                <div key={title} className={`rounded-xl border border-line p-3 ${tone}`}>
                  <p className="text-[11px] font-semibold">{title}</p>
                  <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink/65">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <p className="text-[9px] text-muted">Target review time</p>
              <p className="text-sm font-semibold">Under 48 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="container-hd section-pad">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Approved only",
              text: "Draft, pending, rejected and suspended providers never appear in search or on a public URL.",
            },
            {
              icon: MapPin,
              title: "Approximate locations",
              text: "Public maps show a neighbourhood and a radius, not a provider’s exact home address.",
            },
            {
              icon: CalendarCheck,
              title: "Requests, not guesses",
              text: "A request is not a confirmed appointment. The provider confirms details before anything is agreed.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-surface p-5">
              <item.icon className="h-5 w-5" aria-hidden />
              <h3 className="mt-4 text-lg">{item.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-surface">
        <div className="container-hd grid gap-8 py-14 md:grid-cols-[0.8fr_1.2fr] md:py-20">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.4vw,3rem)]">A few honest answers.</h2>
            <p className="mt-3 max-w-sm text-[11.5px] leading-relaxed text-muted">
              Something else on your mind? Write to{" "}
              <a href="mailto:hello@holydo.market" className="font-medium text-ink underline decoration-line underline-offset-2">
                hello@holydo.market
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill"><Star className="h-3 w-3" aria-hidden /> Human reviews</span>
              <span className="pill"><Sparkles className="h-3 w-3" aria-hidden /> No booking fees</span>
            </div>
          </div>
          <div className="divide-y divide-line rounded-2xl border border-line bg-paper px-5">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 max-w-[620px] text-[11px] leading-relaxed text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
