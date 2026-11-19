import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOLYDO MARKET — Local services, humanly verified",
    short_name: "HOLYDO",
    description:
      "Find trusted local service providers near you — hair, braids, beauty, cleaning, repairs and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f0e4",
    theme_color: "#f6f0e4",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
