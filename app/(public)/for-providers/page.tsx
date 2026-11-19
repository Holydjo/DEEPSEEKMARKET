import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Camera,
  Check,
  Clock,
  Eye,
  Heart,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

export const metadata = {
  title: "For providers",
  description:
    "Create a free verified profile on HOLYDO MARKET. Add services, prices, photos and hours, and receive appointment requests from nearby customers.",
};

const steps = [
  {
    n: "01",
    title: "Create your account",
    text: "Name, email, phone and password. Choose independent provider or business.",
    time: "2 min",
  },
  {
    n: "02",
    title: "Build your storefront",
    text: "Services, prices, photos, opening hours, service settings and travel area.",
    time: "8 min",
  },
  {
    n: "03",
    title: "Submit for review",
    text: "A HOLYDO reviewer checks your profile. You see exactly what is missing.",
    time: "under 48 h",
  },
  {
    n: "04",
    title: "Go live & manage requests",
    text: "Share your link, receive requests, edit services and availability from your dashboard.",
    time: "ongoing",
  },
];

export default function ForProvidersPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-hd grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
          <div>
            <p className="eyebrow">For independent providers & small businesses</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.8vw,5.2rem)]">
              Your work deserves a{" "}
              <span className="italic text-clay">front door.</span>
            </h1>
            <p className="mt-5 max-w-[500px] text-sm leading-relaxed text-muted">
              Stop being a well-kept secret. HOLYDO gives your services a verified,
              mobile-first profile that nearby customers can find, understand and request.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link href="/provider/join" className="btn btn-primary">
                Create your free profile <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="text-[10px] text-muted">Free during launch · no commission</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-muted">
              {["Human-reviewed", "Own your prices", "No booking fees", "Cancel anytime"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-pine" aria-hidden /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="overflow-hidden rounded-[26px] border border-ink bg-surface shadow-[6px_6px_0_var(--color-ink)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/providers/nadia-2.jpg"
                  alt="A finished braid style"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 430px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="verified"><BadgeCheck className="h-3 w-3" aria-hidden /> Verified by HOLYDO</span>
                  <span className="pill pill-pine !text-[8px]">Profile live</span>
                </div>
                <p className="mt-2 font-display text-xl">Nadia Braids Studio</p>
                <p className="text-[10px] text-muted">Braids · Le Plateau · 1.2 km</p>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[10px] text-muted">Knotless braids</span>
                  <span className="text-sm font-semibold">From $120</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -top-4 flex h-20 w-20 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-dashed border-ink bg-paper text-center font-mono text-[6px] uppercase leading-tight">
              <span>Approved by</span>
              <span className="font-display text-[12px] font-semibold normal-case">HOLYDO</span>
              <span>2026</span>
            </div>
            <div className="absolute -bottom-3 -left-3 rounded-xl border border-ink bg-marigold px-3 py-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="font-mono text-[7px] uppercase tracking-wide">This month</p>
              <p className="text-sm font-semibold">148 profile views</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-hd section-pad">
        <div className="max-w-2xl">
          <p className="eyebrow">Why list</p>
          <h2 className="display mt-3 text-section">Built for people who do the work.</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            No bidding wars, no race to the bottom, no algorithm that hides you because
            you took a day off. A clear profile and a fair request inbox.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Found by neighbours",
              text: "Category and neighbourhood pages, location search and a real profile URL you can share anywhere.",
            },
            {
              icon: CalendarCheck,
              title: "Requests that fit your work",
              text: "Customers send a service, date and time window. You accept, decline, or suggest another time.",
            },
            {
              icon: Wallet,
              title: "Your prices, your business",
              text: "No commission on appointment requests during launch. You agree on payment directly with the customer.",
            },
            {
              icon: Camera,
              title: "Let the work speak",
              text: "A photo gallery and service list that show what you actually do — not a generic directory entry.",
            },
            {
              icon: Heart,
              title: "Reviewed reviews",
              text: "Reviews from customers with a completed HOLYDO request are marked verified. You can flag abuse.",
            },
            {
              icon: Clock,
              title: "Control availability",
              text: "Opening hours, service settings and travel radius are yours to edit. Your exact address stays private.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-surface p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink bg-marigold-soft">
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg">{item.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-line bg-surface">
        <div className="container-hd section-pad">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Getting listed</p>
              <h2 className="display mt-3 text-section">Four steps, one human review.</h2>
            </div>
            <span className="pill"><Clock className="h-3 w-3" aria-hidden /> About 12 minutes + review</span>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="relative rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-clay">{step.n}</span>
                  <span className="pill !text-[8px]">{step.time}</span>
                </div>
                <h3 className="mt-5 text-lg">{step.title}</h3>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
            <MapPin className="h-4 w-4 text-muted" aria-hidden />
            <p className="text-[11px] text-muted">
              Serving Montréal first. Le Plateau, Rosemont, Villeray, Little Burgundy and nearby.
            </p>
            <Link href="/provider/join" className="btn btn-primary btn-sm ml-auto">
              Start application
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container-hd section-pad">
        <div className="grid gap-4 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <p className="eyebrow">Launch pricing</p>
            <h2 className="display mt-3 text-section">Free to be found. No commission.</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              During the launch period, a provider profile costs nothing. HOLYDO does not
              take a percentage of your appointments and does not require a card to apply.
              If we introduce paid plans later, existing free profiles will be told in advance.
            </p>
            <div className="mt-5 grid gap-2 text-[11px] text-muted sm:grid-cols-2">
              {[
                "No setup fee",
                "No commission on requests",
                "No card required",
                "Unlimited services & photos",
                "Your own profile URL",
                "Edit anytime, re-review if needed",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-pine" aria-hidden /> {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-ink bg-pine p-6 text-paper shadow-[5px_5px_0_var(--color-ink)] md:p-8">
            <Sparkles className="h-6 w-6 text-marigold" aria-hidden />
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/55">Launch plan</p>
            <p className="mt-1 font-display text-5xl">$0<span className="text-base text-paper/50"> / month</span></p>
            <p className="mt-2 text-[11px] leading-relaxed text-paper/65">
              For independent providers and small businesses in Montréal. Manual review
              applies to every profile.
            </p>
            <Link href="/provider/join" className="btn btn-primary btn-block mt-5">
              Create your profile
            </Link>
            <p className="mt-2 text-center text-[9px] text-paper/50">No card. No commitment.</p>
          </div>
        </div>
      </section>

      {/* Approval note */}
      <section className="border-t border-line bg-surface">
        <div className="container-hd grid gap-8 py-12 md:grid-cols-[0.85fr_1.15fr] md:py-16">
          <div>
            <p className="eyebrow">The approval process</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.4vw,2.8rem)]">
              You’ll know exactly what we’re checking.
            </h2>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              ["Account & contact", "Your name, phone and email."],
              ["Public profile", "Name, category, about, location."],
              ["At least one service", "Real price and duration."],
              ["At least one photo", "Original work, no stock faces."],
              ["Location & area", "Neighbourhood and travel radius."],
              ["Opening hours", "At least one open interval."],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-2.5 rounded-xl border border-line bg-paper p-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pine-soft text-pine">
                  <Check className="h-2.5 w-2.5" aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-semibold">{title}</p>
                  <p className="text-[9.5px] text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-ink bg-marigold">
        <div className="container-hd flex flex-col items-start justify-between gap-5 py-10 md:flex-row md:items-center">
          <div>
            <p className="eyebrow !text-ink/55 before:!bg-ink">Ready when you are</p>
            <h2 className="display mt-2 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              Bring your work to the neighbourhood.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/provider/join" className="btn btn-dark">
              Create your provider profile <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/how-it-works#approval" className="btn btn-outline bg-transparent">
              How approval works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
