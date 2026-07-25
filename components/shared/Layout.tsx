"use client";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppBanner } from "@/components/main/WhatsAppBanner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/login");
    
  const showBanner = 
    pathname === "/" || 
    pathname === "/shop" || 
    pathname?.startsWith("/product/");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdmin && showBanner && <WhatsAppBanner />}
      {!isAdmin && <Footer />}
    </div>
  );
}
// Force Next.js re-evaluation of layout after removing TopBar
