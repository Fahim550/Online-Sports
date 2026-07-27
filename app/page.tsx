import HomeTemplate from "@/components/main/home/Home";

// ISR: Serve cached page for 60s, rebuild in background on next request.
// This replaces force-dynamic which was disabling all caching.
export const revalidate = 60;

export default function Home() {
  const sections = [
    {
      id: "1",
      section_type: "hero_slider",
      title: "Hero",
      subtitle: "",
      enabled: true,
      sort_order: 1,
    },
    {
      id: "2",
      section_type: "featured_categories",
      title: "Categories",
      subtitle: "",
      enabled: true,
      sort_order: 2,
    },
    {
      id: "3",
      section_type: "featured_products",
      title: "Products",
      subtitle: "",
      enabled: true,
      sort_order: 3,
    },
    {
      id: "4",
      section_type: "best_sellers",
      title: "Best Sellers",
      subtitle: "",
      enabled: true,
      sort_order: 4,
    },
  ];

  return (
    <>
      {/* <DefaultHomepage sections={sections} /> */}
      {/* <HeroSlider />
      <FeaturedCategories />
      <FeaturedProducts />
      <BestSellers /> */}
      <HomeTemplate />
    </>
  );
}
