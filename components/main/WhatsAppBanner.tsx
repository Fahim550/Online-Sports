"use client";

import { useStoreSettings } from "@/hooks/useStoreSettings";
import { MessageCircle } from "lucide-react";

export function WhatsAppBanner({ className }: { className?: string }) {
  const { data: storeSettings, isLoading } = useStoreSettings();

  // Show nothing while loading
  if (isLoading) return null;

  const enabled = storeSettings?.whatsapp_banner_enabled === "true";
  const title =
    storeSettings?.whatsapp_banner_title ||
    "Have questions? Chat with us on WhatsApp!";
  const number = storeSettings?.whatsapp_banner_number || storeSettings?.whatsapp_number || "";

  // Only hide if explicitly disabled
  if (!enabled) return null;

  const cleanNumber = number.replace(/[^0-9]/g, "");
  const waUrl = cleanNumber ? `https://wa.me/${cleanNumber}` : undefined;

  const btnContent = (
    <div
      id="whatsapp-banner-cta"
      style={{
        position: "relative" as const,
        zIndex: 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.65rem 1.4rem",
        background: "#fff",
        color: "#075e54",
        fontWeight: 800,
        fontSize: "0.875rem",
        borderRadius: 999,
        whiteSpace: "nowrap" as const,
        // boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        flexShrink: 0,
        cursor: waUrl ? "pointer" : "default",
        opacity: waUrl ? 1 : 0.7,
        textDecoration: "none",
      }}
    >
      <MessageCircle style={{ width: 18, height: 18 }} />
      <span>WhatsApp করুন</span>
    </div>
  );

  return (
    <div className={className !== undefined ? className : "w-full py-6 px-4"}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap" as const,
          background:
            "linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%)",
          borderRadius: "1.25rem",
          padding: "1.5rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          boxShadow:
            "0 8px 32px rgba(37, 211, 102, 0.25), 0 2px 8px rgba(0,0,0,0.15)",
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
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

        {/* Icon bubble */}
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            position: "relative" as const,
            zIndex: 1,
          }}
        >
          <MessageCircle style={{ width: 28, height: 28, color: "#fff" }} />
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            minWidth: 160,
            position: "relative" as const,
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 0.2rem",
              lineHeight: 1.3,
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.82)",
              margin: 0,
              fontWeight: 500,
            }}
          >
            আমরা সাহায্য করতে প্রস্তুত — WhatsApp এ message করুন!
          </p>
        </div>

        {/* CTA Button — linked if number exists, plain div otherwise */}
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "relative" as const,
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.65rem 1.4rem",
              background: "#fff",
              color: "#075e54",
              fontWeight: 800,
              fontSize: "0.875rem",
              borderRadius: 999,
              whiteSpace: "nowrap" as const,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              flexShrink: 0,
              textDecoration: "none",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.15)";
            }}
          >
            <MessageCircle style={{ width: 18, height: 18 }} />
            <span>WhatsApp করুন</span>
          </a>
        ) : (
          btnContent
        )}
      </div>
    </div>
  );
}
