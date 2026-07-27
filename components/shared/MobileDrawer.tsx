"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { User } from "@supabase/supabase-js";
import {
  ChevronRight,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ActiveCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  href: string;
}

interface MobileDrawerProps {
  activeCategories: ActiveCategory[];
  whatsappNumber: string;
  storeLogo: string;
  storeName: string;
  isSettingsLoading: boolean;
  wishlistCount: number;
  user: User | null;
  isAdmin: boolean;
  isStaff: boolean;
  signOut: () => void;
  pathname: string;
}

export function MobileDrawer({
  activeCategories,
  whatsappNumber,
  storeLogo,
  storeName,
  isSettingsLoading,
  wishlistCount,
  user,
  isAdmin,
  isStaff,
  signOut,
  pathname,
}: MobileDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-secondary rounded-xl transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-6.5 w-6.5 text-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-xs bg-background p-0 border-r border-border/60">
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-5 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              {isSettingsLoading ? (
                <div className="w-32 h-12 bg-muted/65 animate-pulse rounded-xl" />
              ) : storeLogo ? (
                <Image
                  src={storeLogo}
                  alt={storeName}
                  height={48}
                  width={200}
                  style={{ width: "auto" }}
                  className="h-12 w-auto object-contain rounded-xl"
                />
              ) : (
                <span className="text-xl font-black tracking-tight text-foreground">{storeName}</span>
              )}
            </Link>
          </div>

          {/* Drawer Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Link href="/shop" className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-xs font-bold border border-border/40">
                  <ShoppingBag className="h-4 w-4 text-accent" />
                  <span>Shop All</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href="/wishlist" className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-xs font-bold border border-border/40 justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </SheetClose>
            </div>

            {/* Primary Nav Links */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">Navigation</span>
              <nav className="flex flex-col gap-1 pt-1">
                <SheetClose asChild>
                  <Link href="/" className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-bold transition-all ${pathname === "/" ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"}`}>
                    <div className="flex items-center gap-2.5">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href="/shop" className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-bold transition-all ${pathname === "/shop" ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"}`}>
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="h-4 w-4" />
                      <span>All Products</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href="/track-order" className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-bold transition-all ${pathname === "/track-order" ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"}`}>
                    <div className="flex items-center gap-2.5">
                      <PackageCheck className="h-4 w-4" />
                      <span>Track Order</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </Link>
                </SheetClose>
              </nav>
            </div>

            {/* Categories List */}
            {activeCategories.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-2">Categories</span>
                <nav className="flex flex-col gap-1 pt-1">
                  {activeCategories.map((cat) => (
                    <SheetClose key={cat.id} asChild>
                      <Link
                        href={cat.href}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${pathname.includes(cat.slug) ? "bg-accent text-accent-foreground" : "text-foreground/90 hover:bg-secondary"
                          }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            )}

            {/* WhatsApp Help Banner */}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-[#25D366]/10 text-[#25D366] rounded-xl border border-[#25D366]/20 font-bold text-xs hover:bg-[#25D366]/20 transition-all"
              >
                <MessageCircle className="h-5 w-5 fill-[#25D366] text-white shrink-0" />
                <div>
                  <p className="leading-tight">Need Help?</p>
                  <p className="text-[10px] opacity-80 leading-tight">Chat on WhatsApp</p>
                </div>
              </a>
            )}
          </div>

          {/* Drawer Footer Account CTA */}
          <div className="p-4 border-t border-border/60 bg-secondary/20">
            {user ? (
              <div className="flex items-center justify-between w-full">
                {isAdmin || isStaff ? (
                  <SheetClose asChild>
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-accent">
                      <UserIcon className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SheetClose>
                ) : (
                  <div className="flex flex-col gap-1 text-left">
                    <SheetClose asChild>
                      <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-foreground hover:text-accent">
                        <UserIcon className="h-4 w-4 text-accent shrink-0" />
                        <span>My Dashboard</span>
                      </Link>
                    </SheetClose>
                    <span className="text-[10px] text-muted-foreground ml-6 truncate max-w-[120px]">{user.email}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer ml-auto"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <SheetClose asChild>
                <Link href="/admin/login" className="flex items-center justify-center gap-2 w-full py-2.5 bg-accent text-accent-foreground rounded-xl font-extrabold text-xs shadow-xs hover:bg-accent/90 transition-all">
                  <UserIcon className="h-4 w-4" />
                  <span>Login / Register</span>
                </Link>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
