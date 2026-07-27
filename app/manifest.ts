import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Suyeb Online Sports",
    short_name: "Suyeb Sports",
    description: "Premium Sports Gear, Clothing & Accessories Online Shop in Bangladesh",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#1a1a2e",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
