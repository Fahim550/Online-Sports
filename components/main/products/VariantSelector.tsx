"use client";

import { ProductVariant } from "@/hooks/useVariants";
import { cn } from "@/lib/utils";
import { Check, Ruler } from "lucide-react";
import { useEffect, useState } from "react";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  selectedSize: string | null;
  onSizeSelect: (size: string | null) => void;
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
  selectedFabric?: string | null;
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
  selectedSize,
  onSizeSelect,
  selectedColor,
  onColorSelect,
  selectedFabric,
}: VariantSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

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

  const handleSizeSelect = (size: string) => {
    onSizeSelect(size);
    const variant = findVariant(size, selectedColor, selectedFabric);
    if (variant) {
      onSelect(variant);
    }
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    const variant = findVariant(selectedSize, color, selectedFabric);
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
        (!selectedSize || v.size === selectedSize || !v.size),
    );

  const visibleColors = selectedSize
    ? [
        ...new Set(
          variants
            .filter((v) => v.size === selectedSize && v.color)
            .flatMap((v) => v.color!.split(",").map((c) => c.trim()))
            .filter(Boolean),
        ),
      ]
    : allColors;

  return (
    <div className="space-y-5">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span>Size:</span>
              {selectedSize && (
                <span className="text-accent font-extrabold normal-case bg-accent/10 px-2 py-0.5 rounded-md text-xs">
                  {selectedSize}
                </span>
              )}
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

          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeSelect(size)}
                  disabled={!available}
                  className={cn(
                    "min-w-[48px] h-10 px-4 rounded-xl border text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/40 shadow-2xs scale-105"
                      : available
                        ? "border-border/50 bg-card text-foreground hover:border-accent/40 hover:bg-secondary/30"
                        : "border-border/30 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through",
                  )}
                >
                  <span>{size}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent stroke-[3]" />}
                </button>
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
    </div>
  );
}
