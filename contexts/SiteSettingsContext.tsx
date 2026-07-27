"use client";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import enTranslations from "../il8n/translations/en.json";

type TranslationsType = typeof enTranslations;

const loadedTranslations: Record<string, TranslationsType> = {
  en: enTranslations,
};

// Helper function to convert hex color to HSL string
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Returns HSL for white or black foreground based on hex luminance
function getContrastForeground(hex: string): string {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  // Relative luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? "220 20% 12%" : "0 0% 100%";
}

export interface SiteSettings {
  id: string;
  default_country_code: string;
  default_country_name: string;
  currency_code: string;
  currency_symbol: string;
  currency_locale: string;
  language: "en" | "hi" | "bn" | "ar";
  updated_at: string;
  // Facebook Pixel fields
  fb_pixel_enabled: boolean;
  fb_pixel_id: string | null;
  fb_pixel_test_event_code: string | null;
  cookie_consent_enabled: boolean;
  // Theme settings (legacy)
  theme_accent_color: string;
  // Brand theme colors
  brand_primary: string;
  brand_secondary: string;
  brand_accent: string;
  brand_background: string;
  brand_foreground: string;
  brand_muted: string;
  brand_border: string;
  brand_card: string;
  brand_radius: string;
  // Conversion API fields
  fb_capi_enabled: boolean;
  fb_capi_dataset_id: string | null;
  fb_capi_test_event_code: string | null;
  fb_capi_api_version: string;
  // Stock visibility
  show_stock_to_visitors: boolean;
}



