import ProductDetailsClient from "@/components/main/products/ProductDetailsClient";
import { createClient } from "@/utils/supabase/client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suyeb-online-sports.vercel.app";

  try {
    const supabase = createClient();
    let decodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch (e) {
      // fallback
    }

    const { data: product } = await supabase
      .from("products")
      .select("name, description, short_description, images, price, sale_price, category:categories(name)")
      .or(`slug.eq.${decodedSlug},id.eq.${decodedSlug}`)
      .maybeSingle();

    if (product) {
      const title = product.name;
      const categoryName = (product.category as any)?.name ? ` - ${(product.category as any).name}` : "";
      const description =
        product.short_description ||
        product.description ||
        `Buy authentic ${product.name}${categoryName} at Suyeb Online Sports. Fast shipping and 100% genuine products guaranteed.`;
      const images = product.images && product.images.length > 0 ? [product.images[0]] : ["/og-image.png"];
      const effectivePrice = product.sale_price || product.price;

      return {
        title,
        description,
        openGraph: {
          title: `${title} | Suyeb Online Sports`,
          description,
          url: `${baseUrl}/products/${slug}`,
          siteName: "Suyeb Online Sports",
          type: "website",
          images: images.map((img) => ({
            url: img,
            alt: title,
          })),
        },
        twitter: {
          card: "summary_large_image",
          title: `${title} | Suyeb Online Sports`,
          description,
          images,
        },
        other: {
          "product:price:amount": effectivePrice.toString(),
          "product:price:currency": "BDT",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for product page:", error);
  }

  return {
    title: "Product Details",
    description: "View product details and buy original sports gear online at Suyeb Online Sports.",
  };
}

export default function Page() {
  return <ProductDetailsClient />;
}
