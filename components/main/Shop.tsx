"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  useCategories,
  useCategoryProductCounts,
  useFilteredShopProducts,
  useProducts,
} from "@/hooks/useShopData";
import {
  ArrowUpDown,
  ChevronRight,
  Filter,
  Grid2X2,
  Grid3X3,
  Home,
  LayoutGrid,
  List,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ShopProductGrid } from "./shop/ShopProductGrid";
import { ShopSidebar } from "./shop/ShopSidebar";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { formatCurrency } = useSiteSettings();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get("filter") || "all"
  );
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Layout & Pagination States
  const [gridCols, setGridCols] = useState<"2" | "3" | "4" | "list">("4");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 32;

  // Sync search query, category, and URL filter parameters
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");

    const urlCategory = searchParams.get("category");
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("all");
    }

    const urlFilter = searchParams.get("filter");
    if (urlFilter && ["sale", "new", "bestsellers", "featured"].includes(urlFilter)) {
      setSelectedStatus(urlFilter);
    } else if (!urlFilter) {
      setSelectedStatus("all");
    }
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, minPrice, maxPrice, inStockOnly, sortBy]);

  // Parse numeric price parameters
  const numMinPrice = minPrice !== "" && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
  const numMaxPrice = maxPrice !== "" && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

  // Backend Supabase Queries
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: categoryCounts = {} } = useCategoryProductCounts();

  // Dynamic Status Flags
  const hasSaleProducts = useMemo(
    () => allProducts.some((p) => p.sale_price && p.sale_price < p.price),
    [allProducts]
  );
  const hasNewProducts = useMemo(
    () => allProducts.some((p) => p.is_new),
    [allProducts]
  );
  const hasBestSellers = useMemo(
    () => allProducts.some((p) => p.is_best_seller),
    [allProducts]
  );
  const hasFeaturedProducts = useMemo(
    () => allProducts.some((p) => p.is_featured),
    [allProducts]
  );
  const { data, isLoading: productsLoading } = useFilteredShopProducts({
    searchQuery,
    categorySlug: selectedCategory,
    statusFilter: selectedStatus,
    minPrice: numMinPrice,
    maxPrice: numMaxPrice,
    inStockOnly,
    sortBy,
    page: currentPage,
    limit: itemsPerPage,
  });

  const products = data?.products || [];
  const totalProductsCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalProductsCount / itemsPerPage);

  const isLoading = productsLoading || categoriesLoading;

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory && selectedCategory !== "all") count += selectedCategory.split(",").length;
    if (selectedStatus !== "all") count++;
    if (minPrice !== "" || maxPrice !== "") count++;
    if (inStockOnly) count++;
    return count;
  }, [searchQuery, selectedCategory, selectedStatus, minPrice, maxPrice, inStockOnly]);

  const handleClearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
    router.replace(pathname);
  };

  return (
    <>
      <div className="bg-background min-h-screen pb-20">
        {/* Top Banner & Breadcrumb Header */}
        <div className="bg-secondary/40 border-b border-border/60 py-6 md:py-8 mb-6">
          <div className="container-shop">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Shop</span>
              {selectedCategory && selectedCategory !== "all" && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-accent font-semibold capitalize">
                    {selectedCategory.split(",").length > 1
                      ? `${selectedCategory.split(",").length} Categories`
                      : categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  </span>
                </>
              )}
            </nav>

            {/* Title and features badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  {selectedCategory !== "all"
                    ? (selectedCategory.split(",").length > 1
                        ? "Multiple Categories"
                        : categories.find((c) => c.slug === selectedCategory)?.name || "Shop Collection")
                    : "All Products"}
                </h1>
                <p className="hidden md:block text-xs md:text-sm text-muted-foreground mt-1">
                  Explore our full catalog of premium merchandise and apparel.
                </p>
              </div>

              {/* Feature Trust Badges */}
              <div className="hidden sm:flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border/80 shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border/80 shadow-xs">
                  <Truck className="h-3.5 w-3.5 text-accent" />
                  <span>Fast Shipping BD</span>
                </div>
              </div>
            </div>

            {/* Quick Collection Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-3.5 scrollbar-none border-t border-border/40 mt-4">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedStatus === "all"
                    ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                    : "bg-background border border-border/80 text-foreground/80 hover:bg-secondary"
                }`}
              >
                <span>All Collection</span>
              </button>
              {hasSaleProducts && (
                <button
                  onClick={() => setSelectedStatus("sale")}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedStatus === "sale"
                      ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                      : "bg-background border border-border/80 text-foreground/80 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <span>On Sale</span>
                </button>
              )}
              {hasNewProducts && (
                <button
                  onClick={() => setSelectedStatus("new")}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedStatus === "new"
                      ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                      : "bg-background border border-border/80 text-foreground/80 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <span>New Arrivals</span>
                </button>
              )}
              {hasBestSellers && (
                <button
                  onClick={() => setSelectedStatus("bestsellers")}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedStatus === "bestsellers"
                      ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                      : "bg-background border border-border/80 text-foreground/80 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <span>Best Sellers</span>
                </button>
              )}
              {hasFeaturedProducts && (
                <button
                  onClick={() => setSelectedStatus("featured")}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedStatus === "featured"
                      ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                      : "bg-background border border-border/80 text-foreground/80 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <span>Featured</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container-shop pb-16">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar - Desktop Fixed Sticky with Independent Category Scroll */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start z-30">
              <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
                <ShopSidebar
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  setMinPrice={setMinPrice}
                  setMaxPrice={setMaxPrice}
                  categories={categories}
                  categoryCounts={categoryCounts}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  activeFiltersCount={activeFiltersCount}
                  handleClearAllFilters={handleClearAllFilters}
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Control Bar: Search, Sorting, Grid Density, Mobile Drawer */}
              <div className="bg-card border border-border/80 rounded-2xl p-3.5 mb-5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search by product name, description, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-9 text-xs md:text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Controls Group */}
                <div className="flex items-center gap-2 justify-between md:justify-end">
                  {/* Mobile Filter Button */}
                  <Sheet
                    open={isMobileFilterOpen}
                    onOpenChange={setIsMobileFilterOpen}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="lg:hidden gap-1.5 rounded-xl text-xs h-10"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
                        <span>Filters</span>
                        {activeFiltersCount > 0 && (
                          <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0 h-4">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-80 overflow-y-auto p-6"
                    >
                      <SheetHeader className="p-0 pb-4 border-b border-border">
                        <SheetTitle className="flex items-center gap-2 text-base">
                          <Filter className="h-4 w-4 text-accent" />
                          Filter Products
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 pb-8">
                        <ShopSidebar
                          minPrice={minPrice}
                          maxPrice={maxPrice}
                          setMinPrice={setMinPrice}
                          setMaxPrice={setMaxPrice}
                          categories={categories}
                          categoryCounts={categoryCounts}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          inStockOnly={inStockOnly}
                          setInStockOnly={setInStockOnly}
                          activeFiltersCount={activeFiltersCount}
                          handleClearAllFilters={handleClearAllFilters}
                          onItemClick={() => setIsMobileFilterOpen(false)}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Grid Layout Density Switcher (Desktop/Tablet) */}
                  <div className="hidden sm:flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/60">
                    <button
                      onClick={() => setGridCols("list")}
                      title="List View"
                      className={`p-1.5 rounded-lg transition-colors ${
                        gridCols === "list"
                          ? "bg-background text-accent shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridCols("2")}
                      title="2 Columns Grid"
                      className={`p-1.5 rounded-lg transition-colors ${
                        gridCols === "2"
                          ? "bg-background text-accent shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridCols("3")}
                      title="4 Columns Grid"
                      className={`p-1.5 rounded-lg transition-colors ${
                        gridCols === "3"
                          ? "bg-background text-accent shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridCols("4")}
                      title="3 Columns Grid"
                      className={`p-1.5 rounded-lg transition-colors ${
                        gridCols === "4"
                          ? "bg-background text-accent shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px] md:w-[170px] h-10 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="Sort by" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="bestsellers">Best Sellers</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filter Badges Bar */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4 bg-muted/30 p-2.5 rounded-xl border border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Active Filters:
                  </span>

                  {searchQuery && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs py-1 px-2.5 rounded-lg"
                    >
                      <span>Search: "{searchQuery}"</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}

                  {selectedCategory &&
                    selectedCategory !== "all" &&
                    selectedCategory.split(",").map((slug) => (
                      <Badge
                        key={slug}
                        variant="secondary"
                        className="gap-1 text-xs py-1 px-2.5 rounded-lg"
                      >
                        <span>
                          Category:{" "}
                          {categories.find((c) => c.slug === slug)?.name ||
                            slug}
                        </span>
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => {
                            const current = selectedCategory.split(",");
                            const newCategories = current.filter(
                              (c) => c !== slug
                            );
                            setSelectedCategory(
                              newCategories.length > 0
                                ? newCategories.join(",")
                                : "all"
                            );
                          }}
                        />
                      </Badge>
                    ))}

                  {selectedStatus !== "all" && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs py-1 px-2.5 rounded-lg"
                    >
                      <span>Type: {selectedStatus}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSelectedStatus("all")}
                      />
                    </Badge>
                  )}

                  {(minPrice !== "" || maxPrice !== "") && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs py-1 px-2.5 rounded-lg"
                    >
                      <span>
                        Price: ৳{minPrice || 0} - ৳{maxPrice || "Max"}
                      </span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                      />
                    </Badge>
                  )}

                  {inStockOnly && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs py-1 px-2.5 rounded-lg"
                    >
                      <span>In Stock Only</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setInStockOnly(false)}
                      />
                    </Badge>
                  )}

                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs text-accent hover:underline font-medium ml-auto"
                  >
                    Clear All
                  </button>
                </div>
              )}

              <ShopProductGrid
                isLoading={isLoading}
                products={products}
                totalProductsCount={totalProductsCount}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
                gridCols={gridCols}
                setCurrentPage={setCurrentPage}
                handleClearAllFilters={handleClearAllFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
