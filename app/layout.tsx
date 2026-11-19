import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "HOLYDO MARKET — Local services, humanly verified",
    template: "%s · HOLYDO MARKET",
  },
  description:
    "Find trusted local service providers near you — hair, braids, beauty, cleaning, repairs and more. Every profile reviewed by a person.",
  openGraph: {
    title: "HOLYDO MARKET — Local services, humanly verified",
    description:
      "Find trusted local service providers near you. Hair, braids, beauty, cleaning, repairs and more.",
    type: "website",
    locale: "en_CA",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
