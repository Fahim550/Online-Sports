"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Category, Product } from "@/hooks/useShopData";
import { Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProductRatingStats, useHideStockMap } from "@/hooks/useProductReviews";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: Product & { category?: Category | null };
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, formatCurrency } = useSiteSettings();
  const { addItem } = useCart();
  const router = useRouter();
  const { getProductRating } = useProductRatingStats();
  const { data: hideStockMap = {} } = useHideStockMap();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-slide effect for multiple images
  useEffect(() => {
    if (product.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(interval);
    }
  }, [product.images]);

  // Swipe handlers for mobile
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    } else if (isRightSwipe && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const ratingInfo = getProductRating(product.id);
  const ratingValue = ratingInfo.avgRating;
  const isStockHidden = hideStockMap[product.id] ?? (product as any)?.hide_stock ?? false;
  const isOutOfStock = product.stock <= 0 || isStockHidden;

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price || undefined,
      image: product.images[0] || "/placeholder.svg",
      quantity: 1,
      stock: product.stock || 10,
    });

    router.push("/checkout");
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price || undefined,
      image: product.images[0] || "/placeholder.svg",
      quantity: 1,
      stock: product.stock || 10,
    });

    toast.success(t("product.addedToCart") || "Product added to cart", {
      description: `1x ${product.name}`,
    });
  };

  return (
    <div className="group bg-card rounded-md border border-border/80 flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-foreground/5 p-2 justify-between">
      <div>
        {/* Image wrapper with padding */}
        <div 
          className="relative aspect-square overflow-hidden bg-secondary/50 rounded-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
            {product.images && product.images.length > 0 ? (
              product.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`${product.name} - image ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105 ${
                    idx === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                  height={320}
                  width={320}
                  loading={idx === 0 ? "lazy" : "lazy"}
                />
              ))
            ) : (
              <Image
                src="/placeholder.svg"
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                height={320}
                width={320}
                loading="lazy"
              />
            )}
          </Link>

          {/* Top Left Discount Badge (replacing the NEW badge position, aligned directly with corner) */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 z-10 pointer-events-none">
              <span className="bg-accent text-accent-foreground px-2 py-1 text-[12px] font-bold rounded-tl-[3px] rounded-br-md block shadow-sm">
                {discountPercent}% off
              </span>
            </div>
          )}

          {/* Out of Stock Overlay Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-destructive text-destructive-foreground px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-sm">
                Stock Out
              </span>
            </div>
          )}

          {/* Wishlist Button (Bottom Right of Image Area) */}
          <WishlistButton
            productId={product.id}
            size="sm"
            className="absolute bottom-2 right-2 z-20 bg-background/90 backdrop-blur-sm border border-border/60 shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 h-8 w-8 text-muted-foreground"
          />
        </div>

        {/* Content Details */}
        <div className="pt-2 pb-0.5 flex flex-col">
          <Link href={`/products/${product.slug}`} className="block group-hover:text-accent transition-colors">
            <h3 className="font-semibold text-[16px] line-clamp-2 leading-5 h-10 overflow-hidden text-ellipsis text-foreground/90 transition-colors group-hover:text-accent">
              {product.name}
            </h3>
          </Link>

          {/* Review Stars */}
          <div className="flex items-center gap-1 my-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${star <= Math.round(ratingValue)
                    ? "fill-amber-400 text-amber-400"
                    : "text-border fill-muted/20"
                    }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground ml-0.5">
              ({ratingValue.toFixed(1)})
            </span>
          </div>

          {/* Price Box */}
          <div className="flex items-center gap-1.5 text-md font-bold text-accent mt-0.5 leading-none">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-accent">
                  {formatCurrency(product.sale_price!)}
                </span>
                <span className="text-muted-foreground/60 font-medium">-</span>
                <span className="text-muted-foreground/80 line-through font-semibold text-xs">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      {isOutOfStock ? (
        <div className="mt-2 w-full">
          <button
            disabled
            className="w-full bg-destructive/10 text-destructive border border-destructive/20 font-extrabold py-2 px-3 rounded-md text-xs text-center cursor-not-allowed opacity-80"
          >
            Stock Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2 w-full">
          <button
            onClick={handleBuyNow}
            className="bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground font-bold py-2.5 px-1.5 sm:px-4 rounded-md text-[12px] sm:text-[15px] whitespace-nowrap flex-1 transition-all duration-200 shadow-sm active:scale-[0.98] text-center select-none flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 shrink-0 hidden sm:inline-block" />
            <span>{t("product.orderNow")}</span>
          </button>
          <div className="relative group/cart shrink-0">
            <button
              onClick={handleAddToCartClick}
              className="bg-accent/10 text-accent border border-accent/10 p-2 rounded-md transition-all duration-200 shrink-0 flex items-center justify-center h-10 w-10 active:scale-[0.98] cursor-pointer hover:bg-accent hover:text-accent-foreground"
              aria-label="Add to cart"
              title="Add to cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
            {/* Small hover tooltip below */}
            <span className="pointer-events-none absolute -bottom-7 right-0 opacity-0 group-hover/cart:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-40">
              Add to cart
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
