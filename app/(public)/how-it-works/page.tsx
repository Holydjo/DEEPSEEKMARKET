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
import { getTranslator } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("how.meta.title"),
    description: t("how.meta.description"),
  };
}

export default async function HowItWorksPage() {
  const { t } = await getTranslator();

  const faqs = [
    { q: t("how.faq.q1"), a: t("how.faq.a1") },
    { q: t("how.faq.q2"), a: t("how.faq.a2") },
    { q: t("how.faq.q3"), a: t("how.faq.a3") },
    { q: t("how.faq.q4"), a: t("how.faq.a4") },
  ];

  const customerSteps: Array<[string, string]> = [
    [t("how.customers.1.title"), t("how.customers.1.text")],
    [t("how.customers.2.title"), t("how.customers.2.text")],
    [t("how.customers.3.title"), t("how.customers.3.text")],
    [t("how.customers.4.title"), t("how.customers.4.text")],
  ];

  const providerSteps: Array<[string, string]> = [
    [t("how.providers.1.title"), t("how.providers.1.text")],
    [t("how.providers.2.title"), t("how.providers.2.text")],
    [t("how.providers.3.title"), t("how.providers.3.text")],
    [t("how.providers.4.title"), t("how.providers.4.text")],
  ];

  const approvalChecks: Array<[string, string]> = [
    [t("how.approval.1.title"), t("how.approval.1.text")],
    [t("how.approval.2.title"), t("how.approval.2.text")],
    [t("how.approval.3.title"), t("how.approval.3.text")],
    [t("how.approval.4.title"), t("how.approval.4.text")],
  ];

  const states: Array<[string, string, string]> = [
    [t("how.states.DRAFT.title"), t("how.states.DRAFT.text"), "bg-surface-2"],
    [t("how.states.PENDING.title"), t("how.states.PENDING.text"), "bg-marigold-soft"],
    [t("how.states.APPROVED.title"), t("how.states.APPROVED.text"), "bg-pine-soft"],
    [t("how.states.REJECTED.title"), t("how.states.REJECTED.text"), "bg-clay-soft"],
    [t("how.states.SUSPENDED.title"), t("how.states.SUSPENDED.text"), "bg-surface-2"],
  ];

  const safety = [
    {
      icon: BadgeCheck,
      title: t("how.safety.1.title"),
      text: t("how.safety.1.text"),
    },
    {
      icon: MapPin,
      title: t("how.safety.2.title"),
      text: t("how.safety.2.text"),
    },
    {
      icon: CalendarCheck,
      title: t("how.safety.3.title"),
      text: t("how.safety.3.text"),
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-hd grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-20">
          <div>
            <p className="eyebrow">{t("how.hero.eyebrow")}</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.6vw,5rem)]">
              {t("how.hero.title")}
            </h1>
            <p className="mt-5 max-w-[520px] text-sm leading-relaxed text-muted">
              {t("how.hero.body")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/search" className="btn btn-primary">
                {t("how.hero.find")} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/provider/join" className="btn btn-outline">
                {t("how.hero.list")}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-ink shadow-[6px_6px_0_var(--color-ink)]">
            <Image
              src="/images/places/plateau.jpg"
              alt={t("how.hero.imageAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              priority
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-ink bg-surface/95 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {t("how.hero.hood")}
              </p>
              <p className="mt-0.5 text-[9px] text-muted">
                {t("how.hero.hoodNote")}
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
            <h2 className="display mt-5 text-3xl">{t("how.customers.title")}</h2>
            <ol className="mt-4 grid gap-3">
              {customerSteps.map(([title, text], index) => (
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
              {t("how.browse")}
            </Link>
          </div>

          <div className="rounded-card border border-line bg-surface p-6 md:p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-marigold">
              <Store className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="display mt-5 text-3xl">{t("how.providers.title")}</h2>
            <ol className="mt-4 grid gap-3">
              {providerSteps.map(([title, text], index) => (
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
              {t("how.startApplication")}
            </Link>
          </div>
        </div>
      </section>

      {/* Approval */}
      <section id="approval" className="scroll-mt-24 border-y border-ink bg-pine text-paper">
        <div className="container-hd grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="eyebrow !text-paper/75 before:!bg-paper/40">{t("how.approval.eyebrow")}</p>
            <h2 className="display mt-3 max-w-[560px] text-[clamp(2.1rem,4vw,3.4rem)]">
              {t("how.approval.title")}
            </h2>
            <p className="mt-4 max-w-[500px] text-sm leading-relaxed text-paper/70">
              {t("how.approval.body")}
            </p>
            <div className="mt-6 grid gap-2.5">
              {approvalChecks.map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-xl border border-paper/15 bg-paper/5 p-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-paper/30">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-paper/80">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink bg-surface p-5 text-ink shadow-[6px_6px_0_rgba(0,0,0,.35)] md:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {t("how.states.title")}
              </span>
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </div>
            <div className="mt-4 grid gap-2">
              {states.map(([title, text, tone]) => (
                <div key={title} className={`rounded-xl border border-line p-3 ${tone}`}>
                  <p className="text-[11px] font-semibold">{title}</p>
                  <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink/80">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <p className="text-[9px] text-muted">{t("how.states.reviewTime")}</p>
              <p className="text-sm font-semibold">{t("how.states.under48")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="container-hd section-pad">
        <div className="grid gap-4 md:grid-cols-3">
          {safety.map((item) => (
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
            <p className="eyebrow">{t("how.faq.eyebrow")}</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.4vw,3rem)]">{t("how.faq.title")}</h2>
            <p className="mt-3 max-w-sm text-[11.5px] leading-relaxed text-muted">
              {t("how.faq.contactStart")}{" "}
              <a href="mailto:hello@holydo.market" className="font-medium text-ink underline decoration-line underline-offset-2">
                hello@holydo.market
              </a>
              {t("how.faq.contactEnd")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill"><Star className="h-3 w-3" aria-hidden /> {t("how.faq.pill1")}</span>
              <span className="pill"><Sparkles className="h-3 w-3" aria-hidden /> {t("how.faq.pill2")}</span>
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
