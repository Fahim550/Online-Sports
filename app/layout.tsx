import { Providers } from "@/components/Providers";
import { Layout } from "@/components/shared/Layout";
import { createClient } from "@/utils/supabase/client";
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://suyeb-online-sports.vercel.app"), // Replace with actual production domain when available
  title: {
    template: "%s | Suyeb Online Sports",
    default: "Suyeb Online Sports | Premium Sports Gear & Clothing",
  },
  description:
    "Find premium sports gear, clothing, and equipment at Suyeb Online Sports. Fast shipping and 100% genuine products.",
  keywords: ["Sports Gear", "Sports Clothing", "Online Sports Shop", "Suyeb Sports", "Fitness Equipment", "Athletic Wear", "Bangladesh Sports Shop"],
  authors: [{ name: "Suyeb Online Sports" }],
  creator: "SoftZeniq IT",
  publisher: "Suyeb Online Sports",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Suyeb Online Sports | Premium Sports Gear",
    description: "Your ultimate destination for authentic sports gear, apparel, and accessories.",
    url: "/",
    siteName: "Suyeb Online Sports",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suyeb Online Sports | Premium Sports Gear",
    description: "Your premium destination for authentic sports gear, apparel, and accessories.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Helper function to convert hex color to HSL string
function hexToHSL(hex: string): string {
  if (!hex) return "";
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map(char => char + char).join("");
  }
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
  if (!hex) return "0 0% 100%";
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map(char => char + char).join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? "220 20% 12%" : "0 0% 100%";
}

const defaultSettings = {
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let activeSettings = defaultSettings;

  try {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (settings) {
      activeSettings = {
        theme_accent_color: settings.theme_accent_color || defaultSettings.theme_accent_color,
        brand_primary: settings.brand_primary || defaultSettings.brand_primary,
        brand_secondary: settings.brand_secondary || defaultSettings.brand_secondary,
        brand_accent: settings.brand_accent || defaultSettings.brand_accent,
        brand_background: settings.brand_background || defaultSettings.brand_background,
        brand_foreground: settings.brand_foreground || defaultSettings.brand_foreground,
        brand_muted: settings.brand_muted || defaultSettings.brand_muted,
        brand_border: settings.brand_border || defaultSettings.brand_border,
        brand_card: settings.brand_card || defaultSettings.brand_card,
        brand_radius: settings.brand_radius || defaultSettings.brand_radius,
      };
    }
  } catch (error) {
    console.error("Failed to fetch site settings for SSR theme:", error);
  }

  const accentColor = activeSettings.brand_accent || activeSettings.theme_accent_color;
  const accentHsl = hexToHSL(accentColor);
  const primaryHsl = hexToHSL(activeSettings.brand_primary);
  const secondaryHsl = hexToHSL(activeSettings.brand_secondary);
  const backgroundHsl = hexToHSL(activeSettings.brand_background);
  const foregroundHsl = hexToHSL(activeSettings.brand_foreground);
  const mutedHsl = hexToHSL(activeSettings.brand_muted);
  const borderHsl = hexToHSL(activeSettings.brand_border);
  const cardHsl = hexToHSL(activeSettings.brand_card);

  const cssVariables = `
    :root {
      --accent: ${accentHsl};
      --ring: ${accentHsl};
      --sidebar-ring: ${accentHsl};
      --accent-foreground: ${getContrastForeground(accentColor)};
      --gradient-accent: linear-gradient(135deg, hsl(${accentHsl}) 0%, hsl(${accentHsl}) 100%);
      --primary: ${primaryHsl};
      --sidebar-primary: ${primaryHsl};
      --primary-foreground: ${getContrastForeground(activeSettings.brand_primary)};
      --sidebar-primary-foreground: ${getContrastForeground(activeSettings.brand_primary)};
      --secondary: ${secondaryHsl};
      --sidebar-accent: ${secondaryHsl};
      --secondary-foreground: ${getContrastForeground(activeSettings.brand_secondary)};
      --background: ${backgroundHsl};
      --sidebar-background: ${backgroundHsl};
      --foreground: ${foregroundHsl};
      --sidebar-foreground: ${foregroundHsl};
      --muted-foreground: ${mutedHsl};
      --border: ${borderHsl};
      --input: ${borderHsl};
      --sidebar-border: ${borderHsl};
      --card: ${cardHsl};
      --popover: ${cardHsl};
      --card-foreground: ${getContrastForeground(activeSettings.brand_card)};
      --popover-foreground: ${getContrastForeground(activeSettings.brand_card)};
      --radius: ${activeSettings.brand_radius}rem;
    }
  `;

  return (
    <html
      lang="en"
      className={`${inter.variable}  ${sora.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('site-theme-colors');
                if (theme) {
                  const colors = JSON.parse(theme);
                  const root = document.documentElement;
                  for (const [key, val] of Object.entries(colors)) {
                    root.style.setProperty(key, val);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
