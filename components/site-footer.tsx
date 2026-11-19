import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink bg-surface pb-24 pt-12 md:pb-8">
      <div className="container-hd">
        <div className="grid gap-9 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[260px] text-[12px] leading-relaxed text-muted">
              A local marketplace for the people who keep a neighbourhood running.
              Independently built in Montréal.
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
              <MapPin className="h-3 w-3" aria-hidden /> Tiohtià:ke / Montréal, QC
            </p>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Discover</p>
            <div className="mt-3 grid gap-2 text-[12px]">
              <Link href="/search" className="hover:underline">All services</Link>
              <Link href="/search?category=braids" className="hover:underline">Braids</Link>
              <Link href="/search?category=cleaning" className="hover:underline">Cleaning</Link>
              <Link href="/search?category=repairs" className="hover:underline">Repairs</Link>
              <Link href="/how-it-works" className="hover:underline">How it works</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Providers</p>
            <div className="mt-3 grid gap-2 text-[12px]">
              <Link href="/for-providers" className="hover:underline">Why HOLYDO</Link>
              <Link href="/provider/join" className="hover:underline">Create a profile</Link>
              <Link href="/login" className="hover:underline">Provider log in</Link>
              <Link href="/how-it-works#approval" className="hover:underline">Approval process</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Company</p>
            <div className="mt-3 grid gap-2 text-[12px]">
              <Link href="/how-it-works" className="hover:underline">Trust &amp; safety</Link>
              <Link href="/for-providers" className="hover:underline">About</Link>
              <a href="mailto:hello@holydo.market" className="inline-flex items-center gap-1.5 hover:underline">
                <Mail className="h-3 w-3" aria-hidden /> Contact
              </a>
              <span className="text-muted">Privacy · Terms</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-4 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono uppercase tracking-[0.08em]">
            © {new Date().getFullYear()} HOLYDO MARKET · Montréal, QC
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><Instagram className="h-3 w-3" aria-hidden /> @holydomarket</span>
            <span>EN · FR <span className="opacity-60">(soon)</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
