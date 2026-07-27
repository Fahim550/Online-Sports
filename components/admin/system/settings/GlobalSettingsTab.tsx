import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { countries } from "@/data/countries";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Check,
    ChevronsUpDown,
    Clock,
    DollarSign,
    Eye,
    Globe,
    Languages,
    RotateCcw,
    Save,
} from "lucide-react";

interface GlobalFormData {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyLocale: string;
  language: "en" | "hi" | "bn" | "ar";
  show_stock_to_visitors: boolean;
}

interface ActiveSettings {
  default_country_name: string;
  default_country_code: string;
  currency_symbol: string;
  currency_code: string;
  language: string;
  updated_at?: string;
}

interface Props {
  formData: GlobalFormData;
  setFormData: (data: GlobalFormData) => void;
  activeSettings: ActiveSettings;
  countryOpen: boolean;
  setCountryOpen: (open: boolean) => void;
  currencyOpen: boolean;
  setCurrencyOpen: (open: boolean) => void;
  onCountrySelect: (code: string) => void;
  onLanguageChange: (lang: "en" | "hi" | "bn") => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  t: (key: string) => string;
}

export function GlobalSettingsTab({
  formData,
  setFormData,
  activeSettings,
  countryOpen,
  setCountryOpen,
  currencyOpen,
  setCurrencyOpen,
  onCountrySelect,
  onLanguageChange,
  onReset,
  onSubmit,
  isPending,
  t,
}: Props) {
  const languageOptions = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "bn", name: "Bangla", nativeName: "বাংলা" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Country & Currency */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">{t("admin.globalSettings")}</h2>
        </div>

        <div className="space-y-6">
          {/* Country Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("admin.selectCountry")}{" "}
              <span className="text-destructive">*</span>
            </label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-full justify-between h-10 bg-background"
                >
                  {formData.countryCode
                    ? countries.find((c) => c.code === formData.countryCode)
                        ?.name
                    : t("admin.selectCountry")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 z-50" align="start">
                <Command>
                  <CommandInput placeholder={t("admin.searchCountry")} />
                  <CommandList>
                    <CommandEmpty>{t("admin.noCountryFound")}</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {countries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.name}
                          onSelect={() => onCountrySelect(country.code)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.countryCode === country.code
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex-1">{country.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {country.currencyCode} ({country.currencySymbol})
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Currency Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <label className="block text-sm font-medium">
                {t("admin.currency")}
              </label>
            </div>
            <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={currencyOpen}
                  className="w-full justify-between h-10 bg-background"
                >
                  {formData.currencyCode
                    ? `${formData.currencyCode} (${formData.currencySymbol})`
                    : "Select currency"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 z-50" align="start">
                <Command>
                  <CommandInput placeholder="Search currency..." />
                  <CommandList>
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {(() => {
                        const seen = new Set<string>();
                        return countries
                          .filter((c) => {
                            if (seen.has(c.currencyCode)) return false;
                            seen.add(c.currencyCode);
                            return true;
                          })
                          .sort((a, b) =>
                            a.currencyCode.localeCompare(b.currencyCode),
                          )
                          .map((country) => (
                            <CommandItem
                              key={country.currencyCode}
                              value={`${country.currencyCode} ${country.currencySymbol} ${country.name}`}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  currencyCode: country.currencyCode,
                                  currencySymbol: country.currencySymbol,
                                  currencyLocale: country.currencyLocale,
                                });
                                setCurrencyOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.currencyCode === country.currencyCode
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <span className="font-medium mr-2">
                                {country.currencyCode}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {country.currencySymbol} — {country.name}
                              </span>
                            </CommandItem>
                          ));
                      })()}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {formData.currencyCode} ({formData.currencySymbol}) ·
              Locale: {formData.currencyLocale}
            </p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">{t("admin.websiteLanguage")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {languageOptions.map((lang) => (
            <label
              key={lang.code}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                formData.language === lang.code
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50",
              )}
            >
              <input
                type="radio"
                name="language"
                value={lang.code}
                checked={formData.language === lang.code}
                onChange={() =>
                  onLanguageChange(lang.code as "en" | "hi" | "bn")
                }
                className="w-4 h-4 text-accent"
              />
              <div>
                <p className="font-medium">{lang.nativeName}</p>
                <p className="text-sm text-muted-foreground">{lang.name}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Product Display */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Product Display</h2>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <label className="text-sm font-medium">Show Stock to Visitors</label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Display available stock quantity on product pages
            </p>
          </div>
          <Switch
            checked={formData.show_stock_to_visitors}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, show_stock_to_visitors: checked })
            }
          />
        </div>
      </div>

      {/* Active Settings Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Current Active Settings</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Country</p>
            <p className="font-semibold">
              {activeSettings.default_country_name} (
              {activeSettings.default_country_code})
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Currency</p>
            <p className="font-semibold">
              {activeSettings.currency_symbol} {activeSettings.currency_code}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Language</p>
            <p className="font-semibold">
              {activeSettings.language.toUpperCase()}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
            <p className="font-semibold text-xs">
              {activeSettings.updated_at
                ? format(new Date(activeSettings.updated_at), "PPpp")
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button type="submit" className="btn-accent" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Saving..." : t("admin.saveSettings")}
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t("admin.resetToDefault")}
        </Button>
      </div>
    </form>
  );
}
