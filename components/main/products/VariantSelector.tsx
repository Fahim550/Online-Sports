"use client";

import { ProductVariant } from "@/hooks/useVariants";
import { cn } from "@/lib/utils";
import { Check, Ruler, Edit2, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { FabricPricingGuide } from "./FabricPricingGuide";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  sizeQuantities: Record<string, number>;
  onSizeQuantityChange: (size: string, quantity: number, maxStock: number) => void;
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
  fabricOptions?: { id: string; name: string; desc?: string }[];
  selectedFabric?: string | null;
  onFabricSelect?: (fabric: string) => void;
}

// Map common color names to CSS color hex/values
const colorMap: Record<string, string> = {
  black: "#0f172a",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  navy: "#1e3a8a",
  green: "#22c55e",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  orange: "#f97316",
  grey: "#64748b",
  gray: "#64748b",
  brown: "#78350f",
  gold: "#d97706",
  beige: "#f5f5dc",
  maroon: "#800000",
};

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
  sizeQuantities,
  onSizeQuantityChange,
  selectedColor,
  onColorSelect,
  fabricOptions,
  selectedFabric,
  onFabricSelect,
}: VariantSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showPricingGuide, setShowPricingGuide] = useState(false);

  // Local state for split fabric/sleeve selection
  const [localFabric, setLocalFabric] = useState<string | null>(null);
  const [localSleeve, setLocalSleeve] = useState<"Short Sleeve" | "Long Sleeve">("Short Sleeve");

  // Sync local state when selectedFabric prop changes (e.g., from outside)
  useEffect(() => {
    if (selectedFabric) {
      const match = selectedFabric.match(/^(.*?)\s*\((Short Sleeve|Long Sleeve)\)$/);
      if (match) {
        setLocalFabric(match[1].trim());
        setLocalSleeve(match[2] as any);
      } else {
        setLocalFabric(selectedFabric);
      }
    }
  }, [selectedFabric]);

  // Handle local changes and push to parent
  const handleLocalChange = (fabric: string | null, sleeve: "Short Sleeve" | "Long Sleeve") => {
    if (fabric && onFabricSelect) {
      onFabricSelect(`${fabric} (${sleeve})`);
    }
  };

  // Extract unique sizes
  const sizes = [
    ...new Set(variants.filter((v) => v.size).map((v) => v.size!)),
  ];

  // Extract unique colors (split comma-separated)
  const allColors = [
    ...new Set(
      variants
        .filter((v) => v.color)
        .flatMap((v) => v.color!.split(",").map((c) => c.trim()))
        .filter(Boolean),
    ),
  ];

  // Find best matching variant for given size + color + fabric
  const findVariant = (
    size: string | null,
    color: string | null,
    fabric?: string | null,
  ): ProductVariant | null => {
    const normFabric = fabric ? fabric.toLowerCase().trim() : null;

    if (size && color) {
      const match = variants.find(
        (v) =>
          v.size === size &&
          v.color
            ?.split(",")
            .map((c) => c.trim())
            .includes(color) &&
          (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric) &&
          v.is_active &&
          v.stock > 0,
      );
      if (match) return match;
    }

    if (size) {
      const match =
        variants.find((v) => v.size === size && (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric) && v.is_active && v.stock > 0) ||
        variants.find((v) => v.size === size && (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric)) ||
        variants.find((v) => v.size === size && v.is_active && v.stock > 0) ||
        variants.find((v) => v.size === size);
      if (match) return match;
    }

    if (color) {
      const match =
        variants.find(
          (v) =>
            v.color
              ?.split(",")
              .map((c) => c.trim())
              .includes(color) &&
            (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric) &&
            v.is_active &&
            v.stock > 0,
        ) ||
        variants.find((v) =>
          v.color
            ?.split(",")
            .map((c) => c.trim())
            .includes(color) &&
          (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric)
        ) ||
        variants.find(
          (v) =>
            v.color
              ?.split(",")
              .map((c) => c.trim())
              .includes(color) &&
            v.is_active &&
            v.stock > 0,
        ) ||
        variants.find((v) =>
          v.color
            ?.split(",")
            .map((c) => c.trim())
            .includes(color),
        );
      if (match) return match;
    }

    return null;
  };


  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    // When color changes, we might want to update selectedVariant based on the first size that has quantity, or just the first available
    const activeSize = Object.keys(sizeQuantities).find(s => sizeQuantities[s] > 0) || null;
    const variant = findVariant(activeSize, color, selectedFabric);
    if (variant) {
      onSelect(variant);
    }
  };

  const isSizeAvailable = (size: string) =>
    variants.some((v) => v.size === size && v.stock > 0 && v.is_active);

  const isColorAvailable = (color: string) =>
    variants.some(
      (v) =>
        v.color
          ?.split(",")
          .map((c) => c.trim())
          .includes(color) &&
        v.stock > 0 &&
        v.is_active &&
        (!selectedFabric || v.fabric === selectedFabric || !v.fabric)
    );

  const visibleColors = allColors.filter(color => 
    variants.some(v => 
      v.color?.split(",").map((c) => c.trim()).includes(color) && 
      (!selectedFabric || v.fabric === selectedFabric)
    )
  );

  return (
    <div className="space-y-5">
      {/* Fabric Selector */}
      {fabricOptions && fabricOptions.length > 0 && onFabricSelect && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span>Fabric Type (ফ্যাব্রিক):</span>
            </label>

            <button
              type="button"
              onClick={() => setShowPricingGuide(true)}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Pricing Guide</span>
            </button>
          </div>

          <div className="grid gap-3">
            <div className="relative">
              <select
                className="w-full h-11 px-3 border border-border/60 rounded-xl text-sm font-semibold bg-card text-foreground cursor-pointer outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all appearance-none pr-10"
                value={localFabric || ""}
                onChange={(e) => {
                  setLocalFabric(e.target.value);
                  handleLocalChange(e.target.value, localSleeve);
                }}
              >
                <option value="" disabled>Select Fabric</option>
                {fabricOptions.map((fabric) => (
                  <option key={fabric.id} value={fabric.name}>
                    {fabric.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {localFabric && (
              <div className="flex gap-2">
                {(["Short Sleeve", "Long Sleeve"] as const).map((sleeve) => {
                  const isSelected = localSleeve === sleeve;
                  return (
                    <button
                      key={sleeve}
                      type="button"
                      onClick={() => {
                        setLocalSleeve(sleeve);
                        handleLocalChange(localFabric, sleeve);
                      }}
                      className={cn(
                        "flex-1 h-10 px-4 rounded-xl border text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                        isSelected
                          ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/40 shadow-2xs scale-105"
                          : "border-border/50 bg-card text-foreground hover:border-accent/40 hover:bg-secondary/30"
                      )}
                    >
                      <span>{sleeve}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-accent stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Size Selector (Bulk Quantities) */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span>Size & Quantity:</span>
            </label>

            <button
              type="button"
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Ruler className="h-3.5 w-3.5" />
              <span>Size Guide</span>
            </button>
          </div>

          <div className="flex flex-wrap lg:grid lg:grid-cols-5 gap-2.5">
            {sizes.map((size) => {
              const availableVariant = variants.find((v) => v.size === size && v.stock > 0 && v.is_active && (!selectedColor || v.color?.includes(selectedColor)) && (!selectedFabric || v.fabric === selectedFabric));
              const maxStock = availableVariant?.stock || 0;
              const currentQty = sizeQuantities[size] || 0;
              const isAvailable = maxStock > 0;

              return (
                <div key={size} className={cn("flex-1 min-w-[28%] lg:min-w-0 flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200", isAvailable ? (currentQty > 0 ? "bg-accent/5 border-accent shadow-xs ring-1 ring-accent/20" : "bg-card border-border/60 hover:border-accent/50 hover:shadow-2xs") : "bg-muted/30 border-border/30 opacity-50")}>
                  <div className="flex flex-col items-center gap-0.5 mb-2.5">
                    <span className={cn("font-black text-sm uppercase", currentQty > 0 ? "text-accent" : "text-foreground")}>{size}</span>
                    {!isAvailable && (
                      <span className="text-[10px] text-muted-foreground font-medium">Out of Stock</span>
                    )}
                  </div>
                  
                  {isAvailable && (
                    <div className="flex items-center bg-secondary/40 border border-border/50 rounded-lg p-0.5 w-full justify-between">
                      <button 
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background hover:shadow-xs transition-all disabled:opacity-30 cursor-pointer"
                        onClick={() => onSizeQuantityChange(size, Math.max(0, currentQty - 1), maxStock)}
                        disabled={currentQty <= 0}
                      >
                        <span className="text-xl font-medium leading-none mb-0.5">-</span>
                      </button>
                      <div className="text-center font-bold text-sm text-foreground flex-1">
                        {currentQty}
                      </div>
                      <button 
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background hover:shadow-xs transition-all disabled:opacity-30 cursor-pointer"
                        onClick={() => onSizeQuantityChange(size, Math.min(maxStock, currentQty + 1), maxStock)}
                        disabled={currentQty >= maxStock}
                      >
                        <span className="text-xl font-medium leading-none mb-0.5">+</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {visibleColors.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>Color:</span>
            {selectedColor && (
              <span className="text-accent font-extrabold normal-case bg-accent/10 px-2 py-0.5 rounded-md text-xs">
                {selectedColor}
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2.5">
            {visibleColors.map((color) => {
              const available = isColorAvailable(color);
              const isSelected = selectedColor === color;
              const colorHex = colorMap[color.toLowerCase().trim()];

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  disabled={!available}
                  title={color}
                  className={cn(
                    "h-10 px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/40 shadow-2xs scale-105"
                      : available
                        ? "border-border/50 bg-card text-foreground hover:border-accent/40 hover:bg-secondary/30"
                        : "border-border/30 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through",
                  )}
                >
                  {/* Swatch Dot */}
                  {colorHex ? (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-xs shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                  ) : null}

                  <span>{color}</span>

                  {isSelected && <Check className="h-3.5 w-3.5 text-accent stroke-[3] ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-accent" />
                <h3 className="font-extrabold text-base text-foreground">Standard Size Guide</h3>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-lg bg-secondary"
              >
                ✕ Close
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-border/60 text-xs">
              <table className="w-full text-center">
                <thead>
                  <tr className="bg-accent/10 text-accent font-bold border-b border-border/60">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest (in)</th>
                    <th className="py-2.5 px-3">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40 bg-card">
                    <td className="py-2 px-3 font-bold">M</td>
                    <td className="py-2 px-3 text-muted-foreground">38" - 40"</td>
                    <td className="py-2 px-3 text-muted-foreground">27"</td>
                  </tr>
                  <tr className="border-b border-border/40 bg-secondary/30">
                    <td className="py-2 px-3 font-bold">L</td>
                    <td className="py-2 px-3 text-muted-foreground">41" - 42"</td>
                    <td className="py-2 px-3 text-muted-foreground">28"</td>
                  </tr>
                  <tr className="border-b border-border/40 bg-card">
                    <td className="py-2 px-3 font-bold">XL</td>
                    <td className="py-2 px-3 text-muted-foreground">43" - 44"</td>
                    <td className="py-2 px-3 text-muted-foreground">29"</td>
                  </tr>
                  <tr className="bg-secondary/30">
                    <td className="py-2 px-3 font-bold">XXL</td>
                    <td className="py-2 px-3 text-muted-foreground">45" - 46"</td>
                    <td className="py-2 px-3 text-muted-foreground">30"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-muted-foreground text-center italic">
              Measurements are in inches. Standard regular fit.
            </p>
          </div>
        </div>
      )}

      {/* Fabric Pricing Guide Modal */}
      {showPricingGuide && (
        <FabricPricingGuide onClose={() => setShowPricingGuide(false)} />
      )}
    </div>
  );
}
