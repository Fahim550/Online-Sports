"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderTimeline } from "../main/OrderTimeline";

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string; badgeBg: string }
> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending Verification", badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  confirmed: { icon: CheckCircle2, color: "text-blue-500", label: "Order Confirmed", badgeBg: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  processing: { icon: PackageCheck, color: "text-purple-500", label: "Packaging & Processing", badgeBg: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  shipped: { icon: Truck, color: "text-indigo-500", label: "In Transit / Shipped", badgeBg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  delivered: { icon: CheckCircle2, color: "text-emerald-500", label: "Successfully Delivered", badgeBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Order Cancelled", badgeBg: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialParam = searchParams.get("orderId") || searchParams.get("phone") || "";

  const { t, formatCurrency } = useSiteSettings();
  const [searchInput, setSearchInput] = useState(initialParam);
  const [submittedQuery, setSubmittedQuery] = useState(initialParam);

  useEffect(() => {
    if (initialParam) {
      setSearchInput(initialParam);
      setSubmittedQuery(initialParam);
    }
  }, [initialParam]);

  const {
    data: order,
    isLoading,
    error,
  } = useOrderTracking(submittedQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSubmittedQuery(searchInput.trim());
    }
  };

  const status = order?.status || "pending";
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header Banner */}
      <div className="border-b border-border/60 bg-muted/20 py-6 mb-8">
        <div className="container-shop">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Order Tracking</span>
          </nav>

          {/* Title & Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  Track Your Order
                </h1>
                <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Live Status Updates
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Simply enter your Phone Number or Order ID to check live order & courier delivery status.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shop max-w-3xl mx-auto space-y-8">
        {/* Simplified Search Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Phone Number or Order ID
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl pl-12 pr-4 py-3 text-base font-medium text-foreground outline-none focus:border-accent transition-colors"
                  placeholder="Enter your phone number (e.g. 017XXXXXXXX) or Order ID"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                💡 Tip: Just enter your 11-digit mobile phone number to find your latest order immediately.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="w-full bg-accent text-accent-foreground hover:opacity-90 font-extrabold h-12 rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>{isLoading ? "Searching Live Order..." : "Check Order Status"}</span>
            </Button>
          </form>
        </div>

        {/* Error Alert */}
        {submittedQuery && error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">No Order Found</p>
              <p className="text-xs opacity-90 mt-0.5">
                {error.message || "Please check your Phone Number and try again."}
              </p>
            </div>
          </div>
        )}

        {/* Order Details Result */}
        {order && (
          <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs space-y-6">
            {/* Live Status Header */}
            <div className="bg-muted/30 border-b border-border/60 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-foreground">
                      Order #{order.order_number}
                    </h2>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeBg}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Total Amount Tag */}
              <div className="text-center md:text-right shrink-0 bg-background px-4 py-2 rounded-xl border border-border/80">
                <span className="text-[11px] text-muted-foreground font-bold uppercase block">Total Amount</span>
                <span className="text-lg font-black text-accent">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Order Timeline Progress */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
                  <span>Order Progress Timeline</span>
                </h3>
                <div className="bg-background border border-border/80 rounded-2xl p-5">
                  <OrderTimeline
                    currentStatus={status}
                    courierStatus={order.courier_status}
                    createdAt={order.created_at}
                    updatedAt={order.updated_at}
                    courierCreatedAt={order.courier_created_at}
                    courierUpdatedAt={order.courier_updated_at}
                  />
                </div>
              </div>

              {/* Courier Tracking Section */}
              {order.courier_tracking_id && (
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-accent flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Courier Shipping Info</span>
                    </h3>
                    <Badge className="bg-accent text-accent-foreground text-[10px] uppercase">
                      {order.courier_provider || "Courier Partner"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium pt-1">
                    <div>
                      <span className="text-muted-foreground block">Tracking ID:</span>
                      <span className="font-mono font-bold text-foreground">{order.courier_tracking_id}</span>
                    </div>

                    {order.courier_consignment_id && (
                      <div>
                        <span className="text-muted-foreground block">Consignment ID:</span>
                        <span className="font-mono font-bold text-foreground">{order.courier_consignment_id}</span>
                      </div>
                    )}

                    {order.courier_status && (
                      <div>
                        <span className="text-muted-foreground block">Courier Status:</span>
                        <span className="font-bold text-accent">{order.courier_status}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address & Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background border border-border/80 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-accent" />
                    Customer Details
                  </h4>
                  <p className="text-xs font-bold text-foreground">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{order.customer_phone}</p>
                </div>

                <div className="bg-background border border-border/80 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    Delivery Address
                  </h4>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {order.shipping_address}
                    {order.shipping_city !== "-" && `, ${order.shipping_city}`}
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
                  Ordered Items ({order.order_items?.length || 0})
                </h3>

                <div className="bg-background border border-border/80 rounded-2xl divide-y divide-border/60">
                  {Object.values(
                    order.order_items?.reduce((acc: any, item: any) => {
                      const color = item.variant_info?.color || "";
                      const fabric = item.variant_info?.fabric || "";
                      const key = `${item.product_id}-${color}-${fabric}-${item.price}`;

                      if (!acc[key]) {
                        const baseName = item.product_name.includes(" (")
                          ? item.product_name.substring(0, item.product_name.lastIndexOf(" ("))
                          : item.product_name;

                        acc[key] = {
                          ...item,
                          product_name: baseName || item.product_name,
                          grouped_sizes: [],
                          total_quantity: 0,
                          group_total_price: 0,
                        };
                      }

                      if (item.variant_info?.size) {
                        acc[key].grouped_sizes.push({ size: item.variant_info.size, qty: item.quantity });
                      }

                      acc[key].total_quantity += item.quantity;
                      acc[key].group_total_price += item.price * item.quantity;

                      return acc;
                    }, {}) || {}
                  ).map((item: any, index: number) => (
                    <div key={item.id || index} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product_image && (
                          <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden shrink-0 relative border border-border/60">
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{item.product_name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.variant_info?.color && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px]">
                                <span className="font-medium text-muted-foreground">Color:</span>
                                <span className="font-semibold">{item.variant_info.color}</span>
                              </span>
                            )}
                            {item.variant_info?.fabric && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px]">
                                <span className="font-medium text-muted-foreground">Fabric:</span>
                                <span className="font-semibold">{item.variant_info.fabric}</span>
                              </span>
                            )}
                          </div>
                          {item.grouped_sizes?.length > 0 && (
                            <div className="mt-1 text-[10px] flex flex-wrap items-center gap-1">
                              <span className="text-muted-foreground font-medium">Sizes:</span>
                              {item.grouped_sizes.map((s: any, idx: number) => (
                                <span key={idx} className="font-bold text-foreground">
                                  {s.size} <span className="text-muted-foreground font-normal">({s.qty})</span>{idx < item.grouped_sizes.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-1">Qty: {item.total_quantity} × {formatCurrency(item.price)}</p>
                        </div>
                      </div>

                      <span className="font-bold text-xs text-foreground shrink-0">
                        {formatCurrency(item.group_total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Breakdown */}
              <div className="bg-background border border-border/80 rounded-2xl p-5 space-y-2.5 text-xs font-medium">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-foreground">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <hr className="border-border/60 my-2" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-foreground">Total Amount</span>
                  <span className="text-accent font-extrabold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
