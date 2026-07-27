"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSiteSettings,
  useUpdateSiteSettings,
} from "@/contexts/SiteSettingsContext";
import { getCountryByCode, getDefaultCountry } from "@/data/countries";
import {
  useStoreSettings,
  useUpdateStoreSettings,
} from "@/hooks/useStoreSettings";
import {
  testCapiEvent,
  testPixelConnection,
  validatePixelId,
} from "@/lib/facebook-pixel";
import { createClient } from "@/utils/supabase/client";
import { Globe, Loader2, Megaphone, Palette, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GlobalSettingsTab } from "./GlobalSettingsTab";
import { MarketingSettingsTab } from "./MarketingSettingsTab";
import { StoreSettingsTab } from "./StoreSettingsTab";
import { ThemeSettingsTab } from "./ThemeSettingsTab";

export default function AdminSettings() {
  const { settings, t, isLoading: siteLoading } = useSiteSettings();
  const { data: storeSettings, isLoading: storeLoading } = useStoreSettings();
  const updateSettings = useUpdateSiteSettings();
  const updateStoreSettings = useUpdateStoreSettings();

  const [formData, setFormData] = useState({
    countryCode: settings.default_country_code,
    countryName: settings.default_country_name,
    currencyCode: settings.currency_code,
    currencySymbol: settings.currency_symbol,
    currencyLocale: settings.currency_locale,
    language: settings.language,
    themeAccentColor: settings.theme_accent_color || "#e85a4f",
    brand_primary: settings.brand_primary || "#1a1a2e",
    brand_secondary: settings.brand_secondary || "#f0f0f0",
    brand_accent: settings.brand_accent || "#e85a4f",
    brand_background: settings.brand_background || "#faf9f7",
    brand_foreground: settings.brand_foreground || "#1a1a2e",
    brand_muted: settings.brand_muted || "#6b7280",
    brand_border: settings.brand_border || "#e5e7eb",
    brand_card: settings.brand_card || "#ffffff",
    brand_radius: settings.brand_radius || "0.5",
    show_stock_to_visitors: settings.show_stock_to_visitors ?? true,
  });

  const [storeData, setStoreData] = useState({
    store_name: "",
    store_logo: "",
    store_favicon: "",
    store_tagline: "",
    store_email: "",
    store_phone: "",
    store_address: "",
    store_city: "",
    store_postal_code: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    youtube_url: "",
    whatsapp_number: "",
    whatsapp_order_enabled: "false",
    footer_text: "",
    topbar_text: "",
    topbar_enabled: "true",
    whatsapp_banner_enabled: "false",
    whatsapp_banner_title: "",
    whatsapp_banner_number: "",
    whatsapp_banner_message: "",
    mobile_marquee_enabled: "false",
    mobile_marquee_text: "",
  });


  const [pixelData, setPixelData] = useState({
    fb_pixel_enabled: false,
    fb_pixel_id: "",
    fb_pixel_test_event_code: "",
    cookie_consent_enabled: false,
    fb_capi_enabled: false,
    fb_capi_dataset_id: "",
    fb_capi_test_event_code: "",
    fb_capi_api_version: "v20.0",
  });

  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [isTestingPixel, setIsTestingPixel] = useState(false);
  const [pixelTestResult, setPixelTestResult] = useState<
    "success" | "error" | null
  >(null);
  const [isTestingCapi, setIsTestingCapi] = useState(false);
  const [capiTestResult, setCapiTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // CAPI Token state
  const [capiToken, setCapiToken] = useState("");
  const [capiTokenMasked, setCapiTokenMasked] = useState<string | null>(null);
  const [hasCapiToken, setHasCapiToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showTokenValue, setShowTokenValue] = useState(false);
  const [tokenLastUpdated, setTokenLastUpdated] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTokenStatus = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const response = await supabase.functions.invoke("manage-capi-token", {
        method: "GET",
      });
      if (response.data) {
        setHasCapiToken(response.data.has_token || false);
        setCapiTokenMasked(response.data.masked || null);
        setTokenLastUpdated(response.data.updated_at || null);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchTokenStatus();
  }, [fetchTokenStatus]);

  useEffect(() => {
    if (settings) {
      setFormData({
        countryCode: settings.default_country_code,
        countryName: settings.default_country_name,
        currencyCode: settings.currency_code,
        currencySymbol: settings.currency_symbol,
        currencyLocale: settings.currency_locale,
        language: settings.language,
        themeAccentColor: settings.theme_accent_color || "#e85a4f",
        brand_primary: settings.brand_primary || "#1a1a2e",
        brand_secondary: settings.brand_secondary || "#f0f0f0",
        brand_accent: settings.brand_accent || "#e85a4f",
        brand_background: settings.brand_background || "#faf9f7",
        brand_foreground: settings.brand_foreground || "#1a1a2e",
        brand_muted: settings.brand_muted || "#6b7280",
        brand_border: settings.brand_border || "#e5e7eb",
        brand_card: settings.brand_card || "#ffffff",
        brand_radius: settings.brand_radius || "0.5",
        show_stock_to_visitors: settings.show_stock_to_visitors ?? true,
      });
      setPixelData({
        fb_pixel_enabled: settings.fb_pixel_enabled,
        fb_pixel_id: settings.fb_pixel_id || "",
        fb_pixel_test_event_code: settings.fb_pixel_test_event_code || "",
        cookie_consent_enabled: settings.cookie_consent_enabled,
        fb_capi_enabled: settings.fb_capi_enabled || false,
        fb_capi_dataset_id: settings.fb_capi_dataset_id || "",
        fb_capi_test_event_code: settings.fb_capi_test_event_code || "",
        fb_capi_api_version: settings.fb_capi_api_version || "v20.0",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (storeSettings) setStoreData(storeSettings);
  }, [storeSettings]);

  const handleCountrySelect = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setFormData({
        ...formData,
        countryCode: country.code,
        countryName: country.name,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
        currencyLocale: country.currencyLocale,
      });
    }
    setCountryOpen(false);
  };

  const handleReset = () => {
    const d = getDefaultCountry();
    setFormData({
      countryCode: d.code,
      countryName: d.name,
      currencyCode: d.currencyCode,
      currencySymbol: d.currencySymbol,
      currencyLocale: d.currencyLocale,
      language: "en",
      themeAccentColor: "#e85a4f",
      brand_primary: "#1a1a2e",
      brand_secondary: "#f0f0f0",
      brand_accent: "#e85a4f",
      brand_background: "#faf9f7",
      brand_foreground: "#1a1a2e",
      brand_muted: "#6b7280",
      brand_border: "#e5e7eb",
      brand_card: "#ffffff",
      brand_radius: "0.5",
      show_stock_to_visitors: true,
    });
  };

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryCode) {
      toast.error("Please select a country");
      return;
    }
    try {
      await updateSettings.mutateAsync({
        default_country_code: formData.countryCode,
        default_country_name: formData.countryName,
        currency_code: formData.currencyCode,
        currency_symbol: formData.currencySymbol,
        currency_locale: formData.currencyLocale,
        language: formData.language,
        theme_accent_color: formData.brand_accent,
        brand_primary: formData.brand_primary,
        brand_secondary: formData.brand_secondary,
        brand_accent: formData.brand_accent,
        brand_background: formData.brand_background,
        brand_foreground: formData.brand_foreground,
        brand_muted: formData.brand_muted,
        brand_border: formData.brand_border,
        brand_card: formData.brand_card,
        brand_radius: formData.brand_radius,
        show_stock_to_visitors: formData.show_stock_to_visitors,
      } as any);
      toast.success(t("admin.settingsSaved"));
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStoreSettings.mutateAsync(storeData);
      toast.success("Store settings saved successfully");
    } catch {
      toast.error("Failed to save store settings");
    }
  };

  const handlePixelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pixelData.fb_pixel_enabled) {
      if (!pixelData.fb_pixel_id.trim()) {
        toast.error("Please enter a Facebook Pixel ID");
        return;
      }
      if (!validatePixelId(pixelData.fb_pixel_id.trim())) {
        toast.error("Pixel ID must be 10-20 digits");
        return;
      }
    }
    if (pixelData.fb_capi_enabled) {
      if (
        !pixelData.fb_capi_dataset_id.trim() &&
        !pixelData.fb_pixel_id.trim()
      ) {
        toast.error("Please enter a Dataset ID or Pixel ID for Conversion API");
        return;
      }
    }
    try {
      await updateSettings.mutateAsync({
        fb_pixel_enabled: pixelData.fb_pixel_enabled,
        fb_pixel_id: pixelData.fb_pixel_id.trim() || null,
        fb_pixel_test_event_code:
          pixelData.fb_pixel_test_event_code.trim() || null,
        cookie_consent_enabled: pixelData.cookie_consent_enabled,
        fb_capi_enabled: pixelData.fb_capi_enabled,
        fb_capi_dataset_id: pixelData.fb_capi_dataset_id.trim() || null,
        fb_capi_test_event_code:
          pixelData.fb_capi_test_event_code.trim() || null,
        fb_capi_api_version: pixelData.fb_capi_api_version || "v20.0",
      } as any);
      toast.success("Marketing settings saved successfully");
    } catch {
      toast.error("Failed to save marketing settings");
    }
  };

  const handleSaveToken = async () => {
    if (!capiToken.trim()) {
      toast.error("Please enter an access token");
      return;
    }
    setIsSavingToken(true);
    try {
      const response = await supabase.functions.invoke("manage-capi-token", {
        body: { access_token: capiToken.trim() },
      });
      if (response.data?.success) {
        toast.success("Access token saved securely");
        setCapiToken("");
        setShowTokenInput(false);
        await fetchTokenStatus();
      } else {
        toast.error(response.data?.error || "Failed to save token");
      }
    } catch {
      toast.error("Failed to save access token");
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleTestPixel = async () => {
    if (!pixelData.fb_pixel_id.trim()) {
      toast.error("Enter a Pixel ID first");
      return;
    }
    if (!validatePixelId(pixelData.fb_pixel_id.trim())) {
      toast.error("Invalid Pixel ID format");
      return;
    }
    setIsTestingPixel(true);
    setPixelTestResult(null);
    try {
      const result = await testPixelConnection(pixelData.fb_pixel_id.trim());
      setPixelTestResult(result ? "success" : "error");
      if (result) {
        toast.success("Pixel connection successful!");
      } else {
        toast.error("Could not verify pixel. Check the ID or try again.");
      }
    } catch {
      setPixelTestResult("error");
      toast.error("Failed to test pixel connection");
    } finally {
      setIsTestingPixel(false);
    }
  };

  const handleTestCapi = async () => {
    setIsTestingCapi(true);
    setCapiTestResult(null);
    try {
      const result = await testCapiEvent();
      setCapiTestResult({
        success: result.success,
        message: result.success
          ? "Test event sent successfully!"
          : result.error || "Failed",
      });
      if (result.success) {
        toast.success("CAPI test event sent!");
      } else {
        toast.error(result.error || "CAPI test failed");
      }
    } catch {
      setCapiTestResult({ success: false, message: "Unexpected error" });
      toast.error("Failed to test CAPI");
    } finally {
      setIsTestingCapi(false);
    }
  };

  if (siteLoading || storeLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {t("admin.settingsTitle")}
      </h1>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store Info
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            {t("admin.globalSettings")}
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-2">
            <Megaphone className="h-4 w-4" />
            Marketing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <StoreSettingsTab
            storeData={storeData}
            setStoreData={setStoreData}
            onSubmit={handleStoreSubmit}
            isPending={updateStoreSettings.isPending}
          />
        </TabsContent>

        <TabsContent value="global">
          <GlobalSettingsTab
            formData={formData}
            setFormData={(partial) => setFormData({ ...formData, ...partial })}
            activeSettings={settings}
            countryOpen={countryOpen}
            setCountryOpen={setCountryOpen}
            currencyOpen={currencyOpen}
            setCurrencyOpen={setCurrencyOpen}
            onCountrySelect={handleCountrySelect}
            onLanguageChange={(lang) =>
              setFormData({ ...formData, language: lang })
            }
            onReset={handleReset}
            onSubmit={handleSiteSubmit}
            isPending={updateSettings.isPending}
            t={t}
          />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeSettingsTab
            formData={formData}
            setFormData={(partial) => setFormData({ ...formData, ...partial })}
            onSubmit={handleSiteSubmit}
            onReset={handleReset}
            isPending={updateSettings.isPending}
          />
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingSettingsTab
            pixelData={pixelData}
            setPixelData={setPixelData}
            isTestingPixel={isTestingPixel}
            pixelTestResult={pixelTestResult}
            onTestPixel={handleTestPixel}
            setPixelTestResult={setPixelTestResult}
            capiToken={capiToken}
            setCapiToken={setCapiToken}
            capiTokenMasked={capiTokenMasked}
            hasCapiToken={hasCapiToken}
            isSavingToken={isSavingToken}
            showTokenInput={showTokenInput}
            setShowTokenInput={setShowTokenInput}
            showTokenValue={showTokenValue}
            setShowTokenValue={setShowTokenValue}
            tokenLastUpdated={tokenLastUpdated}
            onSaveToken={handleSaveToken}
            isTestingCapi={isTestingCapi}
            capiTestResult={capiTestResult}
            onTestCapi={handleTestCapi}
            onSubmit={handlePixelSubmit}
            isPending={updateSettings.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
