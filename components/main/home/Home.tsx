import { HomepageSection } from "@/hooks/useHomePageTemplates";
import { SliderSlide } from "@/hooks/useShopData";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import { DefaultHomepage } from "./HomeTemplate";

const getCachedHomepageData = unstable_cache(
  async () => {
    const supabase = createClient();

    // Fetch active homepage template ID & sections
    const { data: activeTemplate } = await supabase
      .from("homepage_templates")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    let sectionsQuery = supabase
      .from("homepage_sections")
      .select("*")
      .eq("enabled", true);

    if (activeTemplate?.id) {
      sectionsQuery = sectionsQuery.eq("template_id", activeTemplate.id);
    }

    // Fetch active slider slides for instant hero render
    const slidesQuery = supabase
      .from("slider_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    const [{ data: sections }, { data: slides }] = await Promise.all([
      sectionsQuery.order("sort_order"),
      slidesQuery,
    ]);

    return {
      sections: (sections as unknown as HomepageSection[]) || [],
      slides: (slides as unknown as SliderSlide[]) || [],
    };
  },
  ["homepage_data_active_v1"],
  { revalidate: 60, tags: ["homepage_data"] },
);

export default async function HomeTemplate() {
  const { sections, slides } = await getCachedHomepageData();

  return <DefaultHomepage sections={sections} initialSlides={slides} />;
}


