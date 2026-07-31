import { Button } from "@/components/ui/button";
import { Check, RotateCcw, Tag } from "lucide-react";

interface ShopSidebarProps {
  minPrice: string;
  maxPrice: string;
  setMinPrice: (val: string) => void;
  setMaxPrice: (val: string) => void;
  categories: any[];
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  activeFiltersCount: number;
  handleClearAllFilters: () => void;
  onItemClick?: () => void;
}

export function ShopSidebar({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  categories,
  categoryCounts,
  selectedCategory,
  setSelectedCategory,
  inStockOnly,
  setInStockOnly,
  activeFiltersCount,
  handleClearAllFilters,
  onItemClick,
}: ShopSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Price Filter</span>
          {(minPrice !== "" || maxPrice !== "") && (
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

        <div className="pt-2 pb-1 relative h-6">
          {/* Background Track */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-lg bg-secondary pointer-events-none" />

          {/* Active Range Track */}
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-lg bg-accent pointer-events-none"
            style={{
              left: `${(Number(minPrice || 0) / 1000) * 100}%`,
              right: `${100 - (Number(maxPrice !== "" ? maxPrice : 1000) / 1000) * 100}%`,
            }}
          />

          {/* Min Thumb */}
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={minPrice !== "" ? minPrice : 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              const max = Number(maxPrice !== "" ? maxPrice : 1000);
              if (val > max) {
                setMinPrice(max.toString());
              } else {
                setMinPrice(val.toString());
              }
            }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-md cursor-pointer z-20"
          />

          {/* Max Thumb */}
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={maxPrice !== "" ? maxPrice : 1000}
            onChange={(e) => {
              const val = Number(e.target.value);
              const min = Number(minPrice || 0);
              if (val < min) {
                setMaxPrice(min.toString());
              } else {
                setMaxPrice(val.toString());
              }
            }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-md cursor-pointer z-10"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-medium">
          <span>৳{minPrice || 0}</span>
          <span>৳{maxPrice !== "" ? maxPrice : 1000}</span>
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
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
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
                    const current =
                      selectedCategory && selectedCategory !== "all"
                        ? selectedCategory.split(",")
                        : [];
                    let newCategories;
                    if (e.target.checked) {
                      newCategories = [...current.filter((c) => c !== ""), cat.slug];
                    } else {
                      newCategories = current.filter((c) => c !== cat.slug);
                    }
                    setSelectedCategory(
                      newCategories.length > 0 ? newCategories.join(",") : "all"
                    );
                  }}
                />
                <span className="truncate flex-1 text-foreground/80">
                  {cat.name}
                </span>
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {count}
                  </span>
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
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              inStockOnly
                ? "bg-accent border-accent text-accent-foreground"
                : "border-input bg-background"
            }`}
          >
            {inStockOnly && <Check className="h-3 w-3" />}
          </div>
          <span className="text-xs font-medium text-foreground">
            In Stock Products Only
          </span>
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
}
