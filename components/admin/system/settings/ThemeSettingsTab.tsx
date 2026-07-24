import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Palette, RotateCcw, Save } from "lucide-react";

interface ThemeFormData {
  brand_accent: string;
  brand_primary: string;
  brand_secondary: string;
  brand_background: string;
  brand_foreground: string;
  brand_muted: string;
  brand_border: string;
  brand_card: string;
  brand_radius: string;
  themeAccentColor: string;
}

interface Props {
  formData: ThemeFormData;
  setFormData: (data: ThemeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isPending: boolean;
}

const COLOR_FIELDS = [
  { key: "brand_accent", label: "Accent / CTA", desc: "Buttons, links, badges" },
  { key: "brand_primary", label: "Primary", desc: "Header, headings, text" },
  { key: "brand_secondary", label: "Secondary", desc: "Secondary surfaces" },
  { key: "brand_background", label: "Background", desc: "Page background" },
  { key: "brand_foreground", label: "Text", desc: "Main text color" },
  { key: "brand_muted", label: "Muted Text", desc: "Secondary text" },
  { key: "brand_border", label: "Border", desc: "Borders, dividers" },
  { key: "brand_card", label: "Card / Surface", desc: "Cards, modals, popups" },
] as const;

const RADIUS_PRESETS = [
  { val: "0", label: "Sharp" },
  { val: "0.375", label: "Subtle" },
  { val: "0.5", label: "Default" },
  { val: "0.75", label: "Rounded" },
  { val: "1", label: "Pill" },
];

const ACCENT_PRESETS = [
  { color: "#6b2d5c", name: "Suyeb Logo Blend" },
  { color: "#088c90", name: "Suyeb Teal (Logo Match)" },
  { color: "#d10000", name: "Suyeb Red (Logo Match)" },
  { color: "#e85a4f", name: "Coral" },
  { color: "#3b82f6", name: "Blue" },
  { color: "#10b981", name: "Emerald" },
  { color: "#8b5cf6", name: "Violet" },
  { color: "#f59e0b", name: "Amber" },
  { color: "#ec4899", name: "Pink" },
  { color: "#06b6d4", name: "Cyan" },
  { color: "#ef4444", name: "Red" },
  { color: "#16a34a", name: "Green" },
  { color: "#4f46e5", name: "Indigo" },
  { color: "#f43f5e", name: "Rose" },
  { color: "#0ea5e9", name: "Sky Blue" },
  { color: "#ea580c", name: "Orange" },
  { color: "#d946ef", name: "Fuchsia" },
  { color: "#84cc16", name: "Lime" },
  { color: "#64748b", name: "Slate" },
];

export function ThemeSettingsTab({
  formData,
  setFormData,
  onSubmit,
  onReset,
  isPending,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Brand Colors</h2>
        </div>

        <div className="space-y-6">
          {/* Color Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_FIELDS.map((item) => (
              <div
                key={item.key}
                className="space-y-2 p-3 rounded-xl bg-secondary/30 border border-border/50"
              >
                <label className="block text-sm font-semibold">
                  {item.label}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={(formData as any)[item.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [item.key]: e.target.value })
                    }
                    className="w-11 h-11 rounded-xl border-2 border-border cursor-pointer shrink-0 shadow-sm"
                  />
                  <input
                    type="text"
                    value={(formData as any)[item.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [item.key]: e.target.value })
                    }
                    className="input-shop text-xs font-mono flex-1"
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Border Radius
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.125"
                value={formData.brand_radius}
                onChange={(e) =>
                  setFormData({ ...formData, brand_radius: e.target.value })
                }
                className="flex-1"
              />
              <span className="text-sm font-mono w-16 text-right">
                {formData.brand_radius}rem
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {RADIUS_PRESETS.map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, brand_radius: r.val })
                  }
                  className={cn(
                    "px-4 py-2 text-xs font-semibold border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                    formData.brand_radius === r.val
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/50",
                  )}
                  style={{ borderRadius: `${r.val}rem` }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Presets */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quick Accent Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      brand_accent: preset.color,
                      themeAccentColor: preset.color,
                    })
                  }
                  className={cn(
                    "w-11 h-11 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-sm",
                    formData.brand_accent === preset.color
                      ? "border-foreground ring-2 ring-offset-2 ring-foreground/30 scale-110"
                      : "border-transparent hover:border-foreground/20",
                  )}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Live Preview
            </label>
            <div
              className="rounded-xl border-2 overflow-hidden"
              style={{
                borderColor: formData.brand_border,
                borderRadius: `${formData.brand_radius}rem`,
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: formData.brand_primary }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: formData.brand_background }}
                >
                  Store Name
                </span>
                <div className="flex gap-2">
                  <span
                    className="text-xs"
                    style={{ color: formData.brand_background }}
                  >
                    Shop
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: formData.brand_background }}
                  >
                    Cart
                  </span>
                </div>
              </div>
              <div
                className="p-4 space-y-3"
                style={{ backgroundColor: formData.brand_background }}
              >
                <div
                  className="p-3"
                  style={{
                    backgroundColor: formData.brand_card,
                    borderRadius: `${formData.brand_radius}rem`,
                    border: `1px solid ${formData.brand_border}`,
                  }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: formData.brand_foreground }}
                  >
                    Product Card
                  </h3>
                  <p
                    className="text-xs mt-1"
                    style={{ color: formData.brand_muted }}
                  >
                    This is how content looks
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-3 py-1.5 text-xs font-medium text-white"
                      style={{
                        backgroundColor: formData.brand_accent,
                        borderRadius: `${formData.brand_radius}rem`,
                      }}
                    >
                      Buy Now
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs font-medium"
                      style={{
                        border: `1px solid ${formData.brand_border}`,
                        borderRadius: `${formData.brand_radius}rem`,
                        color: formData.brand_foreground,
                        backgroundColor: formData.brand_background,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="px-4 py-2 text-center"
                style={{ backgroundColor: formData.brand_primary }}
              >
                <span
                  className="text-[10px]"
                  style={{ color: formData.brand_muted }}
                >
                  © 2026 Store
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button type="submit" className="btn-accent" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Saving..." : "Save Theme"}
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </form>
  );
}
