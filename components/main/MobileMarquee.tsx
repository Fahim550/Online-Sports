"use client";
import React from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { usePathname } from "next/navigation";

export function MobileMarquee() {
  const { data: storeSettings, isLoading } = useStoreSettings();
  const pathname = usePathname();

  // Hide on product detail pages
  if (pathname?.startsWith("/product/") || pathname?.startsWith("/products/")) {
    return null;
  }

  if (isLoading || !storeSettings) return null;

  if (storeSettings.mobile_marquee_enabled !== "true") return null;

  const text = storeSettings.mobile_marquee_text?.trim();
  if (!text) return null;

  return (
    <>
      {/* Spacer to prevent covering footer on mobile. We use bg-foreground to blend seamlessly with the footer */}
      <div className="md:hidden h-[50px] w-full flex-shrink-0 bg-foreground" />
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-accent text-accent-foreground py-3 overflow-hidden border-t border-accent/20 z-[100]">
        <div className="w-full relative flex items-center whitespace-nowrap">
          {/* We use a CSS animation to scroll the text. We duplicate the text to ensure a seamless loop. */}
          <div className="animate-marquee inline-block text-[15px] font-bold tracking-wide">
            <span className="mx-8">{text}</span>
            <span className="mx-8">{text}</span>
            <span className="mx-8">{text}</span>
            <span className="mx-8">{text}</span>
          </div>
        </div>
      </div>
    </>
  );
}
