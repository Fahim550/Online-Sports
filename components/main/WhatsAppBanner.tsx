"use client";

import { useStoreSettings } from "@/hooks/useStoreSettings";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function WhatsAppBanner({ className }: { className?: string }) {
  const { data: storeSettings, isLoading } = useStoreSettings();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Reset state on route change
    setIsOpen(false);

    if (storeSettings?.whatsapp_banner_enabled !== "true") return;

    if (pathname === "/") {
      const handleScroll = () => {
        if (window.scrollY > 400) {
          setIsOpen(true);
          window.removeEventListener("scroll", handleScroll);
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else if (pathname === "/shop") {
      const timer = setTimeout(() => setIsOpen(true), 3500);
      return () => clearTimeout(timer);
    } else if (pathname?.startsWith("/product/") || pathname?.startsWith("/products/")) {
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [pathname, storeSettings?.whatsapp_banner_enabled]);

  // Recurring popup every 20 seconds on any page
  useEffect(() => {
    if (storeSettings?.whatsapp_banner_enabled !== "true") return;

    const interval = setInterval(() => {
      setIsOpen(true);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [storeSettings?.whatsapp_banner_enabled]);

  if (isLoading || !isOpen) return null;

  const title =
    storeSettings?.whatsapp_banner_title ||
    "Have questions? Chat with us on WhatsApp!";
  const number =
    storeSettings?.whatsapp_banner_number || storeSettings?.whatsapp_number || "";

  const cleanNumber = number.replace(/[^0-9]/g, "");
  const waUrl = cleanNumber ? `https://wa.me/${cleanNumber}` : undefined;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="w-full max-w-md relative overflow-hidden rounded-[1.25rem] shadow-2xl animate-in zoom-in-95 duration-300"
        style={{
          background: "linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: -80,
            right: 60,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            bottom: -60,
            left: "40%",
            filter: "blur(35px)",
            pointerEvents: "none",
          }}
        />

        <div className="p-6 relative z-1 flex flex-col items-center text-center">
          {/* Icon bubble */}
          <div
            className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
              border: "1.5px solid rgba(255,255,255,0.25)",
            }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </div>

          {/* Text */}
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white mb-2 leading-tight drop-shadow-sm">
              {title}
            </h3>
            <p className="text-sm text-white/90 font-medium">
              আমরা সাহায্য করতে প্রস্তুত — WhatsApp এ message করুন!
            </p>
          </div>

          {/* CTA Button */}
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#075e54] font-extrabold text-[15px] rounded-full shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
              onClick={() => setIsOpen(false)} // Optionally close after clicking
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp করুন</span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 text-[#075e54] font-extrabold text-[15px] rounded-full cursor-not-allowed">
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp করুন</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
