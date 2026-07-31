import { ProductCard } from "@/components/main/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package, RotateCcw } from "lucide-react";

interface ShopProductGridProps {
  isLoading: boolean;
  products: any[];
  totalProductsCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  gridCols: "2" | "3" | "4" | "list";
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  handleClearAllFilters: () => void;
}

export function ShopProductGrid({
  isLoading,
  products,
  totalProductsCount,
  currentPage,
  itemsPerPage,
  totalPages,
  gridCols,
  setCurrentPage,
  handleClearAllFilters,
}: ShopProductGridProps) {
  return (
    <>
      {/* Results Count Summary */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs text-muted-foreground font-medium">
          {isLoading ? (
            "Loading products..."
          ) : totalProductsCount > 0 ? (
            <>
              Showing{" "}
              <span className="text-foreground font-bold">
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalProductsCount)}
              </span>
              –
              <span className="text-foreground font-bold">
                {Math.min(currentPage * itemsPerPage, totalProductsCount)}
              </span>{" "}
              of <span className="text-foreground font-bold">{totalProductsCount}</span> products
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
          <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">
            Loading Products...
          </p>
        </div>
      ) : products.length > 0 ? (
        <div
          className={
            gridCols === "list"
              ? "space-y-4"
              : `grid gap-3 ${
                  gridCols === "2"
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
          <h3 className="text-lg font-bold text-foreground mb-1">
            No products found
          </h3>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            We couldn't find any products matching your selected search terms or
            filters. Try clearing your filters to see more results.
          </p>
          <Button
            onClick={handleClearAllFilters}
            className="rounded-xl gap-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground font-medium">
            Showing{" "}
            <span className="font-bold text-foreground">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * itemsPerPage, totalProductsCount)}
            </span>{" "}
            of <span className="font-bold text-foreground">{totalProductsCount}</span> products
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev: number) => Math.max(prev - 1, 1));
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
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
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
                setCurrentPage((prev: number) => Math.min(prev + 1, totalPages));
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
    </>
  );
}
