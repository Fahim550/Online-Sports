"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useOfferProducts } from "@/hooks/useShopData";

export function PromoOffers() {
  const { data: offerProducts = [], isLoading } = useOfferProducts();

  // Premium fallback mockups in case the user hasn't flagged 3 products as "Offer Product" yet
  const fallbacks = [
    {
      badge: "Weekend Discount",
      title: "Drink Fresh Corn Juice",
      subtitle: "Good Taste",
      link: "/shop",
      image: "/placeholder.svg",
      bgcolor: "#fef9c3",
    },
    {
      badge: "Weekend Discount",
      title: "Organic Lemon Flavored",
      subtitle: "Banana Chips",
      link: "/shop",
      image: "/placeholder.svg",
      bgcolor: "#e2f1e4",
    },
    {
      badge: "Weekend Discount",
      title: "Strawberry Water Drinks",
      subtitle: "Flavors Awesome",
      link: "/shop",
      image: "/placeholder.svg",
      bgcolor: "#e2e8f0",
    },
  ];

  // Colors array for the cards (used as fallback when image is missing)
  const bgColors = ["#fef9c3", "#e2f1e4", "#e2e8f0"];

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container-shop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl min-h-[260px] bg-muted/60"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Construct the final list of 3 cards using dynamic products first, and falling back to default cards
  const cards = [0, 1, 2].map((idx) => {
    const product = offerProducts[idx];
    if (product) {
      const hasDiscount = product.sale_price && product.sale_price < product.price;
      const discountPercent = hasDiscount
        ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
        : 0;

      return {
        badge: hasDiscount ? `${discountPercent}% Off` : "Special Offer",
        title: product.name,
        subtitle: product.short_description || product.category?.name || "Good Quality",
        link: `/products/${product.slug}`,
        image: product.images[0] || "/placeholder.svg",
        bgcolor: bgColors[idx % bgColors.length],
      };
    } else {
      return fallbacks[idx];
    }
  });

  return (
    <section className="py-8 md:py-12">
      <div className="container-shop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden min-h-[260px] shadow-sm transition-transform duration-300 hover:shadow-md hover:-translate-y-0.5 group bg-slate-100 flex flex-col justify-between"
            >
              {/* Full background product image */}
              {card.image && (
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Gradient Overlay for text contrast (darker on left) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />
                </div>
              )}

              {/* Foreground Content Column */}
              <div className="relative z-20 flex flex-col items-start justify-between h-full p-6 md:p-8 min-h-[260px] max-w-[75%] text-white">
                <div className="flex flex-col items-start">
                  {/* Badge */}
                  {card.badge && (
                    <span className="bg-[#007a3d] text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded tracking-wide mb-3 select-none">
                      {card.badge}
                    </span>
                  )}
                  {/* Bold Title */}
                  <h3 className="text-base md:text-lg font-black text-white leading-snug mb-1 line-clamp-2">
                    {card.title}
                  </h3>
                  {/* Subtitle */}
                  <p className="text-xs md:text-sm font-bold text-green-300 line-clamp-1">
                    {card.subtitle}
                  </p>
                </div>

                {/* Shop Now Link */}
                <Link
                  href={card.link}
                  className="flex items-center gap-2 font-extrabold text-xs md:text-sm text-white hover:opacity-80 transition-opacity mt-auto pt-4"
                >
                  <span className="w-5.5 h-5.5 rounded-full bg-[#007a3d] text-white flex items-center justify-center text-xs font-black select-none leading-none shrink-0">
                    +
                  </span>
                  <span>Shop Now</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
