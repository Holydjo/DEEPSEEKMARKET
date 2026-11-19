import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-baseline gap-1.5"
      aria-label="HOLYDO MARKET home"
    >
      <span
        className={`font-display font-semibold leading-none tracking-[-0.045em] text-ink ${
          compact ? "text-xl" : "text-2xl md:text-[27px]"
        }`}
      >
        HOLYDO
      </span>
      <span className="rounded-[3px] border border-ink px-1 py-0.5 font-mono text-[7.5px] font-semibold tracking-[0.18em] text-ink">
        MARKET
      </span>
    </Link>
  );
}
