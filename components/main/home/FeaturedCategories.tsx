"use client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCategories } from "@/hooks/useShopData";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const { t } = useSiteSettings();
  const { ref: sectionRef, isVisible } = useScrollReveal();

  // Split categories for 2 independent scrolling rows on mobile
  const midIndex = Math.ceil(categories.length / 2);
  const mobileRow1 = categories.slice(0, midIndex);
  const mobileRow2 = categories.slice(midIndex);

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container-shop">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl tracking-tight">
              {t("home.shopByCategory") || "Categories"}
            </h2>
          </div>
          {/* Desktop Loading Skeleton */}
          <div className="hidden md:grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 animate-pulse">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border/80 rounded-xl p-4 flex flex-col items-center justify-center gap-3 aspect-square"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-muted rounded-full" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
          {/* Mobile Loading Skeleton */}
          <div className="flex md:hidden flex-col gap-3">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-24 bg-card border border-border/80 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square"
                >
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="h-3.5 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-24 bg-card border border-border/80 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square"
                >
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="h-3.5 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding" ref={sectionRef}>
      <div className="container-shop">
        <div
          className={`flex items-center justify-between mb-8 reveal-left ${isVisible ? "reveal-visible" : ""}`}
        >
          <div>
            <h2 className="text-xl md:text-1xl tracking-tight">
              {t("home.shopByCategory") || "Categories"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Desktop View: Separate Square Card Layout with Spacing */}
        <div className="hidden md:grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.slice(0, 16).map((category, index) => (
            <div
              key={category.id}
              className={`flex flex-col items-center gap-2 select-none group reveal-scale stagger-${index + 1} ${isVisible ? "reveal-visible" : ""}`}
            >
              <Link
                href={`/shop?category=${category.slug}`}
                className="w-full aspect-square bg-secondary/30 border border-border/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-foreground/5 hover:border-accent/40 relative overflow-hidden"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 96px, 128px"
                />
              </Link>

              {/* Category Name (Outside/below the card) */}
              <Link href={`/shop?category=${category.slug}`} className="block w-full text-center">
                <span className="text-xs md:text-sm font-bold tracking-tight text-foreground/90 group-hover:text-accent transition-colors line-clamp-1 px-0.5 max-w-full leading-none">
                  {category.name}
                </span>
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile View: 2-Row Independent Horizontal Touch Scroll Slide */}
        <div className="flex md:hidden flex-col gap-3">
          <ScrollingRow items={mobileRow1} />
          <ScrollingRow items={mobileRow2} />
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ScrollingRow({ items }: { items: any[] }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 px-1 scrollbar-none w-full">
      {items.map((category) => (
        <div
          key={category.id}
          className="flex-shrink-0 w-24 flex flex-col items-center gap-1.5 text-center group"
        >
          <Link
            href={`/shop?category=${category.slug}`}
            draggable={false}
            className="w-full aspect-square bg-secondary/40 border border-border/70 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xs transition-all duration-300 hover:border-accent/40"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              loading="lazy"
              draggable={false}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="96px"
            />
          </Link>

          {/* Name */}
          <Link href={`/shop?category=${category.slug}`} draggable={false} className="block w-full text-center">
            <span className="text-[11px] font-bold tracking-tight text-foreground/90 group-hover:text-accent transition-colors line-clamp-1 px-0.5 leading-tight">
              {category.name}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
