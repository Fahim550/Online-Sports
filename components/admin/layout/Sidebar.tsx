"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ADMIN_NAVIGATION } from "@/config/admin-nav";
import { useAuth } from "@/hooks/useAuth";
import { getSidebarItems } from "@/lib/permission";
import { ChevronRight, LogOut, Store } from "lucide-react";

const allItems = ADMIN_NAVIGATION;

interface Props {
  mobile?: boolean;
  closeSidebar?: () => void;
}

export function AdminSidebar({ mobile, closeSidebar }: Props) {
  const pathname = usePathname();
  const { user, signOut, userRole, isAdmin } = useAuth();
  const router = useRouter();

  // const sidebarItems = allItems.filter((item) =>
  //   item.roles.includes(userRole || ""),
  // );
  const sidebarItems = getSidebarItems("admin");
  console.log("sidebar", sidebarItems);

  const sections = ["Main", "Store", "System"] as const;
  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <aside
      className={`
      w-[280px]
      h-screen
      border-r
      bg-card
      flex
      flex-col
    `}
    >
      <div className="h-16 border-b flex items-center px-6">
        <h2 className="font-bold text-xl">STORE ADMIN</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-4">
        {sections.map((section) => {
          const items = sidebarItems.filter((i) => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section}>
              <p className="px-3 mb-3 mt-2 text-md font-semibold text-muted-foreground uppercase tracking-widest">
                {section}
              </p>

              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => closeSidebar?.()}
                      className={`
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-lg
                        transition-colors

                        ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />

                      <span>{item.name}</span>

                      {active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="border-t p-4">
        <Link
          href="/"
          className="
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-lg
  hover:bg-muted
"
        >
          <Store className="h-5 w-5" />
          <span>Back to Store</span>
        </Link>
        <button
          className="
            flex
            items-center
            gap-3
            text-red-500
            w-full
            px-4
            py-3
            rounded-lg
            hover:bg-red-50
          "
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
