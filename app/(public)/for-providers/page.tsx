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
import { getTranslator } from "@/lib/i18n/server";
import { formatDistance } from "@/lib/location";
import { categoryLabel } from "@/lib/i18n/categories";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("providers.meta.title"),
    description: t("providers.meta.description"),
  };
}

export default async function ForProvidersPage() {
  const { locale, t } = await getTranslator();

  const steps = [
    {
      n: "01",
      title: t("providers.steps.1.title"),
      text: t("providers.steps.1.text"),
      time: t("providers.steps.1.time"),
    },
    {
      n: "02",
      title: t("providers.steps.2.title"),
      text: t("providers.steps.2.text"),
      time: t("providers.steps.2.time"),
    },
    {
      n: "03",
      title: t("providers.steps.3.title"),
      text: t("providers.steps.3.text"),
      time: t("providers.steps.3.time"),
    },
    {
      n: "04",
      title: t("providers.steps.4.title"),
      text: t("providers.steps.4.text"),
      time: t("providers.steps.4.time"),
    },
  ];

  const benefits = [
    {
      icon: Eye,
      title: t("providers.benefits.1.title"),
      text: t("providers.benefits.1.text"),
    },
    {
      icon: CalendarCheck,
      title: t("providers.benefits.2.title"),
      text: t("providers.benefits.2.text"),
    },
    {
      icon: Wallet,
      title: t("providers.benefits.3.title"),
      text: t("providers.benefits.3.text"),
    },
    {
      icon: Camera,
      title: t("providers.benefits.4.title"),
      text: t("providers.benefits.4.text"),
    },
    {
      icon: Heart,
      title: t("providers.benefits.5.title"),
      text: t("providers.benefits.5.text"),
    },
    {
      icon: Clock,
      title: t("providers.benefits.6.title"),
      text: t("providers.benefits.6.text"),
    },
  ];

  const approvalItems: Array<[string, string]> = [
    [t("providers.approval.1.title"), t("providers.approval.1.text")],
    [t("providers.approval.2.title"), t("providers.approval.2.text")],
    [t("providers.approval.3.title"), t("providers.approval.3.text")],
    [t("providers.approval.4.title"), t("providers.approval.4.text")],
    [t("providers.approval.5.title"), t("providers.approval.5.text")],
    [t("providers.approval.6.title"), t("providers.approval.6.text")],
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-hd grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
          <div>
            <p className="eyebrow">{t("providers.hero.eyebrow")}</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.8vw,5.2rem)]">
              {t("providers.hero.titleStart")}{" "}
              <span className="italic text-clay">{t("providers.hero.titleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-[500px] text-sm leading-relaxed text-muted">
              {t("providers.hero.body")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link href="/provider/join" className="btn btn-primary">
                {t("providers.hero.cta")} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="text-[10px] text-muted">{t("providers.hero.note")}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-muted">
              {[
                t("providers.hero.check1"),
                t("providers.hero.check2"),
                t("providers.hero.check3"),
                t("providers.hero.check4"),
              ].map((item) => (
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
                  alt={t("providers.hero.imageAlt")}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 430px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="verified">
                    <BadgeCheck className="h-3 w-3" aria-hidden /> {t("providers.mock.verified")}
                  </span>
                  <span className="pill pill-pine !text-[8px]">{t("providers.mock.live")}</span>
                </div>
                <p className="mt-2 font-display text-xl">Nadia Braids Studio</p>
                <p className="text-[10px] text-muted">
                  {t("providers.mock.meta", {
                    category: categoryLabel(locale, "braids", "Braids"),
                    hood: "Le Plateau",
                    distance: formatDistance(1.2, locale),
                  })}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[10px] text-muted">{t("providers.mock.service")}</span>
                  <span className="text-sm font-semibold">
                    {t("price.from", { price: "$120" })}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -top-4 flex h-20 w-20 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-dashed border-ink bg-paper text-center font-mono text-[6px] uppercase leading-tight">
              <span>{t("home.collage.approvedBy")}</span>
              <span className="font-display text-[12px] font-semibold normal-case">HOLYDO</span>
              <span>2026</span>
            </div>
            <div className="absolute -bottom-3 -left-3 rounded-xl border border-ink bg-marigold px-3 py-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="font-mono text-[7px] uppercase tracking-wide">{t("providers.mock.month")}</p>
              <p className="text-sm font-semibold">{t("providers.mock.views", { count: 148 })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-hd section-pad">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("providers.benefits.eyebrow")}</p>
          <h2 className="display mt-3 text-section">{t("providers.benefits.title")}</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            {t("providers.benefits.body")}
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {benefits.map((item) => (
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
              <p className="eyebrow">{t("providers.steps.eyebrow")}</p>
              <h2 className="display mt-3 text-section">{t("providers.steps.title")}</h2>
            </div>
            <span className="pill">
              <Clock className="h-3 w-3" aria-hidden /> {t("providers.steps.badge")}
            </span>
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
            <p className="text-[11px] text-muted">{t("providers.steps.location")}</p>
            <Link href="/provider/join" className="btn btn-primary btn-sm ml-auto">
              {t("providers.steps.start")}
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container-hd section-pad">
        <div className="grid gap-4 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <p className="eyebrow">{t("providers.pricing.eyebrow")}</p>
            <h2 className="display mt-3 text-section">{t("providers.pricing.title")}</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              {t("providers.pricing.body")}
            </p>
            <div className="mt-5 grid gap-2 text-[11px] text-muted sm:grid-cols-2">
              {[
                t("providers.pricing.check1"),
                t("providers.pricing.check2"),
                t("providers.pricing.check3"),
                t("providers.pricing.check4"),
                t("providers.pricing.check5"),
                t("providers.pricing.check6"),
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-pine" aria-hidden /> {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-ink bg-pine p-6 text-paper shadow-[5px_5px_0_var(--color-ink)] md:p-8">
            <Sparkles className="h-6 w-6 text-marigold" aria-hidden />
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/55">
              {t("providers.pricing.plan")}
            </p>
            <p className="mt-1 font-display text-5xl">
              $0<span className="text-base text-paper/50">{t("providers.pricing.month")}</span>
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-paper/65">
              {t("providers.pricing.planBody")}
            </p>
            <Link href="/provider/join" className="btn btn-primary btn-block mt-5">
              {t("providers.pricing.cta")}
            </Link>
            <p className="mt-2 text-center text-[9px] text-paper/50">{t("providers.pricing.note")}</p>
          </div>
        </div>
      </section>

      {/* Approval note */}
      <section className="border-t border-line bg-surface">
        <div className="container-hd grid gap-8 py-12 md:grid-cols-[0.85fr_1.15fr] md:py-16">
          <div>
            <p className="eyebrow">{t("providers.approval.eyebrow")}</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.4vw,2.8rem)]">
              {t("providers.approval.title")}
            </h2>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {approvalItems.map(([title, text]) => (
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
            <p className="eyebrow !text-ink/55 before:!bg-ink">{t("providers.cta.eyebrow")}</p>
            <h2 className="display mt-2 text-[clamp(1.9rem,3.4vw,2.8rem)]">
              {t("providers.cta.title")}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/provider/join" className="btn btn-dark">
              {t("providers.cta.button")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/how-it-works#approval" className="btn btn-outline bg-transparent">
              {t("providers.cta.how")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
