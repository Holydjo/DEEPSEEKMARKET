import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: translate(locale, "meta.defaultTitle"),
      template: "%s · HOLYDO MARKET",
    },
    description: translate(locale, "meta.description"),
    openGraph: {
      title: translate(locale, "meta.defaultTitle"),
      description: translate(locale, "meta.ogDescription"),
      type: "website",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
