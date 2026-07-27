"use client";
import React from "react";
import dynamic from "next/dynamic";
import { FeaturedCategories } from "@/components/main/home/FeaturedCategories";
import { HeroSlider } from "@/components/main/home/HeroSlider";
import { ProductCard } from "@/components/main/products/ProductCard";
import { HomepageSection } from "@/hooks/useHomePageTemplates";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SliderSlide, useNewArrivals } from "@/hooks/useShopData";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const BestSellers = dynamic(() => import("@/components/main/home/BestSellers").then((m) => m.BestSellers));
const CustomerReviews = dynamic(() => import("@/components/main/home/CustomerReviews").then((m) => m.CustomerReviews));
const FeaturedProducts = dynamic(() => import("@/components/main/home/FeaturedProducts").then((m) => m.FeaturedProducts));
const PromoBanners = dynamic(() => import("@/components/main/home/PromoBanners").then((m) => m.PromoBanners));
const PromoOffers = dynamic(() => import("@/components/main/home/PromoOffers").then((m) => m.PromoOffers));
const TrustBadges = dynamic(() => import("@/components/main/home/TrustBadges").then((m) => m.TrustBadges));

function NewArrivalsSection({ section }: { section: HomepageSection }) {
  const { data: newArrivals = [] } = useNewArrivals();
  const { ref, isVisible } = useScrollReveal();

  if (newArrivals.length === 0) return null;

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-shop">
        <div
          className={`flex items-center justify-between mb-8 reveal-left ${isVisible ? "reveal-visible" : ""}`}
        >
          <div>
            <h2 className="text-xl md:text-1xl">
              {section.title || "New Arrivals"}
            </h2>
          </div>
          <Link
            href="/shop?filter=new"
            className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-accent hover:underline"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="product-grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3">
          {newArrivals.slice(0, 8).map((product, index) => (
            <div
              key={product.id}
              className={`reveal-base stagger-${index + 1} ${isVisible ? "reveal-visible" : ""}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            href="/shop?filter=new"
            className="w-full sm:w-auto min-w-[180px] text-center py-2.5 px-10 border border-accent text-accent font-semibold rounded-xl text-sm transition-all duration-300 hover:bg-accent hover:text-white"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}

export function DefaultHomepage({
  sections,
  initialSlides,
}: {
  sections: HomepageSection[];
  initialSlides?: SliderSlide[];
}) {
  const SECTION_COMPONENTS: Record<
    string,
    React.ComponentType<{ section: HomepageSection }>
  > = {
    hero_slider: () => <HeroSlider initialSlides={initialSlides} />,
    featured_categories: () => <FeaturedCategories />,
    featured_products: () => <FeaturedProducts />,
    best_sellers: () => <BestSellers />,
    customer_reviews: () => <CustomerReviews />,
  };

  // Only allow specified sections and prevent duplicates
  const seen = new Set<string>();
  const allowedSections = sections.filter((section) => {
    const allowedTypes = [
      "hero_slider",
      "featured_categories",
      "featured_products",
      "new_arrivals",
      "best_sellers",
      "customer_reviews",
    ];
    if (!allowedTypes.includes(section.section_type)) return false;
    if (seen.has(section.section_type)) return false;
    seen.add(section.section_type);
    return true;
  });

  return (
    <>
      {allowedSections.map((section) => {
        let content: React.ReactNode = null;
        if (section.section_type === "new_arrivals") {
          content = <NewArrivalsSection key={section.id} section={section} />;
        } else {
          const Component = SECTION_COMPONENTS[section.section_type];
          if (Component) {
            content = <Component key={section.id} section={section} />;
          }
        }

        return (
        <React.Fragment key={section.id}>
            {section.section_type === "customer_reviews" && (
              <PromoOffers />
            )}
            {content}
            {section.section_type === "hero_slider" && <TrustBadges />}
            {section.section_type === "featured_products" && (
              <PromoBanners settings={section.settings_json} />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
