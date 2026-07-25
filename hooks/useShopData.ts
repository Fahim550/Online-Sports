"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "../utils/supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  category?: Category;
  stock: number;
  sku: string;
  short_description: string | null;
  description: string | null;
  images: string[];
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  is_offer: boolean;
  is_variable: boolean;
  fabrics?: string | null;
  rating?: number | null;
  created_at: string;
  updated_at: string;
  has_variants?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface SliderSlide {
  id: string;
  image: string;
  heading: string;
  text: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
}

const supabase = createClient();

// Products
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
  });
};

export interface ShopFilterParams {
  searchQuery?: string;
  categorySlug?: string;
  statusFilter?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStockOnly?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const useFilteredShopProducts = (params: ShopFilterParams) => {
  const {
    searchQuery = "",
    categorySlug = "all",
    statusFilter = "all",
    minPrice = null,
    maxPrice = null,
    inStockOnly = false,
    sortBy = "newest",
    page = 1,
    limit = 12,
  } = params;

  return useQuery({
    queryKey: [
      "filtered_products",
      searchQuery,
      categorySlug,
      statusFilter,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
      page,
      limit,
    ],
    queryFn: async () => {
      let categoryIds: string[] = [];

      if (categorySlug && categorySlug !== "all") {
        const slugs = categorySlug.split(",").map((s) => s.trim()).filter(Boolean);
        
        if (slugs.length > 0) {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("id")
            .in("slug", slugs);

          if (categoryData && categoryData.length > 0) {
            categoryIds = categoryData.map(c => c.id);
          }
        }
      }

      let query = supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)", {
          count: "exact",
        });

      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`);
      }

      if (categoryIds.length > 0) {
        query = query.in("category_id", categoryIds);
      }

      if (statusFilter === "new") {
        query = query.eq("is_new", true);
      } else if (statusFilter === "bestsellers") {
        query = query.eq("is_best_seller", true);
      } else if (statusFilter === "featured") {
        query = query.eq("is_featured", true);
      } else if (statusFilter === "sale") {
        query = query.not("sale_price", "is", null);
      }

      if (minPrice !== null && !isNaN(minPrice)) {
        query = query.gte("price", minPrice);
      }
      if (maxPrice !== null && !isNaN(maxPrice)) {
        query = query.lte("price", maxPrice);
      }

      if (inStockOnly) {
        query = query.gt("stock", 0);
      }

      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "bestsellers":
          query = query.order("is_best_seller", { ascending: false });
          break;
        case "name-asc":
          query = query.order("name", { ascending: true });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      const products = (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];

      return {
        products,
        totalCount: count || 0,
      };
    },
  });
};

export const useCategoryProductCounts = () => {
  return useQuery({
    queryKey: ["category_product_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });
      return counts;
    },
  });
};

export const useProduct = (slugOrId: string) => {
  return useQuery({
    queryKey: ["product", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;

      let decoded = slugOrId;
      try {
        decoded = decodeURIComponent(slugOrId);
      } catch (e) {
        // use raw slug if decoding fails
      }

      // 1. Try matching slug
      let { data } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("slug", decoded)
        .maybeSingle();

      // 2. Try raw string if different
      if (!data && decoded !== slugOrId) {
        const res = await supabase
          .from("products")
          .select("*, category:categories(*)")
          .eq("slug", slugOrId)
          .maybeSingle();
        data = res.data;
      }

      // 3. Fallback: try matching ID (in case ID is passed instead of slug)
      if (!data) {
        const res = await supabase
          .from("products")
          .select("*, category:categories(*)")
          .eq("id", decoded)
          .maybeSingle();
        data = res.data;
      }

      return data as (Product & { category: Category | null }) | null;
    },
    enabled: !!slugOrId,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
  });
};

export const useOfferProducts = () => {
  return useQuery({
    queryKey: ["products", "offer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .eq("is_offer", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
  });
};

export const useBestSellers = () => {
  return useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .eq("is_best_seller", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
  });
};

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ["products", "new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .eq("is_new", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
  });
};

export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug],
    queryFn: async () => {
      const { data: category, error: catError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (catError) throw catError;
      if (!category) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
    enabled: !!categorySlug,
  });
};

export const useRelatedProducts = (
  product: Product | null | undefined,
  limit = 4,
) => {
  return useQuery({
    queryKey: ["products", "related", product?.id],
    queryFn: async () => {
      if (!product?.category_id) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*), product_variants(count)")
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(limit);

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        product_variants: undefined,
        has_variants:
          p.is_variable && (p.product_variants?.[0]?.count || 0) > 0,
      })) as (Product & { category: Category | null })[];
    },
    enabled: !!product,
  });
};

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Category | null;
    },
    enabled: !!slug,
  });
};

// Slider
export const useSliderSlides = (activeOnly = true) => {
  return useQuery({
    queryKey: ["slider_slides", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("slider_slides")
        .select("*")
        .order("sort_order");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as SliderSlide[];
    },
  });
};

// Reviews
export const useReviews = (approvedOnly = true) => {
  return useQuery({
    queryKey: ["reviews", approvedOnly],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (approvedOnly) {
        query = query.eq("is_approved", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });
};

// Mutations
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      product: Omit<Product, "id" | "created_at" | "updated_at" | "category">,
    ) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
    },
    onError: (error) => {
      toast.error("Failed to create product: " + error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...product
    }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete product: " + error.message);
    },
  });
};

// Category mutations
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      category: Omit<
        Category,
        "id" | "created_at" | "updated_at" | "product_count"
      >,
    ) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(category as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...category
    }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(category as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
};

// Slider mutations
export const useCreateSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      slide: Omit<SliderSlide, "id" | "created_at" | "updated_at">,
    ) => {
      const { data, error } = await supabase
        .from("slider_slides")
        .insert(slide as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slider_slides"] });
      toast.success("Slide created");
    },
    onError: (error) => {
      toast.error("Failed to create slide: " + error.message);
    },
  });
};

export const useUpdateSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...slide
    }: Partial<SliderSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from("slider_slides")
        .update(slide as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slider_slides"] });
      toast.success("Slide updated");
    },
    onError: (error) => {
      toast.error("Failed to update slide: " + error.message);
    },
  });
};

export const useDeleteSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("slider_slides")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slider_slides"] });
      toast.success("Slide deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete slide: " + error.message);
    },
  });
};
