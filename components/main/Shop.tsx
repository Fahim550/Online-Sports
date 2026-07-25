"use client";

import { ProductCard } from "@/components/main/products/ProductCard";
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
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Grid2X2,
  Grid3X3,
  Home,
  LayoutGrid,
  List,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

  // Dynamic Status Flags (only show status tabs if products exist in dashboard)
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

  // Sidebar Filter Component
  const renderFilterContent = (onItemClick?: () => void) => (
    <div className="space-y-6">
      {/* Price Range Filter (Moved UP) */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Max Price: ৳{maxPrice || 1000}</span>
          {maxPrice !== "" && (
            <button
              onClick={() => {
                setMaxPrice("");
                setMinPrice("");
              }}
              className="text-[10px] cursor-pointer bg-accent/10 text-accent hover:bg-accent hover:text-white px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
          )}
        </h3>

        <div className="pt-2 pb-1">
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={maxPrice !== "" ? maxPrice : 1000}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setMinPrice("0");
            }}
            style={{
              background: `linear-gradient(to right, hsl(var(--accent)) ${((maxPrice !== "" ? Number(maxPrice) : 1000) / 1000) * 100}%, hsl(var(--secondary)) ${((maxPrice !== "" ? Number(maxPrice) : 1000) / 1000) * 100}%)`
            }}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span>৳0</span>
            <span>৳1000</span>
          </div>
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Categories
          </h3>
          {selectedCategory && selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-[10px] cursor-pointer bg-accent/10 text-accent hover:bg-accent hover:text-white px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 text-xs font-medium scrollbar-thin">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory.split(",").includes(cat.slug);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl hover:bg-secondary cursor-pointer transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected
                    ? "bg-accent border-accent text-accent-foreground"
                    : "border-input bg-background"
                    }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  onChange={(e) => {
                    const current = selectedCategory && selectedCategory !== "all" ? selectedCategory.split(",") : [];
                    let newCategories;
                    if (e.target.checked) {
                      newCategories = [...current.filter(c => c !== ""), cat.slug];
                    } else {
                      newCategories = current.filter(c => c !== cat.slug);
                    }
                    setSelectedCategory(newCategories.length > 0 ? newCategories.join(",") : "all");
                  }}
                />
                <span className="truncate flex-1 text-foreground/80">{cat.name}</span>
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-auto">{count}</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* In Stock Availability Filter */}
      <div className="space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${inStockOnly
              ? "bg-accent border-accent text-accent-foreground"
              : "border-input bg-background"
              }`}
          >
            {inStockOnly && <Check className="h-3 w-3" />}
          </div>
          <span className="text-xs font-medium text-foreground">In Stock Products Only</span>
        </label>
      </div>

      {/* Clear All Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full rounded-xl gap-2 text-xs border-dashed text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            handleClearAllFilters();
            onItemClick?.();
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-background min-h-screen">
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

          {/* Quick Collection Status Tabs (Dynamically rendered on full-width sub-row) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-3.5 scrollbar-none border-t border-border/40 mt-4">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedStatus === "all"
                ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                : "bg-background border border-border/80 text-foreground/80 hover:bg-secondary"
                }`}
            >
              <span>All Collection</span>
            </button>
            {hasSaleProducts && (
              <button
                onClick={() => setSelectedStatus("sale")}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedStatus === "sale"
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
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedStatus === "new"
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
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedStatus === "bestsellers"
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
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedStatus === "featured"
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
              {renderFilterContent()}
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
                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-1.5 rounded-xl text-xs h-10">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0 h-4">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto p-6">
                    <SheetHeader className="p-0 pb-4 border-b border-border">
                      <SheetTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4 text-accent" />
                        Filter Products
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 pb-8">
                      {renderFilterContent(() => setIsMobileFilterOpen(false))}
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Grid Layout Density Switcher (Desktop/Tablet) */}
                <div className="hidden sm:flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/60">
                  <button
                    onClick={() => setGridCols("list")}
                    title="List View"
                    className={`p-1.5 rounded-lg transition-colors ${gridCols === "list"
                      ? "bg-background text-accent shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridCols("2")}
                    title="2 Columns Grid"
                    className={`p-1.5 rounded-lg transition-colors ${gridCols === "2"
                      ? "bg-background text-accent shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridCols("3")}
                    title="4 Columns Grid"
                    className={`p-1.5 rounded-lg transition-colors ${gridCols === "3"
                      ? "bg-background text-accent shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridCols("4")}
                    title="3 Columns Grid"
                    className={`p-1.5 rounded-lg transition-colors ${gridCols === "4"
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
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
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
                  <Badge variant="secondary" className="gap-1 text-xs py-1 px-2.5 rounded-lg">
                    <span>Search: "{searchQuery}"</span>
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}

                {selectedCategory && selectedCategory !== "all" && selectedCategory.split(",").map(slug => (
                  <Badge key={slug} variant="secondary" className="gap-1 text-xs py-1 px-2.5 rounded-lg">
                    <span>Category: {categories.find((c) => c.slug === slug)?.name || slug}</span>
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => {
                      const current = selectedCategory.split(",");
                      const newCategories = current.filter(c => c !== slug);
                      setSelectedCategory(newCategories.length > 0 ? newCategories.join(",") : "all");
                    }} />
                  </Badge>
                ))}

                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-1 px-2.5 rounded-lg">
                    <span>Type: {selectedStatus}</span>
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setSelectedStatus("all")} />
                  </Badge>
                )}

                {(minPrice !== "" || maxPrice !== "") && (
                  <Badge variant="secondary" className="gap-1 text-xs py-1 px-2.5 rounded-lg">
                    <span>Price: ৳{minPrice || 0} - ৳{maxPrice || "Max"}</span>
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => { setMinPrice(""); setMaxPrice(""); }} />
                  </Badge>
                )}

                {inStockOnly && (
                  <Badge variant="secondary" className="gap-1 text-xs py-1 px-2.5 rounded-lg">
                    <span>In Stock Only</span>
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setInStockOnly(false)} />
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

            {/* Results Count Summary */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs text-muted-foreground font-medium">
                {isLoading ? (
                  "Loading products..."
                ) : totalProductsCount > 0 ? (
                  <>
                    Showing <span className="text-foreground font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalProductsCount)}</span>–<span className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, totalProductsCount)}</span> of <span className="text-foreground font-bold">{totalProductsCount}</span> products
                  </>
                ) : (
                  "0 products found"
                )}
              </p>
            </div>

            {/* Product Grid / Loader / Empty State */}
            {isLoading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 bg-card/45 backdrop-blur-md border border-border/80 rounded-3xl p-12 shadow-xs">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
                <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Loading Products...</p>
              </div>
            ) : products.length > 0 ? (
              <div
                className={
                  gridCols === "list"
                    ? "space-y-4"
                    : `grid gap-3 ${gridCols === "2"
                      ? "grid-cols-2"
                      : gridCols === "4"
                        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                        : "grid-cols-2 sm:grid-cols-3"
                    }`
                }
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Enhanced Empty State */
              <div className="bg-card border border-border/80 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Package className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No products found</h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  We couldn't find any products matching your selected search terms or filters. Try clearing your filters to see more results.
                </p>
                <Button onClick={handleClearAllFilters} className="rounded-xl gap-2 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </Button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-border/60">
                <p className="text-xs text-muted-foreground font-medium">
                  Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, totalProductsCount)}</span> of{" "}
                  <span className="font-bold text-foreground">{totalProductsCount}</span> products
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className="rounded-xl text-xs gap-1 h-9 px-3 border-border/80 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isCurrent = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 200, behavior: "smooth" });
                          }}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${isCurrent
                            ? "bg-accent text-accent-foreground shadow-sm scale-105"
                            : "bg-background border border-border/80 text-foreground/80 hover:bg-secondary hover:text-foreground"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className="rounded-xl text-xs gap-1 h-9 px-3 border-border/80 cursor-pointer disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
