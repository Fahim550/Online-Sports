"use client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { initFacebookPixel, trackPageView } from "@/lib/facebook-pixel";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Cookie consent key
const CONSENT_KEY = "fb_pixel_consent";

function hasConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

export function FacebookPixelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const lastPathRef = useRef<string>("");

  // Initialize pixel when settings are loaded (deferred after idle to avoid blocking TBT)
  useEffect(() => {
    if (initializedRef.current) return;

    // Don't load on admin routes
    if (pathname.startsWith("/admin")) return;

    // Check if pixel is enabled
    if (!settings.fb_pixel_enabled || !settings.fb_pixel_id) return;

    // Check consent if required
    if (settings.cookie_consent_enabled && !hasConsent()) return;

    const init = () => {
      try {
        const success = initFacebookPixel(
          settings.fb_pixel_id!,
          settings.fb_pixel_test_event_code,
          settings.fb_capi_enabled || false,
        );

        if (success) {
          initializedRef.current = true;
          trackPageView();
          lastPathRef.current = pathname;
        }
      } catch (error) {
        console.warn("[FB Pixel Provider] Init error:", error);
      }
    };

    // Defer initialization to idle callback or delayed timer so third-party JS doesn't block main thread
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(init, { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(init, 2000);
      return () => clearTimeout(timer);
    }
  }, [settings, pathname]);

  // Track page views on route change
  useEffect(() => {
    if (!initializedRef.current) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname === lastPathRef.current) return;

    lastPathRef.current = pathname;
    trackPageView();
  }, [pathname]);

  return <>{children}</>;
}

// Export consent functions for cookie banner
export function acceptCookieConsent(): void {
  localStorage.setItem(CONSENT_KEY, "accepted");
  window.location.reload();
}

export function declineCookieConsent(): void {
  localStorage.setItem(CONSENT_KEY, "declined");
}

export function getConsentStatus(): "accepted" | "declined" | null {
  const status = localStorage.getItem(CONSENT_KEY);
  if (status === "accepted" || status === "declined") return status;
  return null;
}