const defaultSettings: SiteSettings = {
  id: "global",
  default_country_code: "BD",
  default_country_name: "Bangladesh",
  currency_code: "BDT",
  currency_symbol: "৳",
  currency_locale: "bn-BD",
  language: "en",
  updated_at: new Date().toISOString(),
  fb_pixel_enabled: false,
  fb_pixel_id: null,
  fb_pixel_test_event_code: null,
  cookie_consent_enabled: false,
  theme_accent_color: "#e85a4f",
  brand_primary: "#1a1a2e",
  brand_secondary: "#f0f0f0",
  brand_accent: "#e85a4f",
  brand_background: "#faf9f7",
  brand_foreground: "#1a1a2e",
  brand_muted: "#6b7280",
  brand_border: "#e5e7eb",
  brand_card: "#ffffff",
  brand_radius: "0.5",
  fb_capi_enabled: false,
  fb_capi_dataset_id: null,
  fb_capi_test_event_code: null,
  fb_capi_api_version: "v20.0",
  show_stock_to_visitors: true,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  isError: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  userLanguagePreference: string | null;
  setUserLanguagePreference: (lang: string | null) => void;
  activeLanguage: "en" | "hi" | "bn" | "ar";
  refetch: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(
  undefined,
);
const supabase = createClient();

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [userLanguagePreference, setUserLanguagePreferenceState] = useState<
    string | null
  >(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userLanguagePreference");
    }
    return null;
  });

  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error) throw error;
      return (data as SiteSettings) || defaultSettings;
    },
    staleTime: 30 * 1000, // 30 seconds - ensures quick propagation after admin saves
    retry: 2,
  });

  const setUserLanguagePreference = useCallback((lang: string | null) => {
    setUserLanguagePreferenceState(lang);
    if (lang) {
      localStorage.setItem("userLanguagePreference", lang);
    } else {
      localStorage.removeItem("userLanguagePreference");
    }
  }, []);

  const activeSettings = settings || defaultSettings;

  // Apply all brand theme colors to CSS variables
  useEffect(() => {
    if (!settings) return;
    
    const root = document.documentElement;
    const s = activeSettings;
    const themeVars: Record<string, string> = {};

    // Apply accent (also used as ring)
    const accentColor = s.brand_accent || s.theme_accent_color;
    if (accentColor) {
      const accentHsl = hexToHSL(accentColor);
      root.style.setProperty("--accent", accentHsl);
      root.style.setProperty("--ring", accentHsl);
      root.style.setProperty("--sidebar-ring", accentHsl);
      // Compute accent foreground (white or black based on luminance)
      root.style.setProperty(
        "--accent-foreground",
        getContrastForeground(accentColor),
      );
      // Update gradient to use the new accent color
      root.style.setProperty(
        "--gradient-accent",
        `linear-gradient(135deg, hsl(${accentHsl}) 0%, hsl(${accentHsl}) 100%)`,
      );

      themeVars["--accent"] = accentHsl;
      themeVars["--ring"] = accentHsl;
      themeVars["--sidebar-ring"] = accentHsl;
      themeVars["--accent-foreground"] = getContrastForeground(accentColor);
      themeVars["--gradient-accent"] = `linear-gradient(135deg, hsl(${accentHsl}) 0%, hsl(${accentHsl}) 100%)`;
    }

    // Apply primary
    if (s.brand_primary) {
      const primaryHsl = hexToHSL(s.brand_primary);
      root.style.setProperty("--primary", primaryHsl);
      root.style.setProperty("--sidebar-primary", primaryHsl);
      root.style.setProperty(
        "--primary-foreground",
        getContrastForeground(s.brand_primary),
      );
      root.style.setProperty(
        "--sidebar-primary-foreground",
        getContrastForeground(s.brand_primary),
      );

      themeVars["--primary"] = primaryHsl;
      themeVars["--sidebar-primary"] = primaryHsl;
      themeVars["--primary-foreground"] = getContrastForeground(s.brand_primary);
      themeVars["--sidebar-primary-foreground"] = getContrastForeground(s.brand_primary);
    }

    // Apply secondary
    if (s.brand_secondary) {
      const secondaryHsl = hexToHSL(s.brand_secondary);
      root.style.setProperty("--secondary", secondaryHsl);
      root.style.setProperty("--sidebar-accent", secondaryHsl);
      root.style.setProperty(
        "--secondary-foreground",
        getContrastForeground(s.brand_secondary),
      );

      themeVars["--secondary"] = secondaryHsl;
      themeVars["--sidebar-accent"] = secondaryHsl;
      themeVars["--secondary-foreground"] = getContrastForeground(s.brand_secondary);
    }

    // Apply background
    if (s.brand_background) {
      const bgHsl = hexToHSL(s.brand_background);
      root.style.setProperty("--background", bgHsl);
      root.style.setProperty(
        "--sidebar-background",
        bgHsl,
      );

      themeVars["--background"] = bgHsl;
      themeVars["--sidebar-background"] = bgHsl;
    }

    // Apply foreground
    if (s.brand_foreground) {
      const fgHsl = hexToHSL(s.brand_foreground);
      root.style.setProperty("--foreground", fgHsl);
      root.style.setProperty(
        "--sidebar-foreground",
        fgHsl,
      );

      themeVars["--foreground"] = fgHsl;
      themeVars["--sidebar-foreground"] = fgHsl;
    }

    // Apply muted
    if (s.brand_muted) {
      const mutedHsl = hexToHSL(s.brand_muted);
      root.style.setProperty("--muted-foreground", mutedHsl);
      themeVars["--muted-foreground"] = mutedHsl;
    }

    // Apply border
    if (s.brand_border) {
      const borderHsl = hexToHSL(s.brand_border);
      root.style.setProperty("--border", borderHsl);
      root.style.setProperty("--input", borderHsl);
      root.style.setProperty("--sidebar-border", borderHsl);

      themeVars["--border"] = borderHsl;
      themeVars["--input"] = borderHsl;
      themeVars["--sidebar-border"] = borderHsl;
    }

    // Apply card
    if (s.brand_card) {
      const cardHsl = hexToHSL(s.brand_card);
      root.style.setProperty("--card", cardHsl);
      root.style.setProperty("--popover", cardHsl);
      root.style.setProperty(
        "--card-foreground",
        getContrastForeground(s.brand_card),
      );
      root.style.setProperty(
        "--popover-foreground",
        getContrastForeground(s.brand_card),
      );

      themeVars["--card"] = cardHsl;
      themeVars["--popover"] = cardHsl;
      themeVars["--card-foreground"] = getContrastForeground(s.brand_card);
      themeVars["--popover-foreground"] = getContrastForeground(s.brand_card);
    }

    // Apply radius
    if (s.brand_radius) {
      root.style.setProperty("--radius", `${s.brand_radius}rem`);
      themeVars["--radius"] = `${s.brand_radius}rem`;
    }

    try {
      localStorage.setItem("site-theme-colors", JSON.stringify(themeVars));
    } catch (e) {
      // Ignore storage errors in private browsing/environments
    }
  }, [
    activeSettings.brand_primary,
    activeSettings.brand_secondary,
    activeSettings.brand_accent,
    activeSettings.brand_background,
    activeSettings.brand_foreground,
    activeSettings.brand_muted,
    activeSettings.brand_border,
    activeSettings.brand_card,
    activeSettings.brand_radius,
    activeSettings.theme_accent_color,
  ]);

  // User preference overrides global setting
  const activeLanguage =
    (userLanguagePreference as "en" | "hi" | "bn" | "ar") || activeSettings.language;

  const [, setLangLoaded] = useState(0);

  useEffect(() => {
    if (activeLanguage !== "en" && !loadedTranslations[activeLanguage]) {
      const loadLang = async () => {
        try {
          let mod;
          if (activeLanguage === "bn") mod = await import("../il8n/translations/bn.json");
          else if (activeLanguage === "hi") mod = await import("../il8n/translations/hi.json");
          else if (activeLanguage === "ar") mod = await import("../il8n/translations/ar.json");

          if (mod?.default) {
            loadedTranslations[activeLanguage] = mod.default as unknown as TranslationsType;
            setLangLoaded((v) => v + 1);
          }
        } catch {
          // Fallback to English on load error
        }
      };
      loadLang();
    }
  }, [activeLanguage]);

  // Translation function
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let value: unknown = loadedTranslations[activeLanguage] || loadedTranslations.en;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to English
          value = loadedTranslations.en;
          for (const fallbackKey of keys) {
            if (value && typeof value === "object" && fallbackKey in value) {
              value = (value as Record<string, unknown>)[fallbackKey];
            } else {
              return key; // Return key if not found
            }
          }
          break;
        }
      }

      return typeof value === "string" ? value : key;
    },
    [activeLanguage],
  );

  // Currency formatting function
  const formatCurrency = useCallback(
    (amount: number): string => {
      try {
        // Special logic for BDT (Bangladesh Taka) based on active language
        if (activeSettings.currency_code === "BDT") {
          if (activeLanguage === "bn") {
            // Show Bengali Taka symbol (৳) with Bengali numerals
            return new Intl.NumberFormat("bn-BD", {
              style: "currency",
              currency: "BDT",
              currencyDisplay: "symbol",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(amount);
          } else {
            // English language: show BDT code (e.g. BDT 100) using English numerals
            const formattedAmount = new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(amount);
            return `BDT ${formattedAmount}`;
          }
        }

        // Standard formatting for other currencies (Oman, Kuwait, UAE, Saudi Arabia, etc.)
        let formatLocale = activeSettings.currency_locale;
        if (activeLanguage === "en") {
          // Force English numbers (e.g. 1,000 instead of Arabic numerals if locale is ar-SA)
          formatLocale = "en-US";
        } else if (activeLanguage === "hi") {
          formatLocale = "hi-IN";
        }

        return new Intl.NumberFormat(formatLocale, {
          style: "currency",
          currency: activeSettings.currency_code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        // Fallback if locale/currency is not supported
        return `${activeSettings.currency_symbol}${amount.toFixed(2)}`;
      }
    },
    [
      activeSettings.currency_locale,
      activeSettings.currency_code,
      activeSettings.currency_symbol,
      activeLanguage,
    ],
  );

  return (
    <SiteSettingsContext.Provider
      value={{
        settings: activeSettings,
        isLoading,
        isError,
        t,
        formatCurrency,
        userLanguagePreference,
        setUserLanguagePreference,
        activeLanguage,
        refetch,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider",
    );
  }
  return context;
};

// Hook for admin to update settings
export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      settings: Partial<Omit<SiteSettings, "id" | "updated_at">>,
    ) => {
      const { data, error } = await supabase
        .from("site_settings")
        .update(settings)
        .eq("id", "global")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
};
