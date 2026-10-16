import type { MetadataRoute } from "next";

// Installable app (PWA). Fixed in both languages: the home-screen label is the Bangla name.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "সহযাত্রী (Shohojatri)",
    short_name: "সহযাত্রী",
    start_url: "/bn",
    scope: "/",
    display: "standalone",
    theme_color: "#004E8B",
    background_color: "#FFFFFF",
    lang: "bn",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
