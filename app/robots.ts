import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suyeb-online-sports.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/checkout/",
        "/cart/",
        "/wishlist/",
        "/track-order/",
        "/order-success/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
